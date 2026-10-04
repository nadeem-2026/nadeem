export const demoOutcomes = ["success", "failed", "cancelled", "refunded"] as const;
export type DemoOutcome = typeof demoOutcomes[number];
export const demoMessages = {
  ar: {
    notice: "مشروع جامعي — الحجوزات الجديدة تجريبية ولا تتم أي معاملات مالية حقيقية.",
    title: "محاكاة الدفع", success: "محاكاة نجاح الدفع", failed: "محاكاة فشل الدفع",
    cancelled: "محاكاة إلغاء الدفع", refunded: "محاكاة استرداد كامل قبل موعد الجولة وإلغاء الحجز",
    results: { success: "نجحت المحاكاة وتم تأكيد الحجز التجريبي. لم يُخصم أي مبلغ.", failed: "فشل الدفع التجريبي. يمكنك إعادة المحاولة قبل انتهاء المهلة.", cancelled: "أُلغي الدفع التجريبي. ما زال الحجز بانتظار الدفع ويمكنك إعادة المحاولة.", refunded: "تمت محاكاة استرداد كامل قبل موعد الجولة وإلغاء الحجز. لم تُحوّل أي أموال." },
    error: "تعذرت المحاكاة. تحقق من حالة الحجز وصلاحياتك ومهلة الدفع.",
    summary: "سجل تجريبي — مبالغ افتراضية بالريال السعودي", amount: "الإجمالي", fee: "عمولة المنصة", guide: "حصة المرشد", refundedNote: "تم الاسترداد التجريبي؛ لا توجد مستحقات قابلة للصرف.",
  },
  en: {
    notice: "College project — new bookings are simulations. No real financial transactions take place.",
    title: "Payment simulation", success: "Simulate successful payment", failed: "Simulate failed payment",
    cancelled: "Simulate cancelled payment", refunded: "Simulate full refund before tour time and cancel booking",
    results: { success: "Simulation succeeded and the demo booking is confirmed. No money was charged.", failed: "Simulated payment failed. Retry before the payment deadline.", cancelled: "Simulated payment cancelled. The booking still awaits payment; you can retry.", refunded: "Full refund and booking cancellation simulated. No money was transferred." },
    error: "Simulation unavailable. Check booking status, permissions and payment deadline.",
    summary: "Demo record — fictional amounts in SAR", amount: "Total", fee: "Platform commission", guide: "Guide share", refundedNote: "Simulated refund completed; no payable earnings exist.",
  },
};
