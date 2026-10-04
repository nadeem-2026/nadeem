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
