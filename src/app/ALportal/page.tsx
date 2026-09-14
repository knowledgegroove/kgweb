"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, GraduationCap, Users } from "lucide-react";
import { useAppData } from "./_lib/store";
import { Role } from "./_lib/types";
import { Logo } from "./_components/Logo";

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
    description: "Coverage, matching, and program-wide stats in one place.",
    icon: LayoutDashboard,
    bullets: [
      "Match incoming requests to available tutors",
      "See subject coverage gaps at a glance",
      "Track sessions and hours across the program",
    ],
  },
  {
    role: "tutor",
    href: "/ALportal/tutor",
    title: "Tutor",
    description: "For AL students — your schedule, sessions, and Q&A replies.",
    icon: Users,
    bullets: [
      "See your assigned sessions this week",
      "Schedule online sessions",
      "Track your monthly hours and sessions",
      "Answer async follow-up questions",
    ],
  },
  {
    role: "student",
    href: "/ALportal/student",
    title: "Student",
    description: "Find a tutor by subject and ask follow-up questions anytime.",
    icon: GraduationCap,
    bullets: [
      "Browse tutors by subject & period",
      "Get routed to Infinite Campus to book",
      "Join supervised sessions",
      "Post a question to the Q&A board",
    ],
  },
];

export default function Home() {
  const { setRole } = useAppData();

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
            A coordination layer on top of Infinite Campus sign-ups and teacher requests —
            built to help match tutors to students and give the program a real-time view of coverage.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.role}
                href={r.href}
                onClick={() => setRole(r.role)}
                className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(31,53,87,0.15)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-alp-brand-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-16px_rgba(47,95,160,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alp-brand-50 text-alp-brand-600 transition-colors group-hover:bg-alp-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Enter as
                </p>
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
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Prototype for review — sign-ups still happen in Infinite Campus, in-class requests still come via the
          teacher Google Form. This portal sits on top to coordinate what happens next.
        </p>
      </div>
    </div>
  );
}
