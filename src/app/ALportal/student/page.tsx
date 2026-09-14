"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "../_lib/store";
import { Avatar, Card, EmptyState, PageHeader, SubjectPill } from "../_components/ui";
import { SUBJECTS } from "../_lib/seed-data";
import { Period } from "../_lib/types";

const PERIOD_OPTIONS: Period[] = [
  "Access Period",
  "B-Period (Commons)",
  "Lunch (Commons)",
  "After School",
];

export default function StudentPage() {
  const { tutors } = useAppData();
  const [subject, setSubject] = useState("all");
  const [period, setPeriod] = useState<"all" | Period>("all");
  const [signupNote, setSignupNote] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tutors
      .filter((t) => t.active)
      .filter((t) => subject === "all" || t.subjects.includes(subject))
      .filter((t) => period === "all" || t.periods.includes(period))
      .sort((a, b) => b.rating - a.rating);
  }, [tutors, subject, period]);

  const handleSignupClick = (tutorName: string, periodLabel: string) => {
    setSignupNote(
      `In the full version, this deep-links into Infinite Campus's tutoring sign-up, pre-filled for ${tutorName} during ${periodLabel} — sign-up itself still happens there.`
    );
    setTimeout(() => setSignupNote(null), 6000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Find a Tutor"
        description="Browse Academic Leadership tutors by subject and period, then sign up through Infinite Campus as usual."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Looking for a drop-in session?</p>
            <p className="text-sm text-slate-500">Browse open sessions tutors have posted and grab a seat.</p>
          </div>
          <Link
            href="/ALportal/student/sessions"
            className="shrink-0 rounded-lg bg-alp-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-alp-brand-700"
          >
            Join a session
          </Link>
        </Card>
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Already had a session and have a follow-up question?</p>
            <p className="text-sm text-slate-500">Post it to the Q&amp;A board — any tutor in that subject can answer.</p>
          </div>
          <Link
            href="/ALportal/qa"
            className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ask a question
          </Link>
        </Card>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
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
          value={period}
          onChange={(e) => setPeriod(e.target.value as "all" | Period)}
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

      {signupNote && (
        <div className="mb-5 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          {signupNote}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No tutors currently available for this combination"
          description="Try a different subject or period, or check back after the next AL sign-up window."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="flex flex-col p-4">
              <div className="flex items-start gap-3">
                <Avatar name={t.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                    <span className="shrink-0 text-xs text-amber-500">★ {t.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400">Grade {t.grade}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{t.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.subjects.map((s) => (
                  <SubjectPill key={s} subject={s} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.periods.map((p) => (
                  <SubjectPill key={p} subject={p} muted />
                ))}
              </div>
              <button
                onClick={() => handleSignupClick(t.name, t.periods[0])}
                className="mt-4 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
              >
                Sign up via Infinite Campus →
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
