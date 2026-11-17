"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, Check } from "lucide-react";
import { usePortal } from "../_lib/portal-client";
import { setupProfile } from "../_lib/actions";
import { SUBJECTS } from "../_lib/subjects";
import { ROLE_HOME } from "../_lib/types";
import { Card } from "../_components/ui";
import { Loading, ReauthCard } from "../_components/RoleGate";

export default function WelcomePage() {
  const { data, error, refresh } = usePortal();
  const router = useRouter();
  const [role, setRole] = useState<"tutor" | "student" | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const existingRole = data?.viewer.role ?? null;
  useEffect(() => {
    if (existingRole) router.replace(ROLE_HOME[existingRole]);
  }, [existingRole, router]);

  if (error === "reauth") return <ReauthCard />;
  if (!data || existingRole) return <Loading />;

  const canTutor = "canRegisterAsTutor" in data ? data.canRegisterAsTutor : false;
  const displayName = name ?? (data.viewer.name === "Guest" ? "" : data.viewer.name);

  const toggleSubject = (s: string) =>
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const canSubmit =
    role !== null && displayName.trim().length >= 2 && (role === "student" || subjects.length > 0) && !saving;

  const submit = async () => {
    if (!role) return;
    setSaving(true);
    setMessage(null);
    const res = await setupProfile({ role, name: displayName, subjects });
    if (!res.ok) {
      setMessage(res.error);
      setSaving(false);
      return;
    }
    await refresh();
    router.replace(ROLE_HOME[role]);
  };

  const roleOptions = [
    {
      value: "tutor" as const,
      title: "I'm a tutor",
      body: "Academic Leadership member. Schedule online sessions in subjects the coordinator approves.",
      icon: Users,
      disabled: !canTutor,
    },
    {
      value: "student" as const,
      title: "I'm a student",
      body: "Find upcoming tutoring sessions and join one. You'll get a confirmation email with the Meet link.",
      icon: GraduationCap,
      disabled: false,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-alp-display text-3xl tracking-tight text-alp-brand-900">Set up your account</h1>
      <p className="mt-2 text-sm text-slate-500">Just once. This tells the portal what to show you.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {roleOptions.map((o) => {
          const Icon = o.icon;
          const selected = role === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={o.disabled}
              onClick={() => setRole(o.value)}
              aria-pressed={selected}
              className={`relative cursor-pointer rounded-2xl border bg-white p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-alp-brand-500 ring-2 ring-alp-brand-200"
                  : "border-slate-200 hover:border-alp-brand-300"
              }`}
            >
              {selected && (
                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-alp-brand-600 text-white">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-alp-brand-50 text-alp-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-base font-semibold text-slate-900">{o.title}</p>
              <p className="mt-1 text-sm text-slate-500">{o.body}</p>
              {o.disabled && (
                <p className="mt-2 text-xs font-medium text-amber-700">Tutors need to sign in with Google.</p>
              )}
            </button>
          );
        })}
      </div>

      {role && (
        <Card className="mt-6 p-5">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Your name
          </label>
          <p className="text-xs text-slate-400">
            {role === "tutor" ? "Students see this on your sessions." : "Your tutor sees this when you join."}
          </p>
          <input
            id="name"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-alp-brand-400 focus:outline-none focus:ring-2 focus:ring-alp-brand-100 sm:max-w-sm"
          />

          {role === "tutor" && (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700">Subjects you can tutor</p>
              <p className="text-xs text-slate-400">
                The coordinator reviews and approves each one before you can schedule sessions for it.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUBJECTS.map((s) => {
                  const on = subjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      aria-pressed={on}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors ${
                        on
                          ? "bg-alp-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-alp-brand-50 hover:text-alp-brand-700"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="cursor-pointer rounded-lg bg-alp-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-alp-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Finish setup"}
            </button>
            {message && <p className="text-sm text-rose-600">{message}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
