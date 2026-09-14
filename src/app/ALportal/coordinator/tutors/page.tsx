"use client";

import { useMemo, useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import { useAppData } from "../../_lib/store";
import { Avatar, Card, EmptyState, PageHeader, SubjectPill } from "../../_components/ui";
import { SUBJECTS } from "../../_lib/seed-data";
import { Period, Tutor } from "../../_lib/types";

const PERIOD_OPTIONS: Period[] = [
  "Access Period",
  "B-Period (Commons)",
  "Lunch (Commons)",
  "After School",
];

function TutorCard({ tutor, activeCount }: { tutor: Tutor; activeCount: number }) {
  const { approveSubject } = useAppData();
  const pending = tutor.subjects.filter((s) => !tutor.approvedSubjects.includes(s));

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={tutor.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{tutor.name}</p>
            <span className="shrink-0 text-xs text-amber-500">★ {tutor.rating}</span>
          </div>
          <p className="text-xs text-slate-400">Grade {tutor.grade}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">{tutor.bio}</p>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        Subjects &amp; session approval
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tutor.subjects.map((s) =>
          tutor.approvedSubjects.includes(s) ? (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-md bg-alp-brand-50 px-2 py-1 text-xs font-medium text-alp-brand-700"
            >
              <Check className="h-3 w-3" aria-hidden />
              {s}
            </span>
          ) : (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
            >
              <ShieldAlert className="h-3 w-3" aria-hidden />
              {s} pending
              <button
                onClick={() => approveSubject(tutor.id, s)}
                className="ml-0.5 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-amber-700 cursor-pointer"
              >
                Approve
              </button>
            </span>
          )
        )}
      </div>
      {pending.length > 0 && (
        <p className="mt-1.5 text-xs text-slate-400">
          {tutor.name.split(" ")[0]} can&apos;t schedule sessions for pending subjects until approved.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.periods.map((p) => (
          <SubjectPill key={p} subject={p} muted />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>{tutor.sessionsThisMonth} sessions this month</span>
        <span>{activeCount} active</span>
      </div>
    </Card>
  );
}

export default function TutorRosterPage() {
  const { tutors, requests } = useAppData();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [period, setPeriod] = useState<"all" | Period>("all");

  const filtered = useMemo(() => {
    return tutors
      .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      .filter((t) => subject === "all" || t.subjects.includes(subject))
      .filter((t) => period === "all" || t.periods.includes(period))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tutors, query, subject, period]);

  const activeAssignments = (tutorId: string) =>
    requests.filter((r) => r.assignedTutorId === tutorId && r.status === "assigned").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Tutor Roster"
        description={`${tutors.length} Academic Leadership tutors serving the school this term.`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tutor name…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100 sm:max-w-xs"
        />
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
        {(query || subject !== "all" || period !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setSubject("all");
              setPeriod("all");
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tutors match these filters" description="Try clearing a filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TutorCard key={t.id} tutor={t} activeCount={activeAssignments(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
