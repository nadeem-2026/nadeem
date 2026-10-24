"use client";

import { useState, useTransition } from "react";
import { simulatePayment } from "@/lib/payments/actions";
import { demoMessages, type DemoOutcome } from "@/lib/payments/demo";
import { 
  CreditCard, ShieldCheck, Lock, CheckCircle2, AlertTriangle, 
  XCircle, RotateCcw, Loader2, Sparkles, ChevronDown, ChevronUp,
  Smartphone
} from "lucide-react";

interface DemoPaymentProps {
  bookingId: string;
  locale: string;
  refund?: boolean;
}

export function DemoPayment({ bookingId, locale, refund = false }: DemoPaymentProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [selectedMethod, setSelectedMethod] = useState<"mada" | "apple" | "card">("mada");
  const [showSimOptions, setShowSimOptions] = useState(false);
  const [confirmingRefund, setConfirmingRefund] = useState(false);

  const isAr = locale === "ar";
  const m = demoMessages[isAr ? "ar" : "en"];

  const handleSimulate = (outcome: DemoOutcome) => {
    startTransition(async () => {
      try {
        const res = await simulatePayment(bookingId, outcome, locale);
        setMessage(res.message);
        if (outcome === "success" || outcome === "refunded") {
          setMessageType("success");
        } else if (outcome === "failed") {
          setMessageType("error");
        } else {
          setMessageType("info");
        }
      } catch {
        setMessage(m.error);
        setMessageType("error");
      }
    });
  };

  // If component is in refund mode
  if (refund) {
    return (
      <section 
        aria-label={m.title}
        className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-2 m-0">
              <RotateCcw size={16} />
              <span>{isAr ? "إدارة استرداد الرسوم والضمان" : "Refund & Escrow Release"}</span>
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 m-0 mt-1 max-w-lg leading-relaxed">
              {isAr 
                ? "في حال رغبتك بإلغاء الحجز المؤكد، يمكنك طلب استرداد المبلغ بالكامل إلى وسيلة الدفع الأصلية وإلغاء رمز البدء." 
                : "If you wish to cancel this confirmed booking, you can request a full refund to your original payment method."}
            </p>
          </div>

          {!confirmingRefund ? (
            <button
              type="button"
              onClick={() => setConfirmingRefund(true)}
              disabled={pending}
              className="button text-xs py-2 px-3.5"
              style={{ borderColor: "rgba(217, 119, 6, 0.4)", color: "#b45309", fontWeight: 600 }}
            >
              <RotateCcw size={14} />
              <span>{m.refunded}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmingRefund(false)}
                disabled={pending}
                className="button text-xs py-1.5 px-3"
              >
                {isAr ? "تراجع" : "Keep Booking"}
              </button>
              <button
                type="button"
                onClick={() => handleSimulate("refunded")}
                disabled={pending}
                className="button text-xs py-1.5 px-3.5"
                style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626", fontWeight: 600 }}
              >
                {pending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{isAr ? "جارٍ الاسترداد..." : "Processing..."}</span>
                  </>
                ) : (
                  <span>{isAr ? "تأكيد الإلغاء والاسترداد" : "Confirm Refund"}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-black/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </section>
    );
  }

  return (
    <section 
      aria-label={m.title} 
      className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] shadow-xs transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base m-0 text-[var(--foreground)]">
              {isAr ? "بوابة الدفع وتأكيد الضمان المالي" : "Payment & Escrow Authorization"}
            </h3>
            <span className="text-xs text-[var(--muted)]">
              {m.notice}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
          <ShieldCheck size={14} />
          <span>{isAr ? "ضمان مالي 100%" : "100% Escrow Secured"}</span>
        </div>
      </div>

      {/* Payment Methods Selector */}
      <div className="mb-4">
        <span className="block text-xs font-semibold text-[var(--muted)] mb-2">
          {isAr ? "اختر وسيلة الدفع:" : "Select Payment Method:"}
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Mada */}
          <button
            type="button"
            onClick={() => setSelectedMethod("mada")}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold ${
              selectedMethod === "mada"
                ? "bg-[var(--color-surface)] border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 text-[var(--foreground)]"
                : "bg-[var(--color-surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-primary)]/50"
            }`}
          >
            <span className="text-base font-extrabold text-emerald-600">mada</span>
            <span className="text-[11px]">{isAr ? "مدى البنكية" : "Mada Debit"}</span>
          </button>

          {/* Apple Pay */}
          <button
            type="button"
            onClick={() => setSelectedMethod("apple")}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold ${
              selectedMethod === "apple"
                ? "bg-[var(--color-surface)] border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 text-[var(--foreground)]"
                : "bg-[var(--color-surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-primary)]/50"
            }`}
          >
            <Smartphone size={18} className="text-black dark:text-white" />
            <span className="text-[11px]">Apple Pay</span>
          </button>

          {/* Visa / Master */}
          <button
            type="button"
            onClick={() => setSelectedMethod("card")}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold ${
              selectedMethod === "card"
                ? "bg-[var(--color-surface)] border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 text-[var(--foreground)]"
                : "bg-[var(--color-surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-primary)]/50"
            }`}
          >
            <CreditCard size={18} className="text-blue-600" />
            <span className="text-[11px]">Visa / Master</span>
          </button>
        </div>
      </div>

      {/* Credit Card Visual Mockup */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-tr from-emerald-950 via-[var(--color-primary)] to-emerald-900 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs tracking-wider opacity-80 uppercase font-mono">
            {selectedMethod === "mada" ? "MADA / SAUDI PAYMENTS" : selectedMethod === "apple" ? "APPLE PAY DIRECT" : "VISA / MASTERCARD"}
          </span>
          <Lock size={15} className="opacity-70" />
        </div>
        <div className="font-mono text-lg tracking-[3px] font-bold mb-3 drop-shadow-xs">
          •••• •••• •••• 4242
        </div>
        <div className="flex justify-between items-end text-xs">
          <div>
            <span className="block text-[9px] opacity-70 uppercase tracking-wider">{isAr ? "اسم صاحب البطاقة" : "Cardholder"}</span>
            <span className="font-semibold uppercase tracking-wide">NADEEM GUEST</span>
          </div>
          <div>
            <span className="block text-[9px] opacity-70 uppercase tracking-wider">{isAr ? "الانتهاء" : "Expires"}</span>
            <span className="font-mono font-semibold">12/28</span>
          </div>
        </div>
      </div>

      {/* Escrow Guarantee Highlight */}
      <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] mb-4 text-xs">
        <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-1">
          <ShieldCheck size={16} />
          <span>{isAr ? "كيف يحميك نظام الضمان المالي في نديم؟" : "How Nadeem Escrow Protects You:"}</span>
        </div>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed m-0">
          {isAr
            ? "يتم حجز قيمة الجولة في حساب وسيط آمن، ولن يتم تسليم المبلغ للمرشد إلا بعد مقابلتك وتأكيد انطلاق الجولة برمز التحقق (OTP). وفي حال عدم الحضور يمكنك استرداد المبلغ فوراً."
            : "Funds are held securely in escrow and only released to the guide after meeting and launching the tour with your OTP. If unfulfilled, refunds are guaranteed."}
        </p>
      </div>

      {/* Primary Action Button: Pay & Confirm */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => handleSimulate("success")}
          disabled={pending}
          className="button button-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{isAr ? "جارٍ معالجة وتأكيد الدفع..." : "Processing & Securing Escrow..."}</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>{m.success}</span>
            </>
          )}
        </button>

        {/* Collapsible Simulation Testing Options */}
        <div className="border-t border-[var(--border)] pt-2 mt-1">
          <button
            type="button"
            onClick={() => setShowSimOptions(!showSimOptions)}
            className="w-full flex items-center justify-between text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] py-1 transition cursor-pointer"
          >
            <span>{isAr ? "خيارات محاكاة وسيناريوهات الفحص (Demo Testing)" : "Testing & Simulation Scenarios"}</span>
            {showSimOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSimOptions && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSimulate("failed")}
                disabled={pending}
                className="button text-xs py-1.5 px-3 flex-1"
                style={{ borderColor: "rgba(220, 38, 38, 0.3)", color: "#dc2626" }}
              >
                <AlertTriangle size={13} />
                <span>{m.failed}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulate("cancelled")}
                disabled={pending}
                className="button text-xs py-1.5 px-3 flex-1"
              >
                <XCircle size={13} />
                <span>{m.cancelled}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback status notification */}
      {message && (
        <div 
          role="status" 
          aria-live="polite"
          className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            messageType === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : messageType === "error"
              ? "bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
              : "bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300"
          }`}
        >
          {messageType === "success" && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
          {messageType === "error" && <AlertTriangle size={16} className="text-red-600 shrink-0" />}
          {messageType === "info" && <ShieldCheck size={16} className="text-blue-600 shrink-0" />}
          <span>{message}</span>
        </div>
      )}
    </section>
  );
}

