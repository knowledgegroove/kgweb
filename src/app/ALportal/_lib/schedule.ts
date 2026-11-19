// Scheduling rules shared by the tutor form (client) and createSession (server).
// Sessions must start at or after 4:00 PM and end by 9:00 PM, Pacific time.

export const SCHOOL_TIME_ZONE = "America/Los_Angeles";
export const SESSION_DURATIONS = [30, 45, 50, 60] as const;
export const WINDOW_START_MIN = 16 * 60; // 4:00 PM
export const WINDOW_END_MIN = 21 * 60; // 9:00 PM
const SLOT_STEP_MIN = 15;

export const WINDOW_LABEL = "4:00–9:00 PM";

const pad = (n: number) => String(n).padStart(2, "0");

export function minutesToTime(m: number) {
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function timeToMinutes(t: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(t);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h < 24 && m < 60 ? h * 60 + m : null;
}

export function formatClock(m: number) {
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${pad(m % 60)} ${h >= 12 ? "PM" : "AM"}`;
}

export function isValidDuration(d: number): d is (typeof SESSION_DURATIONS)[number] {
  return (SESSION_DURATIONS as readonly number[]).includes(d);
}

/** Start time fits the window for this length, on a 15-minute boundary. */
export function isValidStart(startMin: number, durationMin: number) {
  return (
    startMin >= WINDOW_START_MIN &&
    startMin + durationMin <= WINDOW_END_MIN &&
    (startMin - WINDOW_START_MIN) % SLOT_STEP_MIN === 0
  );
}

/** All start times (minutes after midnight) that fit the window for this length. */
export function startSlots(durationMin: number): number[] {
  const slots: number[] = [];
  for (let m = WINDOW_START_MIN; m + durationMin <= WINDOW_END_MIN; m += SLOT_STEP_MIN) slots.push(m);
  return slots;
}

/** Today's date and current minute-of-day in Pacific time, e.g. { date: "2026-11-18", minutes: 975 }. */
export function nowInSchoolZone(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SCHOOL_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function zoneOffsetMs(utcMs: number) {
  const { date, minutes } = nowInSchoolZone(new Date(utcMs));
  const [y, mo, d] = date.split("-").map(Number);
  const asIfUtc = Date.UTC(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60);
  return asIfUtc - Math.floor(utcMs / 60_000) * 60_000;
}

/** Converts a Pacific wall-clock date ("YYYY-MM-DD") + minute-of-day to a UTC Date (DST-aware). */
export function schoolTimeToUtc(date: string, minuteOfDay: number): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const naive = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, minuteOfDay);
  let utc = naive - zoneOffsetMs(naive);
  utc = naive - zoneOffsetMs(utc); // second pass settles DST edges
  return new Date(utc);
}

/**
 * Finds a real Google Meet meeting code in what the tutor pasted (a bare link, or a phone's whole
 * "share joining info" text) and returns the canonical link, https://meet.google.com/abc-defg-hij.
 * Drops extras like ?authuser=0 that can open the wrong account. Returns null for meet.google.com/new
 * (which starts a NEW meeting for whoever clicks it), the Meet home page, or anything without a code.
 * The result is always built from the code alone, so no other site can slip through.
 */
export function normalizeMeetLink(input: string): string | null {
  const match = /(?:^|[^a-z0-9.-])meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})(?![a-z0-9-])/i.exec(input);
  return match ? `https://meet.google.com/${match[1].toLowerCase()}` : null;
}
