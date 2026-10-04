"use server";

// Payment activation requires a separately verified provider integration.
// Do not create external charges while refunds and reconciliation are unavailable.
export async function createPaymentCharge(_bookingId: string, locale: string) {
  return {
    success: false as const,
    message: locale === "ar"
      ? "الدفع غير متاح حاليًا. لن يتم خصم أي مبلغ."
      : "Payments are not available yet. No charge has been created.",
    redirectUrl: undefined,
  };
}

export async function simulatePayment(bookingId: string, outcome: string, locale: string) {
  const { authClient } = await import("@/lib/auth/server");
  const { revalidatePath } = await import("next/cache");
  const { demoOutcomes, demoMessages } = await import("./demo");
  const m = demoMessages[locale === "ar" ? "ar" : "en"];
  if (!demoOutcomes.some(value => value === outcome) || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
    return { success: false, message: m.error };
  }
  const client = await authClient();
  if (!client) return { success: false, message: m.error };
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { success: false, message: m.error };
  const { error } = await client.rpc("simulate_payment", { p_booking_id: bookingId, p_outcome: outcome });
  if (error) return { success: false, message: m.error };
  revalidatePath("/[locale]/account", "page");
  revalidatePath("/[locale]/bookings/[id]", "page");
  return { success: true, message: m.results[outcome as keyof typeof m.results] };
}
