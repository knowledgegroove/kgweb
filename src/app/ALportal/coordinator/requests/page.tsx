"use client";

import { useMemo, useState } from "react";
import { useAppData } from "../../_lib/store";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  SourceBadge,
  StatusBadge,
  SubjectPill,
} from "../../_components/ui";
import { RequestStatus, Tutor, TutoringRequest } from "../../_lib/types";

type StatusFilter = "all" | RequestStatus;

function suggestTutors(request: TutoringRequest, tutors: Tutor[], requests: TutoringRequest[]) {
  const activeLoad = (tutorId: string) =>
    requests.filter((r) => r.assignedTutorId === tutorId && r.status === "assigned").length;

  return tutors
    .filter((t) => t.active && t.subjects.includes(request.subject))
    .map((t) => ({
      tutor: t,
      periodMatch: t.periods.includes(request.period),
      load: activeLoad(t.id),
    }))
    .sort((a, b) => {
      if (a.periodMatch !== b.periodMatch) return a.periodMatch ? -1 : 1;
      if (a.load !== b.load) return a.load - b.load;
      return b.tutor.rating - a.tutor.rating;
    });
}

function RequestCard({ request }: { request: TutoringRequest }) {
  const { tutors, requests, assignTutor, markCompleted } = useAppData();
  const [selectedTutorId, setSelectedTutorId] = useState("");

  const suggestions = useMemo(
    () => suggestTutors(request, tutors, requests),
    [request, tutors, requests]
  );
  const topPick = suggestions[0];
  const assignedTutor = tutors.find((t) => t.id === request.assignedTutorId);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Avatar name={request.requesterName} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{request.requesterName}</p>
              <span className="text-xs text-slate-400">
                {request.requesterType === "Teacher" ? "In-class request" : "Student sign-up"}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <SubjectPill subject={request.subject} />
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{request.period}</span>
              <SourceBadge source={request.source} />
            </div>
            {request.notes && <p className="mt-2 max-w-xl text-sm text-slate-600">{request.notes}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={request.status} />
          <span className="text-xs text-slate-400">
            {new Date(request.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        {request.status === "open" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {topPick ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Suggested
                </span>
                <Avatar name={topPick.tutor.name} size="sm" />
                <span className="font-medium text-slate-800">{topPick.tutor.name}</span>
                <span className="text-xs text-slate-400">
                  {topPick.periodMatch ? "available that period" : "different period — confirm first"} · ★{topPick.tutor.rating}
                </span>
              </div>
            ) : (
              <p className="text-sm text-rose-600">No active tutor currently covers this subject.</p>
            )}
            <div className="flex items-center gap-2">
              <select
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
              >
                <option value="">Choose a tutor…</option>
                {suggestions.map(({ tutor, periodMatch }) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} {periodMatch ? "" : "(different period)"}
                  </option>
                ))}
              </select>
              <button
                disabled={!selectedTutorId && !topPick}
                onClick={() => assignTutor(request.id, selectedTutorId || topPick!.tutor.id)}
                className="rounded-lg bg-alp-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        )}

        {request.status === "assigned" && assignedTutor && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Assigned to</span>
              <Avatar name={assignedTutor.name} size="sm" />
              <span className="font-medium text-slate-800">{assignedTutor.name}</span>
            </div>
            <button
              onClick={() => markCompleted(request.id)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              Mark completed
            </button>
          </div>
        )}

        {request.status === "completed" && assignedTutor && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Completed with</span>
            <Avatar name={assignedTutor.name} size="sm" />
            <span className="font-medium text-slate-700">{assignedTutor.name}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function RequestsPage() {
  const { requests } = useAppData();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const subjects = useMemo(
    () => Array.from(new Set(requests.map((r) => r.subject))).sort(),
    [requests]
  );

  const filtered = requests
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter((r) => subjectFilter === "all" || r.subject === subjectFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "open", label: `Open (${requests.filter((r) => r.status === "open").length})` },
    { key: "assigned", label: `Assigned (${requests.filter((r) => r.status === "assigned").length})` },
    { key: "completed", label: `Completed (${requests.filter((r) => r.status === "completed").length})` },
    { key: "all", label: "All" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Requests & Matching"
        description="Requests pulled in from Infinite Campus sign-ups and the teacher Google Form."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === tab.key ? "bg-alp-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="No requests match this filter" description="Try a different status or subject." />
        ) : (
          filtered.map((r) => <RequestCard key={r.id} request={r} />)
        )}
      </div>
    </div>
  );
}
