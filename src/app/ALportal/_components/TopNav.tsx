"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortal } from "../_lib/portal-client";
import type { Role } from "../_lib/types";
import { Logo } from "./Logo";
import AccountBadge from "./AccountBadge";

const ROLE_LABELS: Record<Role, string> = {
  coordinator: "Coordinator",
  tutor: "Tutor",
  student: "Student",
};

const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  coordinator: [{ href: "/ALportal/coordinator", label: "Dashboard" }],
  tutor: [{ href: "/ALportal/tutor", label: "My Dashboard" }],
  student: [{ href: "/ALportal/student", label: "Sessions" }],
};

export default function TopNav() {
  const pathname = usePathname();
  const { data } = usePortal();
  const role = data?.viewer.role ?? null;

  if (pathname === "/ALportal" || pathname === "/ALportal/signin") return null;

  const links = role ? NAV_LINKS[role] : [];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/ALportal" className="flex shrink-0 items-center gap-2.5">
          <Logo size={38} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">DVHS Academic Leadership</p>
            <p className="text-xs text-slate-500">Online Portal</p>
          </div>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-alp-brand-600 text-white" : "text-slate-600 hover:bg-alp-brand-50 hover:text-alp-brand-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {role && (
            <span className="rounded-full bg-alp-brand-50 px-2.5 py-1 text-xs font-semibold text-alp-brand-700 ring-1 ring-inset ring-alp-brand-200">
              {ROLE_LABELS[role]}
            </span>
          )}
          <div className="border-l border-slate-200 pl-3">
            <AccountBadge compact />
          </div>
        </div>
      </div>
    </header>
  );
}
