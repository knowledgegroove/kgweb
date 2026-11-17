"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CalendarPlus,
  Check,
  ExternalLink,
  ShieldAlert,
  Users,
  Video,
  X,
} from "lucide-react";
import { usePortal } from "../_lib/portal-client";
import { cancelSession, createSession, requestSubjects } from "../_lib/actions";
import { SUBJECTS } from "../_lib/subjects";
import type { PortalSession, TutorSubject } from "../_lib/types";
import { RoleGate } from "../_components/RoleGate";
import { Avatar, Card, EmptyState, PageHeader, StatCard, SubjectPill } from "../_components/ui";
import { formatSessionTime, isUpcoming } from "../_lib/format";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100";

export default function TutorPage() {
  return <RoleGate role="tutor">{(data) => <TutorDashboard {...data} />}</RoleGate>;
}

function TutorDashboard({
  viewer,
  subjects,
  sessions,
}: {
  viewer: { name: string };
  subjects: TutorSubject[];
  sessions: PortalSession[];
}) {
  const approved = subjects.filter((s) => s.status === "approved").map((s) => s.subject);
  const pending = subjects.filter((s) => s.status === "pending").map((s) => s.subject);
  const upcoming = sessions.filter((s) => !s.cancelled && isUpcoming(s));
  const past = sessions.filter((s) => s.cancelled || !isUpcoming(s));
  const studentsSignedUp = upcoming.reduce((n, s) => n + s.signupCount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={`Hi, ${viewer.name.split(" ")[0]}`} description="Schedule sessions and see who's coming." />

      <SubjectsCard approved={approved} pending={pending} />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Upcoming" value={upcoming.length} icon={CalendarCheck} />
        <StatCard label="Students signed up" value={studentsSignedUp} tone="green" icon={Users} />
        <StatCard label="Approved subjects" value={approved.length} icon={Check} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ScheduleForm approved={approved} />

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">My upcoming sessions</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              description="Sessions you post appear instantly on the students' Sessions page."
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((s) => (
                <TutorSessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-slate-500">
                Past &amp; cancelled ({past.length})
              </summary>
              <div className="mt-3 space-y-3 opacity-70">
                {past.map((s) => (
                  <TutorSessionCard key={s.id} session={s} readOnly />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectsCard({ approved, pending }: { approved: string[]; pending: string[] }) {
  const { refresh } = usePortal();
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const available = SUBJECTS.filter((s) => !approved.includes(s) && !pending.includes(s));

  const submit = async () => {
    setSaving(true);
    const res = await requestSubjects(picked);
    setSaving(false);
    if (res.ok) {
      setPicked([]);
      setAdding(false);
      await refresh();
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">My subjects</h2>
        {available.length > 0 && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="cursor-pointer text-sm font-medium text-alp-brand-600 hover:text-alp-brand-800"
          >
            {adding ? "Close" : "+ Request more subjects"}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {approved.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-alp-brand-50 px-2 py-1 text-xs font-medium text-alp-brand-700"
          >
            <Check className="h-3 w-3" aria-hidden />
            {s}
          </span>
        ))}
        {pending.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
          >
            <ShieldAlert className="h-3 w-3" aria-hidden />
            {s}: waiting for approval
          </span>
        ))}
        {approved.length + pending.length === 0 && <p className="text-sm text-slate-400">No subjects yet.</p>}
      </div>
      {adding && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {available.map((s) => {
              const on = picked.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s) : [...p, s]))}
                  aria-pressed={on}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm ${
                    on ? "bg-alp-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-alp-brand-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <button
            onClick={submit}
            disabled={picked.length === 0 || saving}
            className="mt-3 cursor-pointer rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Sending…" : "Send for approval"}
          </button>
        </div>
      )}
    </Card>
  );
}

function ScheduleForm({ approved }: { approved: string[] }) {
  const { refresh } = usePortal();
  const [subject, setSubject] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(45);
  const [capacity, setCapacity] = useState(5);
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const ready = subject && startsAt && meetLink.trim() && !saving;

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    const res = await createSession({
      subject,
      startsAt: new Date(startsAt).toISOString(),
      durationMin: duration,
      capacity,
      meetLink,
      notes,
    });
    setSaving(false);
    if (!res.ok) {
      setMessage({ text: res.error, ok: false });
      return;
    }
    setMessage({ text: "Session posted. Students can see it now.", ok: true });
    setSubject("");
    setStartsAt("");
    setMeetLink("");
    setNotes("");
    await refresh();
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <CalendarPlus className="h-4 w-4 text-alp-brand-600" aria-hidden />
        <h2 className="text-base font-semibold text-slate-900">Schedule a session</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">Only subjects the coordinator approved for you are listed.</p>

      {approved.length === 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          None of your subjects are approved yet. Once the coordinator approves one, you can schedule sessions here.
          This page updates automatically.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="subject" className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
              <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass}>
                <option value="">Choose…</option>
                {approved.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="starts" className="mb-1 block text-xs font-medium text-slate-500">Date &amp; start time</label>
              <input
                id="starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="duration" className="mb-1 block text-xs font-medium text-slate-500">Length</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputClass}
              >
                {[30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>{m} minutes</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="capacity" className="mb-1 block text-xs font-medium text-slate-500">Max students</label>
              <input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="meet" className="block text-xs font-medium text-slate-500">Google Meet link</label>
              <a
                href="https://meet.new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-alp-brand-600 hover:text-alp-brand-800"
              >
                Create one at meet.new <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
            <input
              id="meet"
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="What will this session cover?"
              className={inputClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={submit}
              disabled={!ready}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {saving ? "Posting…" : "Post session"}
            </button>
            {message && (
              <p className={`text-sm ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function TutorSessionCard({ session: s, readOnly = false }: { session: PortalSession; readOnly?: boolean }) {
  const { refresh } = usePortal();
  const [busy, setBusy] = useState(false);
  const signups = s.signups ?? [];

  const cancel = async () => {
    if (!confirm(`Cancel your ${s.subject} session? Students who joined will see it as cancelled.`)) return;
    setBusy(true);
    await cancelSession(s.id);
    await refresh();
    setBusy(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <SubjectPill subject={s.subject} />
            {s.cancelled && <span className="text-xs font-medium text-rose-600">Cancelled</span>}
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">{formatSessionTime(s.startsAt, s.durationMin)}</p>
        </div>
        {!readOnly && !s.cancelled && (
          <button
            onClick={cancel}
            disabled={busy}
            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Cancel session"
            title="Cancel session"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {s.meetLink && (
        <a
          href={s.meetLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-alp-brand-600 hover:text-alp-brand-800"
        >
          <Video className="h-3.5 w-3.5" aria-hidden />
          Open Meet
        </a>
      )}
      {s.notes && <p className="mt-2 text-sm text-slate-500">{s.notes}</p>}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-medium text-slate-500">
          {s.signupCount}/{s.capacity} signed up
        </p>
        {signups.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {signups.map((p) => (
              <li key={p.studentId} className="flex items-center gap-2 text-sm">
                <Avatar name={p.name} size="sm" />
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className="truncate text-xs text-slate-400">{p.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
