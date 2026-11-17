"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, GraduationCap, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePortal } from "./_lib/portal-client";
import type { Role } from "./_lib/types";
import { Logo } from "./_components/Logo";
import AccountBadge from "./_components/AccountBadge";

const ROLES: {
  role: Role;
  href: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  bullets: string[];
}[] = [
  {
    role: "coordinator",
    href: "/ALportal/coordinator",
    title: "Coordinator",
    description: "Program oversight: approvals, sessions, and sign-ups in one place.",
    icon: LayoutDashboard,
    bullets: [
      "Approve the subjects each tutor can teach",
      "See every session and sign-up live",
      "Cancel or follow up on any session",
    ],
  },
  {
    role: "tutor",
    href: "/ALportal/tutor",
    title: "Tutor",
    description: "For AL members: schedule sessions and see who's coming.",
    icon: Users,
    bullets: [
      "Schedule online sessions",
      "Only in subjects the coordinator approved",
      "See sign-ups as they happen",
    ],
  },
  {
    role: "student",
    href: "/ALportal/student",
    title: "Student",
    description: "Find an online tutoring session and grab a seat.",
    icon: GraduationCap,
    bullets: [
      "Browse upcoming sessions by subject",
      "Join supervised sessions",
      "Get a confirmation email with the Meet link",
    ],
  },
];

export default function Home() {
  const { status } = useSession();
  const { data, error } = usePortal();
  const myRole = data?.viewer.role ?? null;
  const needsSetup = data !== null && myRole === null;
  const cards = myRole ? ROLES.filter((r) => r.role === myRole) : [];

  return (
    <div className="relative min-h-full overflow-hidden bg-app">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-alp-brand-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 h-64 w-64 rounded-full bg-alp-brand-300/30 blur-3xl"
      />

      {status === "authenticated" && (
        <div className="relative z-10 flex justify-end px-4 pt-4 sm:px-6">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 py-1.5 pl-2 pr-1 shadow-sm backdrop-blur">
            <AccountBadge />
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex justify-center drop-shadow-sm">
            <Logo size={96} />
          </div>
          <h1 className="font-alp-display text-4xl tracking-tight text-alp-brand-900 sm:text-5xl">
            DVHS Academic Leadership
            <span className="block text-alp-brand-600">Online Portal</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            A coordination layer on top of Infinite Campus sign-ups and teacher requests. 
            Built to help match tutors to students and give the program a real-time view of coverage.
          </p>
        </div>

        {status === "unauthenticated" && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/ALportal/signin"
              className="rounded-lg bg-alp-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-alp-brand-700"
            >
              Sign in
            </Link>
          </div>
        )}

        {needsSetup && (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-alp-brand-200 bg-white/90 p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Welcome! One quick step.</h2>
            <p className="mt-1.5 text-sm text-slate-500">Tell us whether you&apos;re a tutor or a student.</p>
            <Link
              href="/ALportal/welcome"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-alp-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-alp-brand-700"
            >
              Set up my account
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        {status === "authenticated" && !data && (
          <p className="mt-12 text-center text-sm text-slate-400">
            {error === "network" ? "Having trouble connecting. Retrying…" : "Loading your account…"}
          </p>
        )}

        <div className="mx-auto mt-12 max-w-sm">
          {cards.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.role}
                href={r.href}
                className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(31,53,87,0.15)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-alp-brand-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-16px_rgba(47,95,160,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alp-brand-50 text-alp-brand-600 transition-colors group-hover:bg-alp-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Signed in as</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-900">{r.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{r.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-alp-brand-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-alp-brand-600">
                  Go to my dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Pilot program: accounts, sessions, and sign-ups here are part of a trial run.
        </p>
      </div>
    </div>
  );
}
