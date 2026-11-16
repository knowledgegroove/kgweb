import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Comma-separated list of allowed email domains, e.g. "srvusd.net,students.srvusd.net".
// Empty = any verified Google account may sign in.
const allowedDomains = (process.env.AUTH_ALLOWED_EMAIL_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

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
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/ALportal/signin", error: "/ALportal/signin" },
  callbacks: {
    signIn({ profile }) {
      if (!profile?.email || profile.email_verified === false) return false;
      if (allowedDomains.length === 0) return true;
      const domain = profile.email.split("@")[1]?.toLowerCase();
      return Boolean(domain && allowedDomains.includes(domain));
    },
  },
});
