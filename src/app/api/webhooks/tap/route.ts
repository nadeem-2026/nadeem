import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/auth/admin';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In production, we should verify Tap Signature (webhook headers)
    // For now, we proceed to read the event data
    const chargeId = body.id;
    const status = body.status;
    const receiptUrl = body.receipt?.url || null;

    if (!chargeId || !status) {
      return NextResponse.json({ error: 'Missing charge ID or status' }, { status: 400 });
    }

    // Map Tap status to our schema
    let ourStatus = 'initiated';
    if (status === 'CAPTURED') ourStatus = 'captured';
    else if (status === 'FAILED') ourStatus = 'failed';
    else if (status === 'DECLINED') ourStatus = 'declined';
    else if (status === 'AUTHORIZED') ourStatus = 'captured'; // Sometimes authorized counts as success for 3DS

    const adminClient = getSupabaseAdmin();
    
    // Call the security definer function to update everything safely
    const { error } = await adminClient.rpc('handle_payment_webhook', {
      p_charge_id: chargeId,
      p_status: ourStatus,
      p_receipt_url: receiptUrl
    });

    if (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (ourStatus === 'captured') {
      try {
        // Fetch booking info to notify
        const { data: paymentData } = await adminClient.from("payments").select("booking_id").eq("charge_id", chargeId).single();
        if (paymentData) {
          const { data: booking } = await adminClient.from("bookings").select("tourist_id, guide_id, id").eq("id", paymentData.booking_id).single();
          if (booking) {
            const { data: profiles } = await adminClient.from("profiles").select("id, email").in("id", [booking.tourist_id, booking.guide_id]);
            const touristEmail = profiles?.find(p => p.id === booking.tourist_id)?.email;
            const guideEmail = profiles?.find(p => p.id === booking.guide_id)?.email;

            // Notify Tourist
            await sendNotification({
              userId: booking.tourist_id,
              title: "Payment Successful 💵",
              body: "Your payment was successful and the tour is confirmed! You can now chat with your guide.",
              link: `/en/bookings/${booking.id}`,
              email: touristEmail
            });

            // Notify Guide
            await sendNotification({
              userId: booking.guide_id,
              title: "Booking Confirmed! 🚀",
              body: "The tourist has completed the payment. The tour is now confirmed.",
              link: `/en/bookings/${booking.id}`,
              email: guideEmail
            });
          }
        }
      } catch (notifErr) {
        console.error("Failed to send webhook notifications", notifErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
