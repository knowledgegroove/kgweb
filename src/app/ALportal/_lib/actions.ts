"use server";

// Every mutation re-checks who is signed in and what their role allows. Never trust the client.
import { query } from "./db";
import { devTestRoles, getViewer } from "./portal";
import { sendSessionConfirmation, type EmailStatus } from "./email";
import { SUBJECT_SET } from "./subjects";
import {
  SESSION_DURATIONS,
  WINDOW_LABEL,
  isValidDuration,
  isValidStart,
  schoolTimeToUtc,
  timeToMinutes,
} from "./schedule";
import type { ActionResult, Viewer } from "./types";

const fail = (error: string) => ({ ok: false as const, error });

async function requireRole<R extends NonNullable<Viewer["role"]>>(role: R) {
  const viewer = await getViewer();
  if (!viewer) return { viewer: null, error: "Please sign in again." };
  if (viewer.role !== role) return { viewer: null, error: `Only ${role}s can do that.` };
  return { viewer: viewer as Viewer & { role: R }, error: null };
}

const cleanName = (s: unknown) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, 60) : "");

function cleanSubjects(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  const list = [...new Set(input.filter((s): s is string => typeof s === "string"))];
  return list.every((s) => SUBJECT_SET.has(s)) ? list : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Account setup ----------

export async function setupProfile(input: {
  role: "tutor" | "student";
  name: string;
  subjects?: string[];
}): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return fail("Please sign in again.");
  if (viewer.role !== null) return fail("Your account is already set up.");
  if (input.role !== "tutor" && input.role !== "student") return fail("Choose tutor or student.");
  if (input.role === "tutor" && viewer.isGuest && !devTestRoles) return fail("Tutors need to sign in with Google.");

  const name = cleanName(input.name);
  if (name.length < 2) return fail("Please enter your name.");

  let subjects: string[] = [];
  if (input.role === "tutor") {
    const cleaned = cleanSubjects(input.subjects);
    if (!cleaned || cleaned.length === 0) return fail("Pick at least one subject you can tutor.");
    if (cleaned.length > 10) return fail("Pick up to 10 subjects.");
    subjects = cleaned;
  }

  await query(
    `INSERT INTO alp_users (id, email, name, role, is_guest) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [viewer.id, viewer.email, name, input.role, viewer.isGuest],
  );
  for (const subject of subjects) {
    await query(
      "INSERT INTO alp_tutor_subjects (tutor_id, subject) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [viewer.id, subject],
    );
  }
  return { ok: true };
}

// ---------- Tutor ----------

export async function requestSubjects(subjectsInput: string[]): Promise<ActionResult> {
  const { viewer, error } = await requireRole("tutor");
  if (!viewer) return fail(error);
  const subjects = cleanSubjects(subjectsInput);
  if (!subjects || subjects.length === 0) return fail("Pick at least one subject.");
  for (const subject of subjects) {
    await query(
      "INSERT INTO alp_tutor_subjects (tutor_id, subject) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [viewer.id, subject],
    );
  }
  return { ok: true };
}

export async function createSession(input: {
  subject: string;
  /** Pacific date, "YYYY-MM-DD". */
  date: string;
  /** Pacific start time, "HH:MM" (24h). */
  startTime: string;
  durationMin: number;
  capacity: number;
  meetLink: string;
  notes?: string;
}): Promise<ActionResult<{ id: string }>> {
  const { viewer, error } = await requireRole("tutor");
  if (!viewer) return fail(error);

  const approved = await query(
    "SELECT 1 FROM alp_tutor_subjects WHERE tutor_id = $1 AND subject = $2 AND status = 'approved'",
    [viewer.id, input.subject],
  );
  if (approved.length === 0) return fail("You can only schedule sessions for subjects the coordinator approved.");

  const durationMin = Number(input.durationMin);
  if (!isValidDuration(durationMin)) return fail(`Length must be ${SESSION_DURATIONS.join(", ")} minutes.`);
  const startMin = timeToMinutes(String(input.startTime));
  if (startMin === null || !isValidStart(startMin, durationMin)) {
    return fail(`Sessions must start and end between ${WINDOW_LABEL}.`);
  }
  const start = schoolTimeToUtc(String(input.date), startMin);
  if (!start || Number.isNaN(start.getTime())) return fail("Pick a date.");
  if (start.getTime() < Date.now() - 5 * 60_000) return fail("That time is in the past.");
  if (start.getTime() > Date.now() + 90 * 86_400_000) return fail("Sessions can be scheduled up to 90 days ahead.");

  const capacity = Math.round(Number(input.capacity));
  if (!(capacity >= 1 && capacity <= 50)) return fail("Capacity must be 1–50 students.");

  let meetLink: string;
  try {
    const url = new URL(input.meetLink.trim());
    if (url.protocol !== "https:") throw new Error();
    meetLink = url.toString();
  } catch {
    return fail("Paste a full Google Meet link, e.g. https://meet.google.com/abc-defg-hij");
  }

  const notes = typeof input.notes === "string" ? input.notes.trim().slice(0, 500) || null : null;
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO alp_sessions (id, tutor_id, subject, starts_at, duration_min, capacity, meet_link, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, viewer.id, input.subject, start.toISOString(), durationMin, capacity, meetLink, notes],
  );
  return { ok: true, id };
}

export async function cancelSession(sessionId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer || (viewer.role !== "tutor" && viewer.role !== "coordinator")) return fail("Not allowed.");
  const rows = await query(
    `UPDATE alp_sessions SET cancelled_at = now()
     WHERE id = $1 AND cancelled_at IS NULL AND ($2 OR tutor_id = $3) RETURNING id`,
    [sessionId, viewer.role === "coordinator", viewer.id],
  );
  return rows.length ? { ok: true } : fail("Session not found or already cancelled.");
}

// ---------- Student ----------

export async function joinSession(
  sessionId: string,
  emailInput?: string,
): Promise<ActionResult<{ email: string; emailStatus: EmailStatus }>> {
  const { viewer, error } = await requireRole("student");
  if (!viewer) return fail(error);

  const email = (viewer.email ?? (typeof emailInput === "string" ? emailInput : "")).trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) return fail("Enter a valid email for your confirmation.");

  // Single statement so two students can't grab the last seat at the same time.
  const inserted = await query(
    `INSERT INTO alp_signups (session_id, student_id, student_name, student_email)
     SELECT s.id, $2, $3, $4 FROM alp_sessions s
     WHERE s.id = $1 AND s.cancelled_at IS NULL AND s.starts_at + (s.duration_min || ' minutes')::interval > now()
       AND (SELECT count(*) FROM alp_signups x WHERE x.session_id = s.id) < s.capacity
     ON CONFLICT (session_id, student_id) DO NOTHING
     RETURNING session_id`,
    [sessionId, viewer.id, viewer.name, email],
  );

  if (inserted.length === 0) {
    const [state] = await query<{ joined: boolean; full: boolean; open: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM alp_signups WHERE session_id = s.id AND student_id = $2) AS joined,
              (SELECT count(*) FROM alp_signups WHERE session_id = s.id) >= s.capacity AS full,
              s.cancelled_at IS NULL AS open
       FROM alp_sessions s WHERE s.id = $1`,
      [sessionId, viewer.id],
    );
    if (!state) return fail("That session no longer exists.");
    if (state.joined) return fail("You've already joined this session.");
    if (!state.open) return fail("That session was cancelled.");
    if (state.full) return fail("Sorry — that session just filled up.");
    return fail("That session has already ended.");
  }

  const [s] = await query<{
    subject: string;
    starts_at: string | Date;
    duration_min: number;
    meet_link: string;
    notes: string | null;
    tutor_name: string;
  }>(
    `SELECT s.subject, s.starts_at, s.duration_min, s.meet_link, s.notes, u.name AS tutor_name
     FROM alp_sessions s JOIN alp_users u ON u.id = s.tutor_id WHERE s.id = $1`,
    [sessionId],
  );
  const emailStatus = await sendSessionConfirmation({
    sessionId,
    to: email,
    studentName: viewer.name,
    tutorName: s.tutor_name,
    subject: s.subject,
    startsAt: new Date(s.starts_at),
    durationMin: s.duration_min,
    meetLink: s.meet_link,
    notes: s.notes,
  });
  await query("UPDATE alp_signups SET email_status = $3 WHERE session_id = $1 AND student_id = $2", [
    sessionId,
    viewer.id,
    emailStatus,
  ]);
  return { ok: true, email, emailStatus };
}

export async function leaveSession(sessionId: string): Promise<ActionResult> {
  const { viewer, error } = await requireRole("student");
  if (!viewer) return fail(error);
  await query("DELETE FROM alp_signups WHERE session_id = $1 AND student_id = $2", [sessionId, viewer.id]);
  return { ok: true };
}

// ---------- Coordinator ----------

export async function setSubjectApproval(
  tutorId: string,
  subject: string,
  decision: "approve" | "revoke" | "decline",
): Promise<ActionResult> {
  const { viewer, error } = await requireRole("coordinator");
  if (!viewer) return fail(error);
  if (decision === "decline") {
    await query("DELETE FROM alp_tutor_subjects WHERE tutor_id = $1 AND subject = $2", [tutorId, subject]);
  } else {
    await query("UPDATE alp_tutor_subjects SET status = $3 WHERE tutor_id = $1 AND subject = $2", [
      tutorId,
      subject,
      decision === "approve" ? "approved" : "pending",
    ]);
  }
  return { ok: true };
}
