import { LucideIcon } from "lucide-react";
import { RequestSource, RequestStatus } from "../_lib/types";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-alp-display text-[1.75rem] leading-tight tracking-tight text-alp-brand-900">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_16px_-10px_rgba(31,53,87,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: "default" | "amber" | "green" | "red";
  icon?: LucideIcon;
}) {
  const toneClasses: Record<string, { text: string; chip: string }> = {
    default: { text: "text-alp-brand-900", chip: "bg-alp-brand-50 text-alp-brand-600" },
    amber: { text: "text-amber-600", chip: "bg-amber-50 text-amber-600" },
    green: { text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-600" },
    red: { text: "text-rose-600", chip: "bg-rose-50 text-rose-600" },
  };
  const t = toneClasses[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.chip}`}>
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        )}
      </div>
      <p className={`mt-1.5 text-3xl font-semibold tabular-nums ${t.text}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </Card>
  );
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  open: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  assigned: "bg-alp-brand-50 text-alp-brand-700 ring-1 ring-inset ring-alp-brand-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

const SOURCE_STYLES: Record<RequestSource, string> = {
  "Infinite Campus": "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  "Teacher Google Form": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  Portal: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
};

export function SourceBadge({ source }: { source: RequestSource }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${SOURCE_STYLES[source]}`}>
      {source}
    </span>
  );
}

export function SubjectPill({ subject, muted = false }: { subject: string; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        muted ? "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200" : "bg-alp-brand-50 text-alp-brand-700"
      }`}
    >
      {subject}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };
  const hue = Math.abs(hashCode(name)) % 6;
  const palette = [
    "bg-alp-brand-100 text-alp-brand-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses[size]} ${palette[hue]}`}
    >
      {initials}
    </div>
  );
}

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
