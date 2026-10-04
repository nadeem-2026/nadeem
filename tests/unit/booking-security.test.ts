import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../helpers/database";

test("booking API enforces authorization, reservations, secrecy and fail-closed payments", async t => {
  const db = await createDatabase();
  t.after(() => db.close());
  const tourist = "20000000-0000-4000-8000-000000000001";
  const guide = "20000000-0000-4000-8000-000000000002";
  const other = "20000000-0000-4000-8000-000000000003";
  for (const [id, role] of [[tourist,"tourist"],[guide,"guide"],[other,"guide"]]) {
    await db.query<Record<string, unknown>>("insert into auth.users(id,raw_user_meta_data) values($1,$2)",[id,{account_type:role,display_name:"Fixture"}]);
  }
  await db.query<Record<string, unknown>>("update guide_profiles set status='approved',city='Riyadh',hourly_rate=100,max_participants=4 where user_id=$1",[guide]);
  await db.query<Record<string, unknown>>("insert into guide_availability_weekly(guide_id,day_of_week,start_time,end_time) select $1,d,'00:00','23:59' from generate_series(0,6) d",[guide]);
  async function asUser<T>(id: string, fn: () => Promise<T>) {
    await db.query<Record<string, unknown>>("select set_config('request.jwt.claim.sub',$1,false)",[id]);
    await db.exec("set role authenticated");
    try { return await fn(); } finally { await db.exec("reset role"); }
  }
  const request = async (time="2030-01-10T10:00:00+03:00", participants=2, target=guide) => {
    const result = await db.query<{ id: string }>("select request_booking($1,$2,2,$3,'Meeting point') as id",[target,time,participants]);
    return result.rows[0].id;
  };
  let first: string; let overlap: string;
  await t.test("anonymous discovery returns only curated approved active guides",async () => {
    await db.exec("set role anon");
    try {
      const rows = (await db.query<Record<string, unknown>>("select * from list_public_guides()")).rows;
      assert.equal(rows.length,1); assert.equal(rows[0].id,guide);
      assert.equal("review_reason" in rows[0],false);
      await assert.rejects(db.exec("select * from profiles"),/permission denied/);
      await assert.rejects(request(),/permission denied/);
      await assert.rejects(db.exec("select handle_payment_webhook('fake','captured',null)"),/permission denied/);
    } finally { await db.exec("reset role"); }
  });
  await t.test("request validates role, approval, lead time, capacity and exceptions",async () => {
    await asUser(guide,()=>assert.rejects(request(),/not_authorized/));
    await asUser(tourist,async()=>{
      await assert.rejects(request(new Date().toISOString()),/minimum_notice/);
      await assert.rejects(request(undefined,5),/capacity_exceeded/);
      await assert.rejects(request(undefined,2,other),/guide_unavailable/);
    });
    await db.query<Record<string, unknown>>("insert into guide_availability_exceptions(guide_id,exception_date,is_available) values($1,'2030-01-11',false)",[guide]);
    await asUser(tourist,()=>assert.rejects(request("2030-01-11T10:00:00+03:00"),/outside_availability/));
    first=await asUser(tourist,()=>request()); overlap=await asUser(tourist,()=>request());
    const row=(await db.query<Record<string, unknown>>("select total_price,policy_snapshot from bookings where id=$1",[first])).rows[0];
    assert.equal(Number(row.total_price),200);
    await db.query<Record<string, unknown>>("update guide_profiles set hourly_rate=150 where user_id=$1",[guide]);
    assert.equal(Number((await db.query<Record<string, unknown>>("select total_price from bookings where id=$1",[first])).rows[0].total_price),200);
  });
  await t.test("users cannot bypass transition, price, payment or notification checks",async()=>{
    await asUser(tourist,async()=>{
      await assert.rejects(db.query<Record<string, unknown>>("update bookings set status='confirmed',total_price=0 where id=$1",[first]),/permission denied/);
      await assert.rejects(db.query<Record<string, unknown>>("select change_booking_status($1,'confirmed')",[first]),/invalid_transition/);
      await assert.rejects(db.exec("select handle_payment_webhook('fake','captured',null)"),/permission denied/);
      await assert.rejects(db.query<Record<string, unknown>>("insert into notifications(user_id,title,body) values($1,'fake','fake')",[guide]),/permission denied/);
    });
  });
  await t.test("only one overlapping request is accepted, including 30 minute buffer",async()=>{
    await asUser(guide,()=>db.query<Record<string, unknown>>("select change_booking_status($1,'awaiting_payment')",[first]));
    await asUser(guide,()=>assert.rejects(db.query<Record<string, unknown>>("select change_booking_status($1,'awaiting_payment')",[overlap]),/booking_conflict/));
    const near = await asUser(tourist,()=>request("2030-01-10T12:15:00+03:00"));
    await asUser(guide,()=>assert.rejects(db.query<Record<string, unknown>>("select change_booking_status($1,'awaiting_payment')",[near]),/booking_conflict/));
    const after = await asUser(tourist,()=>request("2030-01-10T12:30:00+03:00"));
    await asUser(guide,()=>db.query<Record<string, unknown>>("select change_booking_status($1,'awaiting_payment')",[after]));
    await db.query<Record<string, unknown>>("update bookings set payment_expires_at=now()-interval '1 minute' where id=$1",[first]);
    await asUser(guide,()=>db.query<Record<string, unknown>>("select change_booking_status($1,'awaiting_payment')",[overlap]));
  });
  await t.test("tour code is tourist-only, attempt limited and consumed once",async()=>{
    // Owner-only fixture; no payment processing is enabled by this test.
    await db.query<Record<string, unknown>>("update bookings set status='confirmed' where id=$1",[first]);
    await db.query<Record<string, unknown>>("insert into private.booking_start_secrets(booking_id,code,expires_at) values($1,'123456','2030-01-10T12:00:00+03:00')",[first]);
    await asUser(guide,async()=>{
      assert.equal((await db.query<Record<string, unknown>>("select tour_otp from bookings where id=$1",[first])).rows[0].tour_otp,null);
      assert.equal((await db.query<Record<string, unknown>>("select get_tour_start_code($1) as code",[first])).rows[0].code,null);
      await assert.rejects(db.exec("select * from private.booking_start_secrets"),/permission denied/);
      assert.equal((await db.query<Record<string, unknown>>("select start_tour($1,'bad') as ok",[first])).rows[0].ok,false);
      assert.equal((await db.query<Record<string, unknown>>("select start_tour($1,'123456') as ok",[first])).rows[0].ok,true);
      assert.equal((await db.query<Record<string, unknown>>("select start_tour($1,'123456') as ok",[first])).rows[0].ok,false);
      assert.equal((await db.query<Record<string, unknown>>("select end_tour($1) as ok",[first])).rows[0].ok,true);
    });
    await asUser(tourist,async()=>assert.equal((await db.query<Record<string, unknown>>("select get_tour_start_code($1) as code",[first])).rows[0].code,null));
    await db.query<Record<string, unknown>>("update bookings set status='confirmed' where id=$1",[first]);
    await db.query<Record<string, unknown>>("update private.booking_start_secrets set consumed_at=null,attempts=0 where booking_id=$1",[first]);
    await asUser(tourist,async()=>assert.equal((await db.query<Record<string, unknown>>("select get_tour_start_code($1) as code",[first])).rows[0].code,"123456"));
    await asUser(guide,async()=>{
      for(let i=0;i<5;i++) await db.query<Record<string, unknown>>("select start_tour($1,'bad')",[first]);
      assert.equal((await db.query<Record<string, unknown>>("select start_tour($1,'123456') as ok",[first])).rows[0].ok,false);
    });
  });
  await t.test("private guide edit implementation is executable only after identity validation",async()=>{
    await asUser(other,()=>db.exec("select save_guide_profile('Guide','Riyadh','Bio',array['Arabic'],array['Riyadh'],100,4,array['Tour'],true)"));
    assert.equal((await db.query<Record<string, unknown>>("select status from guide_profiles where user_id=$1",[other])).rows[0].status,"pending_review");
  });
});
