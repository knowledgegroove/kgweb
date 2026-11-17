import type { PortalSession } from "./types";

export function formatSessionTime(startsAt: string, durationMin: number) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const day = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const t = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${t(start)} – ${t(end)}`;
}

/** Hasn't ended yet. */
export function isUpcoming(s: Pick<PortalSession, "startsAt" | "durationMin">) {
  return new Date(s.startsAt).getTime() + s.durationMin * 60_000 > Date.now();
}
