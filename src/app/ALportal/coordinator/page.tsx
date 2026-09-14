"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, ClipboardList, RefreshCw, Users } from "lucide-react";
import { useAppData } from "../_lib/store";
import { Card, PageHeader, StatCard, StatusBadge, SourceBadge, Avatar } from "../_components/ui";
import { SUBJECTS } from "../_lib/seed-data";

export default function CoordinatorDashboard() {
  const { tutors, requests, simulateSync } = useAppData();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const openRequests = requests.filter((r) => r.status === "open");
  const assignedRequests = requests.filter((r) => r.status === "assigned");
  const completedRequests = requests.filter((r) => r.status === "completed");

  const totalSessions = tutors.reduce((sum, t) => sum + t.sessionsThisMonth, 0);
  const totalHours = tutors.reduce((sum, t) => sum + t.hoursThisMonth, 0);
  const activeTutors = tutors.filter((t) => t.active).length;

  const coverage = useMemo(() => {
    return SUBJECTS.map((subject) => {
      const tutorCount = tutors.filter((t) => t.active && t.subjects.includes(subject)).length;
      const demand = requests.filter(
        (r) => r.subject === subject && (r.status === "open" || r.status === "assigned")
      ).length;
      const ratio = tutorCount === 0 ? 0 : tutorCount / demand;
      return { subject, tutorCount, demand, ratio };
    })
      .filter((c) => c.demand > 0)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 8);
  }, [tutors, requests]);

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      const count = simulateSync();
      setSyncing(false);
      setSyncMessage(
        count > 0
          ? `Pulled in ${count} new request${count > 1 ? "s" : ""} from Infinite Campus & the teacher Google Form.`
          : "You're all caught up — no new sign-ups or form responses since the last sync."
      );
      setTimeout(() => setSyncMessage(null), 5000);
    }, 700);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Coordinator Dashboard"
        description="Program overview — coverage, matching status, and monthly usage."
        action={
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-alp-brand-700 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} aria-hidden />
              {syncing ? "Syncing…" : "Sync Infinite Campus & Form responses"}
            </button>
            {syncMessage && (
              <p className="max-w-xs text-right text-xs text-slate-500">{syncMessage}</p>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Open Requests"
          value={openRequests.length}
          tone="amber"
          sublabel="Needs a tutor match"
          icon={ClipboardList}
        />
        <StatCard
          label="Assigned"
          value={assignedRequests.length}
          tone="default"
          sublabel="Currently scheduled"
          icon={CalendarCheck}
        />
        <StatCard label="Completed" value={completedRequests.length} tone="green" sublabel="This term" icon={CheckCircle2} />
        <StatCard label="Sessions / mo" value={totalSessions} sublabel="Across all tutors" icon={Users} />
        <StatCard label="Hours / mo" value={totalHours.toFixed(1)} sublabel={`${activeTutors} active tutors`} icon={Clock} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Subject Coverage</h2>
              <p className="text-sm text-slate-500">Tutors available vs. open/assigned demand — lowest coverage first.</p>
            </div>
          </div>
          <div className="space-y-3">
            {coverage.map((c) => {
              const severity = c.ratio < 1 ? "critical" : c.ratio === 1 ? "tight" : "healthy";
              const barWidth = Math.min(100, c.ratio * 100);
              const barColor =
                severity === "critical" ? "bg-rose-400" : severity === "tight" ? "bg-amber-400" : "bg-emerald-400";
              const labelColor =
                severity === "critical"
                  ? "text-rose-600"
                  : severity === "tight"
                  ? "text-amber-600"
                  : "text-slate-400";
              return (
                <div key={c.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{c.subject}</span>
                    <span className={`text-xs font-medium ${labelColor}`}>
                      {c.tutorCount} tutor{c.tutorCount !== 1 ? "s" : ""} · {c.demand} request{c.demand !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(barWidth, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Bar shows tutor supply relative to current open/assigned demand. Red = fewer tutors than requests, amber =
            exactly enough with no slack, green = healthy buffer.
          </p>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Requests</h2>
            <Link
              href="/ALportal/coordinator/requests"
              className="inline-flex items-center gap-1 text-sm font-medium text-alp-brand-600 hover:text-alp-brand-800"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentRequests.map((r) => (
              <li key={r.id} className="flex items-start gap-3">
                <Avatar name={r.requesterName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-800">{r.requesterName}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {r.subject} · {r.period}
                  </p>
                  <div className="mt-1">
                    <SourceBadge source={r.source} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">How this fits with existing tools</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Students still sign up for tutoring in <span className="font-medium text-slate-700">Infinite Campus</span>,
              and teachers still request in-class help via the{" "}
              <span className="font-medium text-slate-700">Google Form</span>. This portal doesn&apos;t replace either —
              it pulls both into one queue so a coordinator can match tutors by subject and see coverage gaps, instead
              of checking two separate systems by hand.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
