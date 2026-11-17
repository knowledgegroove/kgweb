"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { usePortal } from "../_lib/portal-client";
import { ROLE_HOME, type PortalData, type Role } from "../_lib/types";
import { Card } from "./ui";

type DataFor<R extends Role> = Extract<PortalData, { viewer: { role: R } }>;

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">{children}</div>;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">{label}</div>;
}

export function ReauthCard() {
  return (
    <Centered>
      <Card className="w-full p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Please sign in again</h1>
        <p className="mt-2 text-sm text-slate-500">The portal was updated, so your sign-in needs a refresh.</p>
        <button
          onClick={() => signOut({ callbackUrl: "/ALportal/signin" })}
          className="mt-5 cursor-pointer rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-alp-brand-700"
        >
          Sign in again
        </button>
      </Card>
    </Centered>
  );
}

/** Renders children only for viewers with the given role; otherwise explains / redirects. */
export function RoleGate<R extends Role>({
  role,
  children,
}: {
  role: R;
  children: (data: DataFor<R>) => React.ReactNode;
}) {
  const { data, error } = usePortal();
  const router = useRouter();
  const needsSetup = data !== null && data.viewer.role === null;

  useEffect(() => {
    if (needsSetup) router.replace("/ALportal/welcome");
  }, [needsSetup, router]);

  if (error === "reauth") return <ReauthCard />;
  if (!data && error === "network") return <Loading label="Having trouble connecting. Retrying…" />;
  if (!data || needsSetup) return <Loading />;
  const viewerRole = data.viewer.role;
  if (viewerRole !== role) {
    return (
      <Centered>
        <Card className="w-full p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">This page is for {role}s</h1>
          <p className="mt-2 text-sm text-slate-500">You&apos;re signed in as a {viewerRole}.</p>
          {viewerRole && (
            <Link
              href={ROLE_HOME[viewerRole]}
              className="mt-5 inline-block rounded-lg bg-alp-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-alp-brand-700"
            >
              Go to my dashboard
            </Link>
          )}
        </Card>
      </Centered>
    );
  }
  return <>{children(data as DataFor<R>)}</>;
}
