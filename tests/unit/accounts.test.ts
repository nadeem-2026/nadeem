import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../helpers/database";
import { callbackDestination, registrationRole, passwordValid, emailValue } from "../../src/lib/auth/validation";

test("registration validation and recovery redirect allowlist", () => {
  assert.equal(registrationRole("admin"), null);
  assert.equal(registrationRole("guide"), "guide");
  assert.equal(passwordValid("short"), false);
  assert.equal(passwordValid("a".repeat(129)), false);
  assert.equal(passwordValid("a".repeat(12)), true);
  assert.equal(emailValue("not-an-email"), null);
  for (const next of ["https://evil.test", "//evil.test", "/ar/admin/guides", "/en/update-password", null]) assert.equal(callbackDestination("ar", next), "/ar/account");
  assert.equal(callbackDestination("ar", "/ar/update-password"), "/ar/update-password");
});

test("accounts and guide reviews enforce roles, isolation and audited transitions", async (t) => {
  const db = await createDatabase();
  t.after(() => db.close());
  const tourist = "10000000-0000-4000-8000-000000000001";
  const guide = "10000000-0000-4000-8000-000000000002";
  const other = "10000000-0000-4000-8000-000000000003";
  const admin = "10000000-0000-4000-8000-000000000004";
  for (const [id, role] of [[tourist, "admin"], [guide, "guide"], [other, "guide"], [admin, "tourist"]]) {
    await db.query("insert into auth.users(id, raw_user_meta_data) values($1, $2)", [id, { account_type: role, display_name: "Test account", role: "admin", status: "approved" }]);
  }
  // Test fixture only. The app has no admin signup or privilege-granting RPC.
  await db.query("update public.profiles set role = 'admin' where id = $1", [admin]);
  async function asUser<T>(id: string, fn: () => Promise<T>) {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    await db.exec("set role authenticated");
    try { return await fn(); } finally { await db.exec("reset role"); }
  }
  await t.test("signup cannot request admin or self-approval", async () => {
    assert.equal((await db.query<{ role: string }>("select role from profiles where id=$1", [tourist])).rows[0].role, "tourist");
    assert.equal((await db.query<{ status: string }>("select status from guide_profiles where user_id=$1", [guide])).rows[0].status, "draft");
    await db.query("update auth.users set raw_user_meta_data = '{\"account_type\":\"admin\"}' where id=$1", [guide]);
    assert.equal((await db.query<{ role: string }>("select role from profiles where id=$1", [guide])).rows[0].role, "guide");
  });
  await t.test("visitor cannot read profiles or invoke writes", async () => {
    await db.exec("set role anon");
    try {
      await assert.rejects(db.exec("select * from profiles"), /permission denied/);
      await assert.rejects(db.exec("select * from guide_profiles"), /permission denied/);
      await assert.rejects(db.exec("select save_guide_profile('Name','City','Bio',true)"), /permission denied/);
    } finally { await db.exec("reset role"); }
  });
  await t.test("guide reads only own profile and cannot directly mutate roles, status or audit", async () => {
    await asUser(guide, async () => {
      assert.equal((await db.query("select * from profiles")).rows.length, 1);
      assert.equal((await db.query("select * from guide_profiles")).rows.length, 1);
      assert.equal((await db.query("select * from audit_logs")).rows.length, 0);
      await assert.rejects(db.exec("update profiles set role='admin'"), /permission denied/);
      await assert.rejects(db.exec("update guide_profiles set status='approved'"), /permission denied/);
      await assert.rejects(db.exec("delete from profiles"), /permission denied/);
      await assert.rejects(db.exec("delete from audit_logs"), /permission denied/);
      await assert.rejects(db.query("select review_guide_profile($1, 'approved', 'self')", [guide]), /not_authorized/);
    });
  });
  await t.test("traveler cannot become guide through the profile RPC", async () => {
    await asUser(tourist, async () => {
      assert.equal((await db.query("select * from guide_profiles")).rows.length, 0);
      await assert.rejects(db.exec("select save_guide_profile('Name','City','Bio',true)"), /not_authorized/);
    });
  });
  await t.test("invalid submissions are rejected; submission locks profile edits", async () => {
    await db.query("update auth.users set email_confirmed_at=null where id=$1", [guide]);
    await asUser(guide, async () => {
      await assert.rejects(db.exec("select save_guide_profile('Guide','Riyadh','Bio',true)"), /not_authorized/);
    });
    await db.query("update auth.users set email_confirmed_at=now() where id=$1", [guide]);
    await asUser(guide, async () => {
      await assert.rejects(db.exec("select save_guide_profile('', 'City','Bio',true)"), /invalid_profile/);
      await db.exec("select save_guide_profile('Guide','Riyadh','A guide profile',false)");
      await db.exec("select save_guide_profile('Guide','Riyadh','A guide profile',true)");
      await assert.rejects(db.exec("select save_guide_profile('Change','City','Bio',false)"), /profile_locked/);
    });
  });
  await t.test("admin review requires a reason and valid state, and is audited exactly once", async () => {
    await asUser(admin, async () => {
      await assert.rejects(db.query("select review_guide_profile($1,'approved','')", [guide]), /reason_required/);
      await assert.rejects(db.query("select review_guide_profile($1,'approved','Attempt')", [other]), /invalid_transition/);
      await db.query("select review_guide_profile($1,'rejected','Clarify the biography')", [guide]);
      await assert.rejects(db.query("select review_guide_profile($1,'rejected','Repeated')", [guide]), /invalid_transition/);
      const logs = await db.query<{ actor_id: string; new_status: string }>("select actor_id, new_status from audit_logs");
      assert.deepEqual(logs.rows, [{ actor_id: admin, new_status: "rejected" }]);
      await assert.rejects(db.exec("update profiles set role='admin'"), /permission denied/);
    });
  });
  await t.test("rejected guide can revise and resubmit; approval stays private", async () => {
    await asUser(guide, () => db.exec("select save_guide_profile('Guide','Riyadh','Revised biography',true)"));
    await asUser(admin, () => db.query("select review_guide_profile($1,'approved','Development review')", [guide]));
    await asUser(tourist, async () => assert.equal((await db.query("select * from guide_profiles")).rows.length, 0));
    await asUser(guide, async () => {
      await assert.rejects(db.exec("select save_guide_profile('Changed','City','Bio',true)"), /profile_locked/);
    });
  });
  await t.test("suspension and reinstatement are separate audited admin decisions", async () => {
    await asUser(admin, async () => {
      await db.query("select review_guide_profile($1,'suspended','Review required')", [guide]);
      await db.query("select review_guide_profile($1,'approved','Review complete')", [guide]);
      assert.equal((await db.query("select * from audit_logs")).rows.length, 4);
    });
  });
  await t.test("suspended accounts cannot edit, and suspended admins lose privileges immediately", async () => {
    await db.query("update profiles set account_status='suspended' where id in ($1,$2)", [other, admin]);
    await asUser(other, async () => {
      await assert.rejects(db.exec("select save_guide_profile('Name','City','Bio',true)"), /not_authorized/);
      assert.equal((await db.query("select * from guide_profiles")).rows.length, 0);
    });
    await asUser(admin, async () => {
      await assert.rejects(db.query("select review_guide_profile($1,'suspended','Attempt')", [guide]), /not_authorized/);
      assert.equal((await db.query("select * from audit_logs")).rows.length, 0);
    });
  });
  await t.test("accidental table grants do not permit self-escalation or other-user reads", async () => {
    await db.exec("grant update, insert, delete on profiles, guide_profiles to authenticated");
    await asUser(guide, async () => {
      assert.equal((await db.query("update profiles set role='admin' returning id")).rows.length, 0);
      assert.equal((await db.query("delete from guide_profiles returning user_id")).rows.length, 0);
      assert.equal((await db.query("select * from guide_profiles where user_id=$1", [other])).rows.length, 0);
    });
  });
});
