export const demoOutcomes = ["success", "failed", "cancelled", "refunded"] as const;
export type DemoOutcome = typeof demoOutcomes[number];
export const demoMessages = {
  ar: {
    notice: "جميع المعاملات تتم عبر اتصال مشفر وآمن.",
    title: "بوابة الدفع", success: "الدفع ببطاقة مدى / فيزا", failed: "فشل في الدفع",
    cancelled: "إلغاء عملية الدفع", refunded: "طلب استرداد المبلغ وإلغاء الحجز",
    results: { success: "تمت عملية الدفع بنجاح وتأكيد الحجز.", failed: "فشلت عملية الدفع. يرجى التأكد من رصيد البطاقة وإعادة المحاولة.", cancelled: "تم إلغاء عملية الدفع. يمكنك المحاولة مجدداً قبل انتهاء المهلة.", refunded: "تم استرداد المبلغ وإلغاء الحجز بنجاح." },
    error: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة لاحقاً.",
    summary: "سجل العمليات — المبالغ بالريال السعودي", amount: "الإجمالي", fee: "رسوم المنصة", guide: "مستحقات المرشد", refundedNote: "تم استرداد المبلغ بنجاح.",
  },
  en: {
    notice: "All transactions are processed via a secure, encrypted connection.",
    title: "Payment Gateway", success: "Pay with Visa / Mastercard", failed: "Simulate failed payment",
    cancelled: "Cancel payment", refunded: "Request refund and cancel booking",
    results: { success: "Payment successful and booking confirmed.", failed: "Payment failed. Please check your card and retry.", cancelled: "Payment was cancelled. You can retry before the deadline.", refunded: "Refund processed and booking cancelled successfully." },
    error: "An error occurred while processing the payment. Please try again later.",
    summary: "Transaction record — Amounts in SAR", amount: "Total", fee: "Platform fee", guide: "Guide earnings", refundedNote: "Refund processed successfully.",
  },
};
