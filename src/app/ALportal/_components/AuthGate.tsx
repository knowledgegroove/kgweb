"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePortal } from "../_lib/portal-client";
import { ReauthCard } from "./RoleGate";

const PUBLIC_PATHS = ["/ALportal", "/ALportal/signin"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { error } = usePortal();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublic) router.replace("/ALportal/signin");
  }, [status, isPublic, router]);

  // Signed in with a session from before accounts existed: ask for a fresh sign-in.
  if (status === "authenticated" && error === "reauth" && pathname !== "/ALportal/signin") {
    return <ReauthCard />;
  }
  if (!isPublic && status !== "authenticated") {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">Checking sign-in…</div>;
  }
  return <>{children}</>;
}
