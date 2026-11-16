"use client";

import { signOut, useSession } from "next-auth/react";

/** Shows who is signed in (name, email or "Trial guest") with a sign-out button. */
export default function AccountBadge({ compact = false }: { compact?: boolean }) {
  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string | null; email?: string | null; isGuest?: boolean }
    | undefined;
  if (!user) return null;

  const name = user.name || user.email || "Signed in";
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="flex items-center gap-2.5">
      <div
        title={user.isGuest ? `${name} (trial guest)` : `${name}${user.email ? ` · ${user.email}` : ""}`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          user.isGuest ? "bg-amber-100 text-amber-800" : "bg-alp-brand-100 text-alp-brand-700"
        }`}
      >
        {initials}
      </div>
      <div className={`min-w-0 leading-tight ${compact ? "hidden xl:block" : ""}`}>
        <p className="max-w-[9rem] truncate text-sm font-medium text-slate-800 sm:max-w-[12rem]" title={name}>
          {name}
        </p>
        {user.isGuest ? (
          <p className="text-[11px] font-medium text-amber-700">Trial guest</p>
        ) : (
          <p className="hidden max-w-[12rem] truncate text-[11px] text-slate-500 sm:block" title={user.email ?? ""}>
            {user.email}
          </p>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/ALportal" })}
        className="cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        Sign out
      </button>
    </div>
  );
}
