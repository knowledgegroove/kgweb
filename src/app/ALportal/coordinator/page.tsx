"use client";

import { useState } from "react";
import { CalendarCheck, Check, GraduationCap, ShieldAlert, Users, Video, X } from "lucide-react";
import { usePortal } from "../_lib/portal-client";
import { cancelSession, resetPilotData, setSubjectApproval } from "../_lib/actions";
import type { PortalSession, TutorInfo } from "../_lib/types";
import { RoleGate } from "../_components/RoleGate";
import { Avatar, Card, EmptyState, PageHeader, StatCard, SubjectPill } from "../_components/ui";
import { formatSessionTime, isUpcoming } from "../_lib/format";

export default function CoordinatorPage() {
  return (
    <RoleGate role="coordinator">
      {(data) => <CoordinatorDashboard tutors={data.tutors} sessions={data.sessions} studentCount={data.studentCount} />}
    </RoleGate>
  );
}

function CoordinatorDashboard({
  tutors,
  sessions,
  studentCount,
}: {
  tutors: TutorInfo[];
  sessions: PortalSession[];
  studentCount: number;
}) {
  const pending = tutors.flatMap((t) =>
    t.subjects.filter((s) => s.status === "pending").map((s) => ({ tutor: t, subject: s.subject })),
  );
  const upcoming = sessions.filter((s) => !s.cancelled && isUpcoming(s));
  const earlier = sessions.filter((s) => s.cancelled || !isUpcoming(s)).reverse();
  const signups = upcoming.reduce((n, s) => n + s.signupCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Coordinator Dashboard"
        description="Approve tutor subjects and watch sessions and sign-ups as they happen. Updates live."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tutors" value={tutors.length} icon={Users} />
        <StatCard
          label="Pending approvals"
          value={pending.length}
          tone={pending.length ? "amber" : "default"}
          icon={ShieldAlert}
        />
        <StatCard label="Upcoming sessions" value={upcoming.length} icon={CalendarCheck} />
        <StatCard
          label="Student sign-ups"
          value={signups}
          tone="green"
          sublabel={`${studentCount} student account${studentCount === 1 ? "" : "s"}`}
          icon={GraduationCap}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Subject approvals</h2>
          {pending.length === 0 ? (
            <EmptyState title="Nothing to approve" description="New tutor subject requests appear here automatically." />
          ) : (
            <Card className="divide-y divide-slate-100">
              {pending.map(({ tutor, subject }) => (
                <ApprovalRow key={`${tutor.id}:${subject}`} tutor={tutor} subject={subject} />
              ))}
            </Card>
          )}

          <h2 className="mb-3 mt-8 text-base font-semibold text-slate-900">Tutors</h2>
          {tutors.length === 0 ? (
            <EmptyState title="No tutors yet" description="Tutors appear here after they sign in and set up their account." />
          ) : (
            <div className="space-y-3">
              {tutors.map((t) => (
                <TutorRow key={t.id} tutor={t} />
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-3">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <EmptyState title="No sessions scheduled" description="When a tutor posts a session, it shows up here." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          )}
          {earlier.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-slate-500">
                Past &amp; cancelled this week ({earlier.length})
              </summary>
              <div className="mt-3 space-y-3 opacity-70">
                {earlier.map((s) => (
                  <SessionRow key={s.id} session={s} readOnly />
                ))}
              </div>
            </details>
          )}
        </section>
      </div>

      <ResetPilotCard />
    </div>
  );
}

function ApprovalRow({ tutor, subject }: { tutor: TutorInfo; subject: string }) {
  const { refresh } = usePortal();
  const [busy, setBusy] = useState(false);
  const decide = async (decision: "approve" | "decline") => {
    setBusy(true);
    await setSubjectApproval(tutor.id, subject, decision);
    await refresh();
    setBusy(false);
  };
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <Avatar name={tutor.name} size="sm" />
      <div className="min-w-[8rem] flex-1">
        <p className="text-sm font-medium text-slate-800">{tutor.name}</p>
        <p className="truncate text-xs text-slate-400">{tutor.email}</p>
      </div>
      <SubjectPill subject={subject} />
      <div className="flex gap-1.5">
        <button
          onClick={() => decide("approve")}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" aria-hidden /> Approve
        </button>
        <button
          onClick={() => decide("decline")}
          disabled={busy}
          className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function TutorRow({ tutor }: { tutor: TutorInfo }) {
  const { refresh } = usePortal();
  const revoke = async (subject: string) => {
    if (!confirm(`Remove approval for ${subject} from ${tutor.name}?`)) return;
    await setSubjectApproval(tutor.id, subject, "revoke");
    await refresh();
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={tutor.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800">{tutor.name}</p>
          <p className="truncate text-xs text-slate-400">{tutor.email}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.subjects.map((s) =>
          s.status === "approved" ? (
            <button
              key={s.subject}
              onClick={() => revoke(s.subject)}
              title="Click to remove approval"
              className="group inline-flex cursor-pointer items-center gap-1 rounded-md bg-alp-brand-50 px-2 py-1 text-xs font-medium text-alp-brand-700 hover:bg-rose-50 hover:text-rose-700"
            >
              <Check className="h-3 w-3 group-hover:hidden" aria-hidden />
              <X className="hidden h-3 w-3 group-hover:inline" aria-hidden />
              {s.subject}
            </button>
          ) : (
            <span
              key={s.subject}
              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
            >
              <ShieldAlert className="h-3 w-3" aria-hidden />
              {s.subject}
            </span>
          ),
        )}
        {tutor.subjects.length === 0 && <span className="text-xs text-slate-400">No subjects</span>}
      </div>
    </Card>
  );
}

function SessionRow({ session: s, readOnly = false }: { session: PortalSession; readOnly?: boolean }) {
  const { refresh } = usePortal();
  const signups = s.signups ?? [];
  const cancel = async () => {
    if (!confirm(cancelPrompt(s.subject, `${s.tutorName}'s`, s.signupCount))) return;
    reportCancel(await cancelSession(s.id));
    await refresh();
  };
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SubjectPill subject={s.subject} />
            <span className="text-sm text-slate-600">with {s.tutorName}</span>
            {s.cancelled && <span className="text-xs font-medium text-rose-600">Cancelled</span>}
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">{formatSessionTime(s.startsAt, s.durationMin)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              s.signupCount >= s.capacity ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {s.signupCount}/{s.capacity} joined
          </span>
          {s.meetLink && (
            <a
              href={s.meetLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-md p-1 text-slate-400 hover:bg-alp-brand-50 hover:text-alp-brand-700"
              aria-label="Open Google Meet"
              title="Open Google Meet"
            >
              <Video className="h-4 w-4" aria-hidden />
            </a>
          )}
          {!readOnly && !s.cancelled && (
            <button
              onClick={cancel}
              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Cancel session"
              title="Cancel session"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
      {signups.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
          {signups.map((p) => (
            <li key={p.studentId} className="flex items-center gap-1.5 text-sm text-slate-600" title={p.email}>
              <Avatar name={p.name} size="sm" />
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function cancelPrompt(subject: string, who: string, signupCount: number) {
  const notice =
    signupCount === 0
      ? "No students have joined yet."
      : `The ${signupCount} student${signupCount === 1 ? "" : "s"} who joined will get a cancellation email, and it will be removed from their calendar.`;
  return `Cancel ${who} ${subject} session?\n\n${notice}`;
}

function reportCancel(res: Awaited<ReturnType<typeof cancelSession>>) {
  if (!res.ok) alert(res.error);
  else if (res.failed > 0)
    alert(`Session cancelled, but ${res.failed} cancellation email${res.failed === 1 ? "" : "s"} didn't send. Let those students know directly.`);
}

function ResetPilotCard() {
  const { refresh } = usePortal();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const reset = async () => {
    const typed = prompt(
      "This permanently deletes ALL tutor and student accounts, subject approvals, sessions, and sign-ups. " +
        "It can't be undone. Your coordinator access stays.\n\nType RESET to confirm:",
    );
    if (typed === null) return;
    if (typed.trim() !== "RESET") {
      alert("Nothing was deleted. You need to type RESET exactly.");
      return;
    }
    setBusy(true);
    const res = await resetPilotData("RESET");
    setBusy(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setDone(true);
    await refresh();
  };

  return (
    <Card className="mt-10 border-rose-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold text-rose-700">Reset pilot data</h2>
          <p className="mt-1 text-sm text-slate-500">
            Clears every account, subject approval, session, and sign-up so the next trial run starts fresh. Use it
            after a rehearsal. No emails are sent.
          </p>
          {done && <p className="mt-2 text-sm font-medium text-emerald-600">Done. Everything has been cleared.</p>}
        </div>
        <button
          onClick={reset}
          disabled={busy}
          className="cursor-pointer rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
        >
          {busy ? "Resetting…" : "Reset pilot data"}
        </button>
      </div>
    </Card>
  );
}
