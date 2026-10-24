"use client";

import type { BookingMessages } from "@/lib/bookings/types";
import { useState } from "react";
import { startTour, endTour } from "@/lib/bookings/actions";
import type { Locale } from "@/lib/i18n";
import { KeyRound, ShieldCheck, Flag, AlertTriangle, Loader2 } from "lucide-react";

export function StartTourForm({ bookingId, m, locale }: { bookingId: string, m: BookingMessages, locale: Locale }) {
  const isAr = locale === "ar";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await startTour(bookingId, otp.trim(), locale);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] mb-6">
      <div className="flex items-center gap-2.5 mb-2 text-[var(--color-primary)]">
        <KeyRound size={20} />
        <h3 className="font-bold text-base m-0">
          {isAr ? "التحقق من رمز بدء الجولة (OTP)" : "Verify Tour Start Code (OTP)"}
        </h3>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
        {isAr 
          ? "اطلب الرمز المكون من 6 خانات من السائح للتحقق من وصوله لنقطة الالتقاء والبدء الرسمي للجولة." 
          : "Request the 6-character code from the tourist upon meeting to verify arrival and officially launch the tour."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => {
              setError("");
              setOtp(e.target.value.toUpperCase().slice(0, 6));
            }} 
            placeholder="XXXXXX" 
            required 
            maxLength={6}
            className="w-full p-3 text-center tracking-[8px] font-mono font-bold text-xl rounded-xl border border-[var(--border)] bg-[var(--color-surface)] uppercase focus:border-[var(--color-primary)] transition"
          />
        </div>

        <button 
          type="submit" 
          className="button button-primary" 
          disabled={loading || otp.trim().length < 6}
          style={{ padding: "14px 24px", justifyContent: "center" }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{isAr ? "جارٍ التحقق..." : "Verifying..."}</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>{m.operations?.startTour || (isAr ? "بدء الجولة رسمياً" : "Start Tour")}</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function EndTourForm({ bookingId, m, locale }: { bookingId: string, m: BookingMessages, locale: Locale }) {
  const isAr = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleEnd = async () => {
    setLoading(true);
    await endTour(bookingId, locale);
    setLoading(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-base m-0 flex items-center gap-2 text-rose-700 dark:text-rose-400">
            <Flag size={18} />
            <span>{isAr ? "إنهاء الجولة السياحية" : "Complete & Conclude Tour"}</span>
          </h3>
          <p className="text-xs text-[var(--muted)] m-0 mt-1">
            {isAr 
              ? "اضغط عند انتهاء برنامج الجولة وتوديع السائح لإغلاق الجولة وإتاحة التقييم." 
              : "Click once the itinerary is concluded to close the tour and prompt review."}
          </p>
        </div>

        {!confirming ? (
          <button 
            type="button" 
            onClick={() => setConfirming(true)}
            className="button"
            style={{ borderColor: "rgba(225, 29, 72, 0.4)", color: "#e11d48", fontWeight: 600 }}
          >
            <span>{m.operations?.endTour || (isAr ? "إنهاء الجولة" : "End Tour")}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="button text-xs py-2 px-3"
              disabled={loading}
            >
              {isAr ? "تراجع" : "Cancel"}
            </button>
            <button 
              type="button" 
              onClick={handleEnd}
              disabled={loading}
              className="button text-xs py-2 px-4"
              style={{ background: "#e11d48", color: "#fff", borderColor: "#e11d48" }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isAr ? "جارٍ الإنهاء..." : "Concluding..."}</span>
                </>
              ) : (
                <span>{isAr ? "نعم، تأكيد إنهاء الجولة" : "Yes, Confirm End"}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
