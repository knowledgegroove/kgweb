"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PUBLIC_PATHS = ["/ALportal", "/ALportal/signin"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublic) router.replace("/ALportal/signin");
  }, [status, isPublic, router]);

  if (!isPublic && status !== "authenticated") {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">Checking sign-in…</div>;
  }
  return <>{children}</>;
}
