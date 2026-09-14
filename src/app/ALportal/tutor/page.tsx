"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useAppData } from "../_lib/store";
import { Avatar, Card, EmptyState, PageHeader, StatCard, SubjectPill } from "../_components/ui";
import { Period } from "../_lib/types";

const PERIOD_OPTIONS: Period[] = [
  "Access Period",
  "B-Period (Commons)",
  "Lunch (Commons)",
  "After School",
];

export default function TutorDashboard() {
  const { tutors, requests, qaPosts, sessions, scheduleSession, cancelSession } = useAppData();
  const [tutorId, setTutorId] = useState(tutors[0]?.id ?? "");

  const tutor = tutors.find((t) => t.id === tutorId) ?? tutors[0];

  const [subject, setSubject] = useState("");
  const [period, setPeriod] = useState<Period | "">("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [notes, setNotes] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  const mySessions = useMemo(
    () => requests.filter((r) => r.assignedTutorId === tutor?.id),
    [requests, tutor]
  );
  const upcoming = mySessions.filter((r) => r.status === "assigned");
  const past = mySessions.filter((r) => r.status === "completed");

  const myScheduledSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.tutorId === tutor?.id)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions, tutor]
  );

  const unansweredInMySubjects = useMemo(() => {
    if (!tutor) return [];
    return qaPosts.filter((p) => tutor.subjects.includes(p.subject) && p.replies.length === 0);
  }, [qaPosts, tutor]);

  if (!tutor) return null;

  const pendingSubjects = tutor.subjects.filter((s) => !tutor.approvedSubjects.includes(s));
  const canSchedule = tutor.approvedSubjects.length > 0;

  const submitSchedule = () => {
    if (!subject || !period || !date || !location.trim()) return;
    scheduleSession({
      tutorId: tutor.id,
      subject,
      period,
      date,
      location: location.trim(),
      capacity,
      notes: notes.trim() || undefined,
    });
    setScheduleMessage(`Session posted — students can now join your ${subject} session on ${date}.`);
    setSubject("");
    setPeriod("");
    setDate("");
    setLocation("");
    setCapacity(6);
    setNotes("");
    setTimeout(() => setScheduleMessage(null), 5000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My Dashboard"
        description="Demo note: pick a tutor below to simulate that tutor's logged-in view."
        action={
          <select
            value={tutor.id}
            onChange={(e) => setTutorId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
          >
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        }
      />

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={tutor.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{tutor.name}</h2>
              <span className="text-sm text-slate-400">Grade {tutor.grade}</span>
              <span className="text-sm text-amber-500">★ {tutor.rating}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{tutor.bio}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              Approved subjects
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tutor.approvedSubjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md bg-alp-brand-50 px-2 py-1 text-xs font-medium text-alp-brand-700"
                >
                  <Check className="h-3 w-3" aria-hidden />
                  {s}
                </span>
              ))}
              {pendingSubjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
                >
                  <ShieldAlert className="h-3 w-3" aria-hidden />
                  {s} — pending
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tutor.periods.map((p) => (
                <SubjectPill key={p} subject={p} muted />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Sessions / mo" value={tutor.sessionsThisMonth} icon={Users} />
        <StatCard label="Hours / mo" value={tutor.hoursThisMonth} icon={Clock} />
        <StatCard label="Upcoming" value={upcoming.length} tone="default" icon={CalendarCheck} />
        <StatCard label="Completed" value={past.length} tone="green" icon={CheckCircle2} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-alp-brand-600" aria-hidden />
            <h2 className="text-base font-semibold text-slate-900">Schedule a Session</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            You can only schedule sessions for subjects a coordinator has approved for you.
          </p>
          {!canSchedule ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              None of your subjects are approved yet. Ask your coordinator to approve one in the Tutor
              Roster before you can schedule a session.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingSubjects.length > 0 && (
                <p className="text-xs text-amber-700">
                  Not yet approved: {pendingSubjects.join(", ")} — these won&apos;t appear below until a
                  coordinator approves them.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                  >
                    <option value="">Choose a subject…</option>
                    {tutor.approvedSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as Period)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                  >
                    <option value="">Choose a period…</option>
                    {(tutor.periods.length > 0 ? tutor.periods : PERIOD_OPTIONS).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Commons — Table 2, or Room 214"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What will this session cover?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={submitSchedule}
                  disabled={!subject || !period || !date || !location.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <CalendarPlus className="h-4 w-4" aria-hidden />
                  Post session
                </button>
                {scheduleMessage && <p className="text-xs text-emerald-600">{scheduleMessage}</p>}
              </div>
            </div>
          )}
        </Card>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">My Scheduled Sessions</h2>
          {myScheduledSessions.length === 0 ? (
            <EmptyState
              title="No sessions posted yet"
              description="Sessions you post here become joinable by students on the Join a Session page."
            />
          ) : (
            <div className="space-y-3">
              {myScheduledSessions.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <SubjectPill subject={s.subject} />
                        <span className="text-xs text-slate-400">{s.period}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-800">
                        {new Date(s.date + "T00:00:00").toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {s.location}
                      </p>
                    </div>
                    <button
                      onClick={() => cancelSession(s.id)}
                      className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      aria-label="Cancel session"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {s.notes && <p className="mt-2 text-sm text-slate-500">{s.notes}</p>}
                  <p className="mt-2 text-xs text-slate-500">
                    {s.joinedStudents.length}/{s.capacity} joined
                    {s.joinedStudents.length > 0 && <> — {s.joinedStudents.join(", ")}</>}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Upcoming Sessions</h2>
          {upcoming.length === 0 ? (
            <EmptyState title="No sessions assigned yet" description="Check back after the coordinator matches new requests." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{r.requesterName}</p>
                    <span className="text-xs text-slate-400">{r.period}</span>
                  </div>
                  <div className="mt-1.5">
                    <SubjectPill subject={r.subject} />
                  </div>
                  {r.notes && <p className="mt-2 text-sm text-slate-500">{r.notes}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Q&amp;A needing a reply</h2>
            <Link
              href="/ALportal/qa"
              className="inline-flex items-center gap-1 text-sm font-medium text-alp-brand-600 hover:text-alp-brand-800"
            >
              Open board
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {unansweredInMySubjects.length === 0 ? (
            <EmptyState title="You're all caught up" description="No unanswered questions in your subjects." />
          ) : (
            <div className="space-y-3">
              {unansweredInMySubjects.slice(0, 4).map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{p.authorName}</p>
                    <SubjectPill subject={p.subject} />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{p.question}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
