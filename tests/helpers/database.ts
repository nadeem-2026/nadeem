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
    create schema storage;
    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid default gen_random_uuid() primary key,
      bucket_id text references storage.buckets(id),
      name text,
      owner uuid
    );
    create or replace function storage.foldername(name text) returns text[] language sql immutable as $$
      select string_to_array(name, '/');
    $$;
    alter table storage.objects enable row level security;
  `);
  const directory = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(directory)).filter((f) => /^\d+.*\.sql$/.test(f)).sort()) {
    await db.exec(await readFile(new URL(file, directory), "utf8"));
  }
  return db;
}
