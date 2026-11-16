"use client";

import { Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "../_components/Logo";

function SignInCard() {
  const params = useSearchParams();
  const { status } = useSession();
  const router = useRouter();
  const error = params.get("error");

  useEffect(() => {
    if (status === "authenticated") router.replace("/ALportal");
  }, [status, router]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <Logo size={64} />
      </div>
      <h1 className="font-alp-display text-2xl text-alp-brand-900">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">Use your Google account to access the Academic Leadership portal.</p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error === "AccessDenied"
            ? "That account isn't allowed. Please sign in with your school Google account."
            : "Sign-in didn't work. Please try again."}
        </p>
      )}
      <button
        onClick={() => signIn("google", { callbackUrl: "/ALportal" })}
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alp-brand-200"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
          <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Suspense>
        <SignInCard />
      </Suspense>
    </div>
  );
}
