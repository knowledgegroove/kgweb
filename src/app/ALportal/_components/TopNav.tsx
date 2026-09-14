"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppData } from "../_lib/store";
import { Role } from "../_lib/types";
import { Logo } from "./Logo";

const ROLE_LABELS: Record<Role, string> = {
  coordinator: "Coordinator",
  tutor: "Tutor",
  student: "Student",
};

const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  coordinator: [
    { href: "/ALportal/coordinator", label: "Dashboard" },
    { href: "/ALportal/coordinator/requests", label: "Requests & Matching" },
    { href: "/ALportal/coordinator/tutors", label: "Tutor Roster" },
    { href: "/ALportal/qa", label: "Q&A Board" },
  ],
  tutor: [
    { href: "/ALportal/tutor", label: "My Dashboard" },
    { href: "/ALportal/qa", label: "Q&A Board" },
  ],
  student: [
    { href: "/ALportal/student", label: "Find a Tutor" },
    { href: "/ALportal/student/sessions", label: "Join a Session" },
    { href: "/ALportal/qa", label: "Q&A Board" },
  ],
};

export default function TopNav() {
  const { role, setRole } = useAppData();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/ALportal") return null;

  const handleRoleChange = (r: Role) => {
    setRole(r);
    if (r === "coordinator") router.push("/ALportal/coordinator");
    if (r === "tutor") router.push("/ALportal/tutor");
    if (r === "student") router.push("/ALportal/student");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/ALportal" className="flex items-center gap-2.5 shrink-0">
          <Logo size={38} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">DVHS Academic Leadership</p>
            <p className="text-xs text-slate-500">Online Portal</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS[role].map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-alp-brand-600 text-white"
                    : "text-slate-600 hover:bg-alp-brand-50 hover:text-alp-brand-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-slate-400 sm:inline">Viewing as</span>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-sm">
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`rounded-md px-2.5 py-1.5 font-medium transition-colors cursor-pointer ${
                  role === r
                    ? "bg-white text-alp-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1.5 md:hidden">
        {NAV_LINKS[role].map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                active ? "bg-alp-brand-600 text-white" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
