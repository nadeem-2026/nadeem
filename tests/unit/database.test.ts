import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../helpers/database";

test("foundation migrations apply and protect approved defaults in PostgreSQL", async (t) => {
  const db = await createDatabase();
  t.after(() => db.close());

  await t.test("approved policy values and singleton constraint", async () => {
    const { rows } = await db.query<Record<string, unknown>>("select * from public.platform_settings");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].base_currency, "SAR");
    assert.equal(rows[0].display_time_zone, "Asia/Riyadh");
    assert.equal(rows[0].minimum_booking_notice_minutes, 1440);
    assert.equal(rows[0].guide_response_minutes, 720);
    assert.equal(rows[0].payment_window_minutes, 30);
    assert.equal(rows[0].tour_buffer_minutes, 30);
    assert.equal(rows[0].commission_basis_points, 1000);
    assert.equal(rows[0].payout_objection_window_minutes, 1440);
    await assert.rejects(db.exec("insert into public.platform_settings select * from public.platform_settings"), /duplicate key/);
    await assert.rejects(db.exec("update public.platform_settings set singleton = false"), /check constraint/);
    await assert.rejects(db.exec("update public.platform_settings set commission_basis_points = 10001"), /check constraint/);
    await assert.rejects(db.exec("update public.platform_settings set payment_window_minutes = 0"), /check constraint/);
    await assert.rejects(db.exec("update public.platform_settings set base_currency = 'USD'"), /check constraint/);
  });

  for (const role of ["anon", "authenticated"]) {
    await t.test(`${role} cannot read or mutate platform settings`, async () => {
      await db.exec(`set role ${role}`);
      try {
        await assert.rejects(db.exec("select * from public.platform_settings"), /permission denied/);
        await assert.rejects(db.exec("update public.platform_settings set commission_basis_points = 0"), /permission denied/);
        await assert.rejects(db.exec("delete from public.platform_settings"), /permission denied/);
      } finally { await db.exec("reset role"); }
    });
    await t.test(`${role} remains blocked by RLS even if a table grant is accidentally added`, async () => {
      await db.exec(`grant select, insert, update, delete on public.platform_settings to ${role}`);
      await db.exec(`set role ${role}`);
      try {
        const { rows } = await db.query("select * from public.platform_settings");
        assert.equal(rows.length, 0);
        const update = await db.query("update public.platform_settings set commission_basis_points = 0 returning singleton");
        assert.equal(update.rows.length, 0);
        const deletion = await db.query("delete from public.platform_settings returning singleton");
        assert.equal(deletion.rows.length, 0);
        await assert.rejects(db.exec(`insert into public.platform_settings
          (requirements_version, minimum_booking_notice_minutes, guide_response_minutes, payment_window_minutes,
          tour_buffer_minutes, commission_basis_points, payout_objection_window_minutes,
          chat_after_completion_minutes, no_show_reporting_delay_minutes)
          values ('test', 1440, 720, 30, 30, 1000, 1440, 1440, 30)`), /row-level security/);
      } finally {
        await db.exec("reset role");
        await db.exec(`revoke all on public.platform_settings from ${role}`);
      }
    });
  }
  await t.test("RLS is enabled and forced, no permissive policies are installed", async () => {
    const { rows } = await db.query("select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.platform_settings'::regclass");
    assert.deepEqual(rows[0], { relrowsecurity: true, relforcerowsecurity: true });
    assert.equal((await db.query("select * from pg_policies where tablename = 'platform_settings'")).rows.length, 0);
    assert.equal((await db.query<{ commission_basis_points: number }>("select commission_basis_points from public.platform_settings")).rows[0].commission_basis_points, 1000);
  });
});
