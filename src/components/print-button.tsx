"use client";

import { Printer } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface PrintButtonProps {
  locale: Locale;
  label?: string;
  className?: string;
}

export function PrintButton({ locale, label, className }: PrintButtonProps) {
  const isAr = locale === "ar";
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className || "button button-outline text-xs inline-flex items-center gap-1.5 print:hidden cursor-pointer"}
    >
      <Printer size={14} />
      <span>{label || (isAr ? "طباعة الإشعار" : "Print Notice")}</span>
    </button>
  );
}
