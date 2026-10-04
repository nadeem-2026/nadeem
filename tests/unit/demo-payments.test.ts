import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../helpers/database";

test("academic payments enforce ownership, deadlines, isolation, retries and refunds", async t => {
 const db=await createDatabase(); t.after(()=>db.close());
 const tourist="31000000-0000-4000-8000-000000000001", guide="31000000-0000-4000-8000-000000000002", other="31000000-0000-4000-8000-000000000003";
 for(const [id,role] of [[tourist,"tourist"],[guide,"guide"],[other,"tourist"]]) await db.query("insert into auth.users(id,raw_user_meta_data) values($1,$2)",[id,{account_type:role,display_name:"Demo fixture"}]);
 await db.query("update guide_profiles set status='approved',hourly_rate=100,max_participants=4 where user_id=$1",[guide]);
 await db.query("insert into guide_availability_weekly(guide_id,day_of_week,start_time,end_time) select $1,d,'00:00','23:59' from generate_series(0,6)d",[guide]);
 async function asUser<T>(id:string, fn:()=>Promise<T>) {
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]); await db.exec("set role authenticated");
  try { return await fn(); } finally { await db.exec("reset role"); }
 }
 const booking=(await asUser(tourist,()=>db.query<{id:string}>("select request_booking($1,'2030-05-10T10:00:00+03:00',2,1,'Museum') id",[guide]))).rows[0].id;
 const pay=(outcome:string)=>db.query<{result:string}>("select simulate_payment($1,$2) result",[booking,outcome]);
 await asUser(tourist,()=>assert.rejects(pay("success"),/invalid_transition/));
 await asUser(guide,()=>db.query("select change_booking_status($1,'awaiting_payment')",[booking]));
 await asUser(guide,()=>assert.rejects(pay("success"),/not_authorized/));
 await asUser(other,()=>assert.rejects(pay("success"),/not_authorized/));
 await db.exec("set role anon"); try { await assert.rejects(pay("success"),/permission denied/); } finally { await db.exec("reset role"); }
 await asUser(tourist,()=>assert.rejects(pay("CAPTURED"),/invalid_outcome/));
 await db.query("update bookings set is_demo=false where id=$1",[booking]);
 await asUser(tourist,()=>assert.rejects(pay("success"),/not_demo_booking/));
 await db.query("update bookings set is_demo=true,payment_expires_at=now()-interval '1 minute' where id=$1",[booking]);
 await asUser(tourist,()=>assert.rejects(pay("success"),/payment_expired/));
 await db.query("update bookings set payment_expires_at=now()+interval '30 minutes' where id=$1",[booking]);
 await asUser(tourist,async()=>{
  await pay("failed"); await pay("cancelled");
  assert.equal((await db.query<{status:string}>("select status from bookings where id=$1",[booking])).rows[0].status,"awaiting_payment");
  await assert.rejects(db.exec("update demo_payments set amount=0"),/permission denied/);
  await pay("success");
  const code=(await db.query<{code:string}>("select get_tour_start_code($1) code",[booking])).rows[0].code;
  assert.match(code,/^\d{6}$/); await pay("success");
  assert.equal((await db.query<{code:string}>("select get_tour_start_code($1) code",[booking])).rows[0].code,code);
  await assert.rejects(pay("failed"),/invalid_transition/);
 });
 const row=(await db.query<{amount:string;platform_fee:string;guide_amount:string;attempts:number}>("select * from demo_payments")).rows[0];
 assert.equal(Number(row.amount),200); assert.equal(Number(row.platform_fee),20); assert.equal(Number(row.guide_amount),180); assert.equal(row.attempts,3);
 assert.equal((await db.query("select * from payments")).rows.length,0);
 assert.equal((await db.query("select * from guide_earnings")).rows.length,0);
 await asUser(other,async()=>assert.equal((await db.query("select * from demo_payments")).rows.length,0));
 await asUser(guide,async()=>assert.equal((await db.query("select * from demo_payments")).rows.length,1));
 await asUser(tourist,async()=>{
  await pay("refunded"); await pay("refunded");
  assert.equal((await db.query<{status:string}>("select status from bookings where id=$1",[booking])).rows[0].status,"cancelled");
  assert.equal((await db.query<{code:string|null}>("select get_tour_start_code($1) code",[booking])).rows[0].code,null);
  await assert.rejects(pay("success"),/invalid_transition/);
 });
 // A second demo can complete the actual protected tour lifecycle.
 const next=(await asUser(tourist,()=>db.query<{id:string}>("select request_booking($1,'2030-05-11T10:00:00+03:00',2,1,'Museum') id",[guide]))).rows[0].id;
 await asUser(guide,()=>db.query("select change_booking_status($1,'awaiting_payment')",[next]));
 await asUser(tourist,()=>db.query("select simulate_payment($1,'success')",[next]));
 const code=(await asUser(tourist,()=>db.query<{code:string}>("select get_tour_start_code($1) code",[next]))).rows[0].code;
 await asUser(guide,async()=>{
  assert.equal((await db.query<{ok:boolean}>("select start_tour($1,$2) ok",[next,code])).rows[0].ok,true);
 });
 await asUser(tourist,()=>assert.rejects(db.query("select simulate_payment($1,'refunded')",[next]),/invalid_transition/));
 await asUser(guide,async()=>{
  assert.equal((await db.query<{ok:boolean}>("select end_tour($1) ok",[next])).rows[0].ok,true);
 });
 assert.equal((await db.query("select * from guide_earnings")).rows.length,0);

});
