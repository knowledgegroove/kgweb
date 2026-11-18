// Confirmation emails, sent from the program Gmail account via SMTP (app password).
import nodemailer from "nodemailer";

const TIME_ZONE = "America/Los_Angeles";

export type EmailStatus = "sent" | "skipped" | "failed";

export interface ConfirmationDetails {
  sessionId: string;
  to: string;
  studentName: string;
  tutorName: string;
  subject: string;
  startsAt: Date;
  durationMin: number;
  meetLink: string;
  notes: string | null;
}

/** Tolerates pasted values: trims the address and drops the spaces Google shows in app passwords. */
function gmailCredentials() {
  const user = (process.env.GMAIL_USER ?? "").trim();
  const pass = (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "");
  return user && pass ? { user, pass } : null;
}

export function emailConfigured() {
  return gmailCredentials() !== null;
}

function formatWhen(start: Date, end: Date) {
  const day = start.toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const time = (d: Date, withZone: boolean) =>
    d.toLocaleTimeString("en-US", {
      timeZone: TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      ...(withZone ? { timeZoneName: "short" } : {}),
    });
  return `${day} · ${time(start, false)} – ${time(end, true)}`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** RFC 5545 line folding (75 octets). */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

/**
 * Calendar invite. The UID is the same for the confirmation and a later cancellation, so a CANCEL
 * removes the event the student's calendar added from the original invite.
 */
function buildIcs(d: ConfirmationDetails, organizer: string, end: Date, method: "REQUEST" | "CANCEL") {
  const cancel = method === "CANCEL";
  const description = [
    `Academic Leadership tutoring session with ${d.tutorName}.`,
    cancel ? "This session was cancelled." : `Join Google Meet: ${d.meetLink}`,
    !cancel && d.notes ? `Notes: ${d.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DVHS Academic Leadership//Portal//EN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${d.sessionId}.${d.to}@alportal`,
    `SEQUENCE:${cancel ? 1 : 0}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(d.startsAt)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(`${cancel ? "Cancelled: " : ""}${d.subject} tutoring with ${d.tutorName}`)}`,
    `DESCRIPTION:${icsText(description)}`,
    `LOCATION:${icsText(d.meetLink)}`,
    `URL:${d.meetLink}`,
    `ORGANIZER;CN=DVHS Academic Leadership:mailto:${organizer}`,
    `ATTENDEE;CN=${icsText(d.studentName)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${d.to}`,
    cancel ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
    ...(cancel
      ? []
      : ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Tutoring session starts in 10 minutes", "TRIGGER:-PT10M", "END:VALARM"]),
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}

export async function sendSessionConfirmation(d: ConfirmationDetails): Promise<EmailStatus> {
  const creds = gmailCredentials();
  if (!creds) {
    console.warn("[ALportal] confirmation email skipped: GMAIL_USER / GMAIL_APP_PASSWORD not set");
    return "skipped";
  }
  const { user, pass } = creds;

  const end = new Date(d.startsAt.getTime() + d.durationMin * 60_000);
  const when = formatWhen(d.startsAt, end);
  const first = d.studentName.split(" ")[0] || d.studentName;

  const text = [
    `Hi ${first},`,
    "",
    `You're signed up for ${d.subject} tutoring with ${d.tutorName}.`,
    "",
    `When: ${when}`,
    `Join Google Meet: ${d.meetLink}`,
    d.notes ? `Notes from your tutor: ${d.notes}` : "",
    "",
    "A calendar invite is attached. See you there!",
    "— DVHS Academic Leadership",
  ]
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#2f5fa0">DVHS Academic Leadership</p>
<h1 style="margin:8px 0 0;font-size:22px;color:#1f3557">You're signed up!</h1>
<p style="margin:12px 0 0;font-size:15px;line-height:1.5">Hi ${escapeHtml(first)}, you're confirmed for <strong>${escapeHtml(d.subject)}</strong> tutoring with <strong>${escapeHtml(d.tutorName)}</strong>.</p>
</td></tr>
<tr><td style="padding:16px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5fb;border-radius:12px">
<tr><td style="padding:14px 16px;font-size:14px;line-height:1.6">
<strong>When:</strong> ${escapeHtml(when)}<br>
<strong>Where:</strong> Google Meet (online)${d.notes ? `<br><strong>Notes:</strong> ${escapeHtml(d.notes)}` : ""}
</td></tr></table>
</td></tr>
<tr><td style="padding:4px 28px 8px">
<a href="${escapeHtml(d.meetLink)}" style="display:inline-block;background:#2f5fa0;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 22px;border-radius:10px">Join Google Meet</a>
<p style="margin:10px 0 0;font-size:12px;color:#64748b;word-break:break-all">${escapeHtml(d.meetLink)}</p>
</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:13px;color:#64748b;line-height:1.5">A calendar invite is attached so the session shows up in your calendar. Can't make it? Leave the session in the portal so someone else can take your seat.</td></tr>
</table></td></tr></table></body></html>`;

  try {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transport.sendMail({
      from: { name: "DVHS Academic Leadership", address: user },
      to: { name: d.studentName, address: d.to },
      subject: `Confirmed: ${d.subject} tutoring · ${when}`,
      text,
      html,
      icalEvent: { method: "REQUEST", filename: "invite.ics", content: buildIcs(d, user, end, "REQUEST") },
    });
    return "sent";
  } catch (err) {
    console.error("[ALportal] confirmation email failed:", err);
    return "failed";
  }
}

export async function sendSessionCancellation(d: ConfirmationDetails): Promise<EmailStatus> {
  const creds = gmailCredentials();
  if (!creds) {
    console.warn("[ALportal] cancellation email skipped: GMAIL_USER / GMAIL_APP_PASSWORD not set");
    return "skipped";
  }
  const { user, pass } = creds;

  const end = new Date(d.startsAt.getTime() + d.durationMin * 60_000);
  const when = formatWhen(d.startsAt, end);
  const first = d.studentName.split(" ")[0] || d.studentName;

  const text = [
    `Hi ${first},`,
    "",
    `Your ${d.subject} tutoring session with ${d.tutorName} has been cancelled.`,
    "",
    `Was: ${when}`,
    "",
    "It's been removed from your calendar. You can find another session in the portal.",
    "— DVHS Academic Leadership",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#2f5fa0">DVHS Academic Leadership</p>
<h1 style="margin:8px 0 0;font-size:22px;color:#9f1239">Session cancelled</h1>
<p style="margin:12px 0 0;font-size:15px;line-height:1.5">Hi ${escapeHtml(first)}, your <strong>${escapeHtml(d.subject)}</strong> tutoring session with <strong>${escapeHtml(d.tutorName)}</strong> has been cancelled.</p>
</td></tr>
<tr><td style="padding:16px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f2;border-radius:12px">
<tr><td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#4c0519"><strong>Was:</strong> <s>${escapeHtml(when)}</s></td></tr></table>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;color:#64748b;line-height:1.5">It's been removed from your calendar. You can find another session in the Academic Leadership portal.</td></tr>
</table></td></tr></table></body></html>`;

  try {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transport.sendMail({
      from: { name: "DVHS Academic Leadership", address: user },
      to: { name: d.studentName, address: d.to },
      subject: `Cancelled: ${d.subject} tutoring · ${when}`,
      text,
      html,
      icalEvent: { method: "CANCEL", filename: "cancel.ics", content: buildIcs(d, user, end, "CANCEL") },
    });
    return "sent";
  } catch (err) {
    console.error("[ALportal] cancellation email failed:", err);
    return "failed";
  }
}
