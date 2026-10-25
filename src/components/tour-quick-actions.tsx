"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { 
  MapPin, ExternalLink, Printer, Copy, Check, Share2 
} from "lucide-react";

interface TourQuickActionsProps {
  meetingPoint: string;
  tourCode?: string | null;
  locale: Locale;
}

export function TourQuickActions({ meetingPoint, tourCode, locale }: TourQuickActionsProps) {
  const isAr = locale === "ar";
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanLocationQuery = meetingPoint.split("|")[0].trim();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanLocationQuery)}`;

  const handleCopyCode = () => {
    if (!tourCode) return;
    navigator.clipboard.writeText(tourCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isAr ? "تفاصيل رحلتي مع نديم" : "My Nadeem Tour Details",
          text: `${isAr ? "نقطة اللقاء:" : "Meeting Point:"} ${cleanLocationQuery}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {/* Google Maps Link */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--background-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--color-primary)] transition no-underline"
      >
        <MapPin size={14} className="text-emerald-700" />
        <span>{isAr ? "فتح في خرائط Google" : "Open in Google Maps"}</span>
        <ExternalLink size={12} className="opacity-70" />
      </a>

      {/* Copy Code (Tourist only) */}
      {tourCode && (
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--background-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] transition cursor-pointer"
        >
          {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          <span>{copiedCode ? (isAr ? "تم نسخ الرمز" : "Code Copied") : (isAr ? "نسخ رمز البدء" : "Copy OTP")}</span>
        </button>
      )}

      {/* Print Voucher */}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--background-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] transition cursor-pointer"
      >
        <Printer size={14} />
        <span>{isAr ? "طباعة الإيصال" : "Print Voucher"}</span>
      </button>

      {/* Share Details */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--background-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] transition cursor-pointer"
      >
        {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
        <span>{copiedLink ? (isAr ? "تم نسخ الرابط" : "Link Copied") : (isAr ? "مشاركة الرحلة" : "Share")}</span>
      </button>
    </div>
  );
}
