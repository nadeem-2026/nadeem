"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { DollarSign, Clock, Sparkles } from "lucide-react";
import Link from "next/link";


export function GuideEarningsCalculator({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [rate, setRate] = useState(200);
  const [hoursPerWeek, setHoursPerWeek] = useState(12);

  // Platform commission: 15%
  const grossMonthly = rate * hoursPerWeek * 4;
  const netMonthly = Math.round(grossMonthly * 0.85);

  return (
    <div className="p-8 md:p-10 rounded-3xl bg-[var(--color-surface)] border border-[var(--border)] shadow-xl max-w-3xl mx-auto my-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-3">
          <Sparkles size={14} />
          {isAr ? "حاسبة الأرباح التقديرية" : "Interactive Earnings Calculator"}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] m-0">
          {isAr ? "كم يمكنك أن تكسب كمرشد سياحي في نديم؟" : "How much can you earn with Nadeem?"}
        </h3>
        <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto">
          {isAr 
            ? "حرك المؤشرات لتوقع دخلك الشهري بناءً على تسعيرتك المفضلة وساعات تفرغك."
            : "Adjust the sliders to estimate your potential monthly income."}
        </p>
      </div>

      <div className="space-y-8">
        {/* Rate Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="flex items-center gap-2">
              <DollarSign size={16} className="text-[var(--color-primary)]" />
              {isAr ? "سعر الساعة المفضل لديك:" : "Your Hourly Rate:"}
            </span>
            <span className="text-xl text-[var(--color-primary)] font-bold">
              {rate} <span className="text-xs font-normal text-[var(--muted)]">SAR / hr</span>
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="600"
            step="25"
            value={rate}
            onChange={(e) => setRate(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg bg-[var(--background-alt)] accent-[var(--color-primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[var(--muted)]">
            <span>100 SAR</span>
            <span>350 SAR (المتوسط)</span>
            <span>600 SAR</span>
          </div>
        </div>

        {/* Hours per week Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--color-primary)]" />
              {isAr ? "ساعات الإرشاد أسبوعياً:" : "Tour Hours Per Week:"}
            </span>
            <span className="text-xl text-[var(--color-primary)] font-bold">
              {hoursPerWeek} <span className="text-xs font-normal text-[var(--muted)]">{isAr ? "ساعة / أسبوع" : "hrs / week"}</span>
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="40"
            step="2"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg bg-[var(--background-alt)] accent-[var(--color-primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[var(--muted)]">
            <span>4 ساعات (عطلة نهاية الأسبوع)</span>
            <span>20 ساعة</span>
            <span>40 ساعة (تفرغ كامل)</span>
          </div>
        </div>

        {/* Results Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e3526] to-[#124a43] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <span className="text-xs text-[var(--nadeem-sand)] font-semibold block mb-1">
              {isAr ? "الدخل الشهري الصافي المتوقع:" : "Estimated Monthly Net Payout:"}
            </span>
            <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {netMonthly.toLocaleString()} <span className="text-sm font-normal text-[var(--nadeem-sand)]">SAR / {isAr ? "شهرياً" : "month"}</span>
            </div>
            <span className="text-[11px] text-white/70 block mt-1">
              {isAr ? "* بعد خصم رسوم المنصة والتشغيل (15%). الدخل الفعلي يعتمد على الحجوزات والتقييمات." : "* Net of 15% service fee. Actual income depends on bookings."}
            </span>
          </div>

          <Link
            href={`/${locale}/signup?role=guide`}
            className="py-3 px-6 rounded-xl bg-[var(--nadeem-sand)] hover:bg-[#c9b88b] text-[#0e3526] font-bold text-sm shadow-md transition whitespace-nowrap"
          >
            {isAr ? "ابدأ التسجيل الآن" : "Sign Up to Earn"}
          </Link>
        </div>
      </div>
    </div>
  );
}
