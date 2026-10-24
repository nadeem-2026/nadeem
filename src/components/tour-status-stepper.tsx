"use client";

import type { Locale } from "@/lib/i18n";
import { Check, Clock, CreditCard, ShieldCheck, Flag, XCircle } from "lucide-react";

interface TourStatusStepperProps {
  status: string;
  locale: Locale;
}

export function TourStatusStepper({ status, locale }: TourStatusStepperProps) {
  const isAr = locale === "ar";

  if (["cancelled", "declined", "expired"].includes(status)) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-800 dark:text-red-300">
        <XCircle size={24} className="shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <strong className="block text-sm">
            {status === "cancelled" && (isAr ? "تم إلغاء هذا الحجز" : "This booking has been cancelled")}
            {status === "declined" && (isAr ? "اعتذر المرشد عن قبول الحجز لعدم التوفر" : "The guide declined this booking due to availability")}
            {status === "expired" && (isAr ? "انتهت مهلة استجابة الطلب" : "This request has expired")}
          </strong>
          <span className="text-xs text-red-700 dark:text-red-400">
            {isAr 
              ? "إذا كان لديك أي استفسار أو تم خصم مبالغ بالخطأ، يمكنك التواصل مع الدعم الفني." 
              : "If you have any questions or were charged in error, please contact support."}
          </span>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: "pending",
      title: isAr ? "تقديم الطلب" : "Request Sent",
      desc: isAr ? "بانتظار موافقة المرشد" : "Awaiting guide approval",
      icon: Clock,
      stepNum: 1,
    },
    {
      id: "awaiting_payment",
      title: isAr ? "سداد الرسوم" : "Payment",
      desc: isAr ? "تأكيد الدفع والضمان" : "Securing booking",
      icon: CreditCard,
      stepNum: 2,
    },
    {
      id: "confirmed",
      title: isAr ? "مؤكدة وجاهزة" : "Confirmed",
      desc: isAr ? "جاهزون للالتقاء" : "Ready to meet",
      icon: ShieldCheck,
      stepNum: 3,
    },
    {
      id: "in_progress",
      title: isAr ? "الجولة جارية" : "In Progress",
      desc: isAr ? "الرحلة الميدانية نشطة" : "Active field tour",
      icon: Flag,
      stepNum: 4,
    },
    {
      id: "completed",
      title: isAr ? "مكتملة" : "Completed",
      desc: isAr ? "التقييم والتوثيق" : "Review & feedback",
      icon: Check,
      stepNum: 5,
    },
  ];

  const getStepState = (stepIndex: number) => {
    const order = ["pending", "awaiting_payment", "confirmed", "in_progress", "completed"];
    const currentIndex = order.indexOf(status);
    if (currentIndex === -1) return "upcoming";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] shadow-xs">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((s, idx) => {
          const state = getStepState(idx);
          const Icon = s.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s.id} className="flex items-center flex-1 min-w-[110px] last:flex-initial">
              <div className="flex flex-col items-center text-center w-full">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-2 ${
                    state === "completed"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : state === "active"
                      ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/20 animate-pulse"
                      : "bg-[var(--color-surface)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  {state === "completed" ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
                </div>

                <span className={`text-xs font-semibold block leading-tight ${
                  state === "active" ? "text-[var(--color-primary)] font-bold" : state === "completed" ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                }`}>
                  {s.title}
                </span>

                <span className="text-[10px] text-[var(--muted)] hidden sm:block mt-0.5">
                  {s.desc}
                </span>
              </div>

              {!isLast && (
                <div 
                  className={`h-0.5 w-full mx-2 hidden md:block rounded-full transition-colors ${
                    state === "completed" ? "bg-emerald-600" : "bg-[var(--border)]"
                  }`} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
