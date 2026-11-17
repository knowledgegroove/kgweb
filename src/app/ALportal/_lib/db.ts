// Server-only database access for the AL portal.
// Production: Postgres via DATABASE_URL (Neon, added through the Vercel Marketplace).
// Local dev without DATABASE_URL: PGlite, an in-process Postgres stored in ./.pglite.

type Row = Record<string, unknown>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

const g = globalThis as unknown as { __alpQuery?: Promise<QueryFn>; __alpSchema?: Promise<void> };

async function createQuery(): Promise<QueryFn> {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    return (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Add a Postgres (Neon) database to this Vercel project.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync("./.pglite", { recursive: true });
  const db = new PGlite("./.pglite/alportal");
  await db.waitReady;
  return async (text, params = []) => (await db.query<Row>(text, params)).rows;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS alp_users (
     id TEXT PRIMARY KEY,
     email TEXT,
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('tutor', 'student')),
     is_guest BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS alp_tutor_subjects (
     tutor_id TEXT NOT NULL REFERENCES alp_users(id) ON DELETE CASCADE,
     subject TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (tutor_id, subject)
   )`,
  `CREATE TABLE IF NOT EXISTS alp_sessions (
     id TEXT PRIMARY KEY,
     tutor_id TEXT NOT NULL REFERENCES alp_users(id) ON DELETE CASCADE,
     subject TEXT NOT NULL,
     starts_at TIMESTAMPTZ NOT NULL,
     duration_min INTEGER NOT NULL,
     capacity INTEGER NOT NULL,
     meet_link TEXT NOT NULL,
     notes TEXT,
     cancelled_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS alp_signups (
     session_id TEXT NOT NULL REFERENCES alp_sessions(id) ON DELETE CASCADE,
     student_id TEXT NOT NULL REFERENCES alp_users(id) ON DELETE CASCADE,
     student_name TEXT NOT NULL,
     student_email TEXT NOT NULL,
     email_status TEXT NOT NULL DEFAULT 'pending',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (session_id, student_id)
   )`,
];

/** Run a parameterized query ($1, $2, …). Creates the tables on first use. */
export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  g.__alpQuery ??= createQuery().catch((err) => {
    g.__alpQuery = undefined; // retry on the next request
    throw err;
  });
  const q = await g.__alpQuery;
  g.__alpSchema ??= (async () => {
    for (const stmt of SCHEMA) await q(stmt);
  })().catch((err) => {
    g.__alpSchema = undefined; // retry on the next request
    throw err;
  });
  await g.__alpSchema;
  return (await q(text, params)) as T[];
}

export function toIso(value: unknown): string {
  return new Date(value as string | Date).toISOString();
}
