"use client";

import { ArrowUp } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function BackToTop({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={isAr ? "العودة إلى أعلى الصفحة" : "Back to top of page"}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background-alt)] text-[var(--muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] text-xs font-medium transition cursor-pointer"
    >
      <ArrowUp size={14} />
      <span>{isAr ? "للأعلى" : "Top"}</span>
    </button>
  );
}
