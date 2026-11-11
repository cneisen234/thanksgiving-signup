// Neon Postgres — the simple HTTP client (no pooling/ORM needed for one table).
// In production Vercel's Neon integration injects DATABASE_URL automatically,
// same as the other sites; locally it comes from .env.local.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Created lazily on first query (not at import) so `next build` doesn't need a
// live connection string — Vercel injects DATABASE_URL at runtime, and local
// dev reads it from .env.local.
let _sql: NeonQueryFunction<false, false> | null = null;
function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — add the Neon connection string (Vercel injects it in production; copy it into .env.local for local dev).",
    );
  }
  _sql = neon(connectionString);
  return _sql;
}

// The six buckets a Thanksgiving potluck splits into. Kept here so the form and
// the sheet stay in sync.
export const CATEGORIES = [
  "Turkey & Main",
  "Sides",
  "Appetizers",
  "Desserts",
  "Drinks",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Signup = {
  id: number;
  name: string;
  item: string;
  category: Category;
  note: string | null;
  createdAt: string;
};

// Self-initializing: creates the table on first use so there's nothing to
// migrate. Safe to call every request (IF NOT EXISTS is a no-op once it exists).
let ready: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  ready ??= (async () => {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        item        TEXT NOT NULL,
        category    TEXT NOT NULL,
        note        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  })();
  return ready;
}

export async function listSignups(): Promise<Signup[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, item, category, note, created_at
    FROM signups
    ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    item: r.item as string,
    category: r.category as Category,
    note: (r.note as string | null) ?? null,
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

export async function addSignup(input: {
  name: string;
  item: string;
  category: Category;
  note?: string | null;
}): Promise<Signup> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO signups (name, item, category, note)
    VALUES (
      ${input.name},
      ${input.item},
      ${input.category},
      ${input.note ?? null}
    )
    RETURNING id, name, item, category, note, created_at
  `;
  return {
    id: row.id as number,
    name: row.name as string,
    item: row.item as string,
    category: row.category as Category,
    note: (row.note as string | null) ?? null,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export async function deleteSignup(id: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM signups WHERE id = ${id}`;
}
