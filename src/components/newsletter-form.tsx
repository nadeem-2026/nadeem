"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs sm:text-sm font-medium">
          {isAr 
            ? "شكراً لاشتراكك! ستصلك أحدث التجارب والوجهات قريباً." 
            : "Thanks for subscribing! You'll receive our latest tours soon."}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
      <div className="relative flex-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isAr ? "أدخل بريدك الإلكتروني..." : "Enter your email..."}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition shadow-inner placeholder:text-[var(--muted)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="button button-primary text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl justify-center shrink-0 shadow-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <Send size={15} />
            <span>{isAr ? "اشترك الآن" : "Subscribe"}</span>
          </>
        )}
      </button>
    </form>
  );
}
