"use server";

import { authClient } from "@/lib/auth/server";

const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || "sk_test_mock";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function createPaymentCharge(bookingId: string, locale: string) {
  const client = await authClient();
  if (!client) return { success: false, message: "Not authenticated" };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };

  // Fetch booking details
  const { data: booking, error: fetchError } = await client
    .from("bookings")
    .select("*, tourist:profiles!tourist_id(display_name)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) return { success: false, message: "Booking not found" };
  if (booking.tourist_id !== user.id) return { success: false, message: "Unauthorized" };
  if (booking.status !== "awaiting_payment") return { success: false, message: "Booking is not awaiting payment" };

  // Create charge request to Tap Payments
  const response = await fetch("https://api.tap.company/v2/charges", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TAP_SECRET_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      amount: booking.total_price,
      currency: "SAR",
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: `Booking for tour guide. Booking ID: ${bookingId}`,
      metadata: {
        booking_id: bookingId,
        tourist_id: user.id
      },
      reference: {
        transaction: bookingId,
        order: bookingId
      },
      receipt: {
        email: true,
        sms: true
      },
      customer: {
        first_name: booking.tourist?.display_name || "Tourist",
        email: user.email,
        phone: {
          country_code: "966",
          number: "500000000" // We don't have phone in our schema yet, using placeholder
        }
      },
      source: {
        id: "src_all"
      },
      post: {
        url: `${SITE_URL}/api/webhooks/tap`
      },
      redirect: {
        url: `${SITE_URL}/${locale}/payment/callback`
      }
    })
  });

  const chargeData = await response.json();

  if (!response.ok || chargeData.errors) {
    console.error("Tap Charge Error:", chargeData);
    return { success: false, message: "Failed to initiate payment with Tap" };
  }

  // Insert payment record
  const { error: insertError } = await client.from("payments").insert({
    booking_id: bookingId,
    tourist_id: user.id,
    charge_id: chargeData.id,
    amount: booking.total_price,
    currency: "SAR",
    status: "initiated"
  });

  if (insertError) {
    console.error("Payment insert error:", insertError);
    return { success: false, message: "Failed to save payment record" };
  }

  // Return the redirect URL provided by Tap
  if (chargeData.transaction && chargeData.transaction.url) {
    return { success: true, redirectUrl: chargeData.transaction.url };
  }

  return { success: false, message: "Invalid response from Tap Payments" };
}
