// Server-side helpers: who is signed in, and what data they're allowed to see.
import { auth } from "./auth";
import { query, toIso } from "./db";
import type { PortalData, PortalSession, Role, SessionSignup, TutorInfo, TutorSubject, Viewer } from "./types";

const coordinatorEmails = () =>
  new Set(
    (process.env.COORDINATOR_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

/**
 * Local testing only (never in production builds): with ALP_DEV_TEST_ROLES=1, guests may register as
 * tutors, and a guest named exactly "Coordinator" gets the coordinator role.
 */
export const devTestRoles = process.env.NODE_ENV !== "production" && process.env.ALP_DEV_TEST_ROLES === "1";

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string | null; name?: string | null; isGuest?: boolean }
    | undefined;
  if (!user?.id) return null;

  const email = user.email ? user.email.toLowerCase() : null;
  const isGuest = Boolean(user.isGuest);
  const base = { id: user.id, email, isGuest, name: user.name || email || "Guest" };

  if ((!isGuest && email && coordinatorEmails().has(email)) || (devTestRoles && isGuest && user.name === "Coordinator")) {
    return { ...base, role: "coordinator" };
  }

  const rows = await query<{ name: string; role: Role }>(
    "SELECT name, role FROM alp_users WHERE id = $1",
    [user.id],
  );
  if (rows.length === 0) return { ...base, role: null };
  return { ...base, name: rows[0].name, role: rows[0].role };
}

type SessionRow = {
  id: string;
  tutor_id: string;
  tutor_name: string;
  subject: string;
  starts_at: string | Date;
  duration_min: number;
  capacity: number;
  meet_link: string;
  notes: string | null;
  cancelled_at: string | Date | null;
  signup_count: number;
};

const SESSION_SELECT = `
  SELECT s.id, s.tutor_id, u.name AS tutor_name, s.subject, s.starts_at, s.duration_min, s.capacity,
         s.meet_link, s.notes, s.cancelled_at,
         (SELECT count(*)::int FROM alp_signups x WHERE x.session_id = s.id) AS signup_count
  FROM alp_sessions s JOIN alp_users u ON u.id = s.tutor_id`;

function mapSession(r: SessionRow, showLink: boolean): PortalSession {
  return {
    id: r.id,
    tutorId: r.tutor_id,
    tutorName: r.tutor_name,
    subject: r.subject,
    startsAt: toIso(r.starts_at),
    durationMin: r.duration_min,
    capacity: r.capacity,
    meetLink: showLink ? r.meet_link : null,
    notes: r.notes,
    cancelled: r.cancelled_at !== null,
    signupCount: Number(r.signup_count),
  };
}

async function signupsBySession(sessionIds: string[]): Promise<Map<string, SessionSignup[]>> {
  const map = new Map<string, SessionSignup[]>();
  if (sessionIds.length === 0) return map;
  const rows = await query<{
    session_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    created_at: string | Date;
  }>(
    `SELECT session_id, student_id, student_name, student_email, created_at
     FROM alp_signups WHERE session_id = ANY($1::text[]) ORDER BY created_at`,
    [sessionIds],
  );
  for (const r of rows) {
    const list = map.get(r.session_id) ?? [];
    list.push({ studentId: r.student_id, name: r.student_name, email: r.student_email, joinedAt: toIso(r.created_at) });
    map.set(r.session_id, list);
  }
  return map;
}

// Sessions stay visible until they've ended (plus a short grace period), and for a week in staff views.
const STUDENT_WINDOW = "s.starts_at + (s.duration_min || ' minutes')::interval > now()";
const STAFF_WINDOW = "s.starts_at > now() - interval '7 days'";

export async function loadPortalData(viewer: Viewer): Promise<PortalData> {
  switch (viewer.role) {
    case null:
      return { viewer: { ...viewer, role: null }, canRegisterAsTutor: !viewer.isGuest || devTestRoles };

    case "student": {
      const rows = await query<SessionRow & { joined: boolean }>(
        `${SESSION_SELECT.replace(
          "AS signup_count",
          "AS signup_count, EXISTS (SELECT 1 FROM alp_signups y WHERE y.session_id = s.id AND y.student_id = $1) AS joined",
        )}
         WHERE ${STUDENT_WINDOW}
           AND (s.cancelled_at IS NULL OR EXISTS (SELECT 1 FROM alp_signups z WHERE z.session_id = s.id AND z.student_id = $1))
         ORDER BY s.starts_at`,
        [viewer.id],
      );
      return {
        viewer: { ...viewer, role: "student" },
        sessions: rows.map((r) => ({ ...mapSession(r, Boolean(r.joined)), joined: Boolean(r.joined) })),
      };
    }

    case "tutor": {
      const [subjects, rows] = await Promise.all([
        query<TutorSubject>(
          "SELECT subject, status FROM alp_tutor_subjects WHERE tutor_id = $1 ORDER BY subject",
          [viewer.id],
        ),
        query<SessionRow>(`${SESSION_SELECT} WHERE s.tutor_id = $1 AND ${STAFF_WINDOW} ORDER BY s.starts_at`, [
          viewer.id,
        ]),
      ]);
      const signups = await signupsBySession(rows.map((r) => r.id));
      return {
        viewer: { ...viewer, role: "tutor" },
        subjects,
        sessions: rows.map((r) => ({ ...mapSession(r, true), signups: signups.get(r.id) ?? [] })),
      };
    }

    case "coordinator": {
      const [tutorRows, subjectRows, rows, students] = await Promise.all([
        query<{ id: string; name: string; email: string | null; created_at: string | Date }>(
          "SELECT id, name, email, created_at FROM alp_users WHERE role = 'tutor' ORDER BY name",
        ),
        query<{ tutor_id: string; subject: string; status: TutorSubject["status"] }>(
          "SELECT tutor_id, subject, status FROM alp_tutor_subjects ORDER BY subject",
        ),
        query<SessionRow>(`${SESSION_SELECT} WHERE ${STAFF_WINDOW} ORDER BY s.starts_at`),
        query<{ n: number }>("SELECT count(*)::int AS n FROM alp_users WHERE role = 'student'"),
      ]);
      const signups = await signupsBySession(rows.map((r) => r.id));
      const tutors: TutorInfo[] = tutorRows.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        joinedAt: toIso(t.created_at),
        subjects: subjectRows
          .filter((s) => s.tutor_id === t.id)
          .map((s) => ({ subject: s.subject, status: s.status })),
      }));
      return {
        viewer: { ...viewer, role: "coordinator" },
        tutors,
        sessions: rows.map((r) => ({ ...mapSession(r, true), signups: signups.get(r.id) ?? [] })),
        studentCount: Number(students[0]?.n ?? 0),
      };
    }
  }
}
