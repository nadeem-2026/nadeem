import { readFile, readdir } from "node:fs/promises";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { PGlite } from "@electric-sql/pglite";

export async function createDatabase() {
  const db = new PGlite({ extensions: { btree_gist } });
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create publication supabase_realtime;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb not null default '{}', email_confirmed_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  const directory = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(directory)).filter((f) => /^\d+.*\.sql$/.test(f)).sort()) {
    await db.exec(await readFile(new URL(file, directory), "utf8"));
  }
  return db;
}
