"use client";

import { useMemo, useState } from "react";
import { CalendarClock, MapPin, Users } from "lucide-react";
import { useAppData } from "../../_lib/store";
import { Avatar, Card, EmptyState, PageHeader, SubjectPill } from "../../_components/ui";
import { SUBJECTS } from "../../_lib/seed-data";
import { Period } from "../../_lib/types";

const PERIOD_OPTIONS: Period[] = [
  "Access Period",
  "B-Period (Commons)",
  "Lunch (Commons)",
  "After School",
];

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function JoinSessionPage() {
  const { tutors, sessions, joinSession } = useAppData();
  const [studentName, setStudentName] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | Period>("all");
  const [messages, setMessages] = useState<Record<string, { text: string; tone: "success" | "error" }>>({});

  const upcoming = useMemo(
    () =>
      sessions
        .filter((s) => subjectFilter === "all" || s.subject === subjectFilter)
        .filter((s) => periodFilter === "all" || s.period === periodFilter)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions, subjectFilter, periodFilter]
  );

  const handleJoin = (sessionId: string) => {
    const name = studentName.trim();
    if (!name) {
      setMessages((prev) => ({ ...prev, [sessionId]: { text: "Enter your name above first.", tone: "error" } }));
      return;
    }
    const result = joinSession(sessionId, name);
    if (result === "joined") {
      setMessages((prev) => ({ ...prev, [sessionId]: { text: "You're in! See you there.", tone: "success" } }));
    } else if (result === "already-joined") {
      setMessages((prev) => ({ ...prev, [sessionId]: { text: "You already joined this session.", tone: "error" } }));
    } else {
      setMessages((prev) => ({ ...prev, [sessionId]: { text: "This session just filled up.", tone: "error" } }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Join a Session"
        description="Tutors post open drop-in sessions here — grab a seat before it fills up."
      />

      <Card className="mb-6 p-4">
        <label className="mb-1 block text-xs font-medium text-slate-500">Your name</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="e.g. Sam Patterson"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100 sm:max-w-xs"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          No login for this prototype — we just need a name to add you to the roster.
        </p>
      </Card>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
        >
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as "all" | Period)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
        >
          <option value="all">All periods</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState title="No sessions posted yet" description="Check back soon, or try a different filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {upcoming.map((s) => {
            const tutor = tutors.find((t) => t.id === s.tutorId);
            const seatsLeft = s.capacity - s.joinedStudents.length;
            const full = seatsLeft <= 0;
            const alreadyJoined = studentName.trim() && s.joinedStudents.includes(studentName.trim());
            const message = messages[s.id];
            return (
              <Card key={s.id} className="flex flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <SubjectPill subject={s.subject} />
                  <span
                    className={`text-xs font-medium ${
                      full ? "text-rose-600" : seatsLeft <= 2 ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {full ? "Full" : `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-700">
                  <CalendarClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {formatDate(s.date)} · {s.period}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {s.location}
                </div>

                {tutor && (
                  <div className="mt-3 flex items-center gap-2">
                    <Avatar name={tutor.name} size="sm" />
                    <span className="text-sm font-medium text-slate-800">{tutor.name}</span>
                    <span className="text-xs text-amber-500">★ {tutor.rating}</span>
                  </div>
                )}
                {s.notes && <p className="mt-2 text-sm text-slate-500">{s.notes}</p>}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {s.joinedStudents.length}/{s.capacity} joined
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleJoin(s.id)}
                    disabled={full || Boolean(alreadyJoined)}
                    className="rounded-lg bg-alp-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    {alreadyJoined ? "Joined" : full ? "Full" : "Join session"}
                  </button>
                  {message && (
                    <p className={`text-xs ${message.tone === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
