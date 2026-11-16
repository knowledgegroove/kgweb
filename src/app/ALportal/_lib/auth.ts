import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Comma-separated list of allowed email domains, e.g. "srvusd.net,students.srvusd.net".
// Empty = any verified Google account may sign in.
const allowedDomains = (process.env.AUTH_ALLOWED_EMAIL_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

// Guest sign-in is for the pilot/trial only. Set AUTH_GUEST_ENABLED=false to turn it off.
const guestEnabled = process.env.AUTH_GUEST_ENABLED !== "false";

export const AUTH_BASE_PATH = "/ALportal/api/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: AUTH_BASE_PATH,
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
          ...(allowedDomains.length === 1 ? { hd: allowedDomains[0] } : {}),
        },
      },
    }),
    ...(guestEnabled
      ? [
          Credentials({
            id: "guest",
            name: "Guest",
            credentials: { name: { label: "Display name", type: "text" } },
            authorize(credentials) {
              const raw = typeof credentials?.name === "string" ? credentials.name : "";
              const name = raw.replace(/\s+/g, " ").trim().slice(0, 40);
              return { id: `guest-${crypto.randomUUID()}`, name: name || "Guest", email: null };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/ALportal/signin", error: "/ALportal/signin" },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === "guest") return guestEnabled;
      if (!profile?.email || profile.email_verified === false) return false;
      if (allowedDomains.length === 0) return true;
      const domain = profile.email.split("@")[1]?.toLowerCase();
      return Boolean(domain && allowedDomains.includes(domain));
    },
    jwt({ token, account }) {
      if (account) token.isGuest = account.provider === "guest";
      return token;
    },
    session({ session, token }) {
      (session.user as { isGuest?: boolean }).isGuest = Boolean(token.isGuest);
      return session;
    },
  },
});
