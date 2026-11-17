"use client";

import { useState } from "react";
import { CalendarClock, Mail, Users, Video } from "lucide-react";
import { usePortal } from "../_lib/portal-client";
import { joinSession, leaveSession } from "../_lib/actions";
import type { PortalSession, Viewer } from "../_lib/types";
import { RoleGate } from "../_components/RoleGate";
import { Avatar, Card, EmptyState, PageHeader, SubjectPill } from "../_components/ui";
import { formatSessionTime } from "../_lib/format";

type Notice = { text: string; tone: "success" | "error" | "info" };

export default function StudentPage() {
  return <RoleGate role="student">{(data) => <StudentSessions viewer={data.viewer} sessions={data.sessions} />}</RoleGate>;
}

function StudentSessions({ viewer, sessions }: { viewer: Viewer; sessions: PortalSession[] }) {
  const { refresh } = usePortal();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [guestEmail, setGuestEmail] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Record<string, Notice>>({});

  const mine = sessions.filter((s) => s.joined);
  const open = sessions.filter((s) => !s.joined && !s.cancelled);
  const subjects = [...new Set(open.map((s) => s.subject))].sort();
  const visible = open.filter((s) => subjectFilter === "all" || s.subject === subjectFilter);
  const needsEmail = !viewer.email;

  const notify = (id: string, n: Notice) => setNotices((prev) => ({ ...prev, [id]: n }));

  const join = async (s: PortalSession) => {
    if (needsEmail && !guestEmail.trim()) {
      notify(s.id, { text: "Enter your email above first so we can send the Meet link.", tone: "error" });
      return;
    }
    setBusyId(s.id);
    const res = await joinSession(s.id, needsEmail ? guestEmail : undefined);
    if (!res.ok) {
      notify(s.id, { text: res.error, tone: "error" });
    } else {
      const text =
        res.emailStatus === "sent"
          ? `You're in! Confirmation sent to ${res.email}.`
          : res.emailStatus === "skipped"
            ? "You're in! (Confirmation emails aren't set up yet.)"
            : "You're in! But the confirmation email didn't send. Use the Meet link below.";
      notify(s.id, { text, tone: res.emailStatus === "failed" ? "info" : "success" });
    }
    await refresh();
    setBusyId(null);
  };

  const leave = async (s: PortalSession) => {
    if (!confirm(`Leave the ${s.subject} session?`)) return;
    setBusyId(s.id);
    await leaveSession(s.id);
    await refresh();
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Tutoring sessions"
        description="Online sessions run by Academic Leadership tutors. Grab a seat before it fills up."
      />

      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Mail className="hidden h-5 w-5 shrink-0 text-alp-brand-500 sm:block" aria-hidden />
        {needsEmail ? (
          <div className="flex-1">
            <label htmlFor="guest-email" className="block text-sm font-medium text-slate-700">
              Email for your confirmation
            </label>
            <input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100 sm:max-w-sm"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            When you join, we&apos;ll email the Google Meet link and a calendar invite to{" "}
            <span className="font-medium text-slate-800">{viewer.email}</span>.
          </p>
        )}
      </Card>

      {mine.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-900">My sessions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {mine.map((s) => (
              <Card key={s.id} className={`p-4 ${s.cancelled ? "opacity-70" : "border-alp-brand-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <SubjectPill subject={s.subject} />
                  {s.cancelled ? (
                    <span className="text-xs font-semibold text-rose-600">Cancelled by tutor</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600">You&apos;re in</span>
                  )}
                </div>
                <SessionMeta s={s} />
                {!s.cancelled && s.meetLink && (
                  <a
                    href={s.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-alp-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-alp-brand-700"
                  >
                    <Video className="h-4 w-4" aria-hidden />
                    Join Google Meet
                  </a>
                )}
                {!s.cancelled && (
                  <button
                    onClick={() => leave(s)}
                    disabled={busyId === s.id}
                    className="ml-3 cursor-pointer text-sm text-slate-500 hover:text-rose-600"
                  >
                    Leave
                  </button>
                )}
                {notices[s.id] && <NoticeText n={notices[s.id]} />}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Open sessions</h2>
          {subjects.length > 1 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        {visible.length === 0 ? (
          <EmptyState
            title="No open sessions right now"
            description="New sessions show up here automatically as soon as a tutor posts them."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((s) => {
              const seatsLeft = s.capacity - s.signupCount;
              const full = seatsLeft <= 0;
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
                  <SessionMeta s={s} />
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                    <button
                      onClick={() => join(s)}
                      disabled={full || busyId === s.id}
                      className="cursor-pointer rounded-lg bg-alp-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busyId === s.id ? "Joining…" : full ? "Full" : "Join session"}
                    </button>
                  </div>
                  {notices[s.id] && <NoticeText n={notices[s.id]} />}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SessionMeta({ s }: { s: PortalSession }) {
  return (
    <>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-700">
        <CalendarClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        {formatSessionTime(s.startsAt, s.durationMin)}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <Video className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        Online · Google Meet
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Avatar name={s.tutorName} size="sm" />
        <span className="text-sm font-medium text-slate-800">{s.tutorName}</span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Users className="h-3 w-3" aria-hidden />
          {s.signupCount}/{s.capacity}
        </span>
      </div>
      {s.notes && <p className="mt-2 text-sm text-slate-500">{s.notes}</p>}
    </>
  );
}

function NoticeText({ n }: { n: Notice }) {
  const color = n.tone === "success" ? "text-emerald-600" : n.tone === "error" ? "text-rose-600" : "text-amber-700";
  return <p className={`mt-3 text-sm ${color}`}>{n.text}</p>;
}
