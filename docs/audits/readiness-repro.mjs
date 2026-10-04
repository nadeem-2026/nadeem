// Historical pre-fix reproduction (migrations through 20261002064900 only).
// Isolated audit only: in-memory PostgreSQL, synthetic users, no network.
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { readFile, readdir } from 'node:fs/promises';
const db = new PGlite({ extensions: { btree_gist } });
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb not null default '{}', email_confirmed_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    create publication supabase_realtime;
    alter default privileges in schema public grant all on tables to anon, authenticated;`);
  const dir = new URL('../../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(dir)).filter(f => /^\d+.*\.sql$/.test(f) && f.slice(0, 14) <= '20261002064900').sort()) {
    await db.exec(await readFile(new URL(file, dir), 'utf8'));
  }
  const tourist = '00000000-0000-4000-8000-000000000001';
  const guide = '00000000-0000-4000-8000-000000000002';
  await db.query(`insert into auth.users(id,raw_user_meta_data) values ($1,'{"account_type":"tourist"}'),($2,'{"account_type":"guide"}')`, [tourist,guide]);
  const booking = async (start='2030-01-01 10:00+00',end='2030-01-01 12:00+00') => (await db.query(`insert into public.bookings(tourist_id,guide_id,start_time,end_time,duration_hours,participants,meeting_point,total_price,status) values ($1,$2,$3,$4,2,1,'Audit',200,'awaiting_payment') returning id`,[tourist,guide,start,end])).rows[0].id;
  const first = await booking(); const second = await booking();
  console.log('Overlapping awaiting_payment reservations accepted:', (await db.query('select count(*) from bookings')).rows[0].count);
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${tourist}',false);`);
  await db.query(`update bookings set status='confirmed', total_price=0 where id=$1`,[first]);
  console.log('Tourist directly confirmed and repriced own booking:',(await db.query('select status,total_price from bookings where id=$1',[first])).rows[0]);
  try { await db.query(`insert into payments(booking_id,tourist_id,charge_id,amount) values ($1,$2,'audit-denied',200)`,[first,tourist]); }
  catch(e) { console.log('Authenticated payment insert rejected:',e.message); }
  await db.exec('reset role');
  await db.query(`update bookings set status='cancelled' where id=$1`,[first]);
  await db.query(`insert into payments(booking_id,tourist_id,charge_id,amount) values ($1,$2,'audit-charge',200)`,[second,tourist]);
  await db.exec(`set role anon; select public.handle_payment_webhook('audit-charge','captured',null); reset role;`);
  console.log('Anonymous payment callback confirmed booking:',(await db.query('select status from bookings where id=$1',[second])).rows[0]);
  await db.query(`update bookings set status='completed' where id=$1`,[second]);
  await db.exec(`set role anon; select public.handle_payment_webhook('audit-charge','captured',null); reset role;`);
  console.log('Replayed payment callback reverted completed tour:',(await db.query('select status from bookings where id=$1',[second])).rows[0]);
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${guide}',false);`);
  console.log('Guide can read tourist OTP:',Boolean((await db.query('select tour_otp from bookings where id=$1',[second])).rows[0].tour_otp));
  try { await db.exec(`select public.save_guide_profile('Audit','Riyadh','Audit biography',array['Arabic'],array['Riyadh'],100,2,array['Tour'],false)`); }
  catch(e) { console.log('Guide profile save rejected:',e.message); }
  await db.query(`insert into notifications(user_id,title,body) values ($1,'Forged system message','Audit only')`,[tourist]);
  console.log('Guide inserted arbitrary notification addressed to another user: true');
} finally { await db.close(); }
