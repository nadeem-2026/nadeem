"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Clock, PlayCircle, Hourglass, CheckCircle2 } from "lucide-react";

interface LiveTourTimerProps {
  startTime: string;
  durationHours: number;
  locale: Locale;
}

export function LiveTourTimer({ startTime, durationHours, locale }: LiveTourTimerProps) {
  const isAr = locale === "ar";
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  const startMs = new Date(startTime).getTime();
  const totalMs = durationHours * 3600 * 1000;
  const elapsedMs = Math.max(0, now - startMs);
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const percent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  const elapsedHours = Math.floor(elapsedMs / (3600 * 1000));
  const elapsedMins = Math.floor((elapsedMs % (3600 * 1000)) / (60 * 1000));

  const remainingHours = Math.floor(remainingMs / (3600 * 1000));
  const remainingMins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));

  const isOvertime = elapsedMs > totalMs;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[var(--color-primary)]/10 to-amber-500/10 border border-emerald-500/30 shadow-xs mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
            <PlayCircle size={16} className="text-emerald-600" />
            <span>{isAr ? "الجولة نشطة ميدانياً الآن" : "Live Field Tour in Progress"}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[var(--muted)]">
            {isAr ? "المقدار المنقضي:" : "Elapsed:"}
            <strong className="text-[var(--foreground)] font-mono mx-1">
              {elapsedHours > 0 ? `${elapsedHours}h ` : ""}{elapsedMins}m
            </strong>
          </span>
          <span className="text-[var(--border)]">•</span>
          <span className={isOvertime ? "text-amber-600 font-bold" : "text-[var(--color-primary)] font-bold"}>
            {isOvertime 
              ? (isAr ? "اكتمل وقت الجولة المحدد" : "Planned duration reached") 
              : `${isAr ? "المتبقي:" : "Remaining:"} ${remainingHours > 0 ? `${remainingHours}h ` : ""}${remainingMins}m`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-[11px] text-[var(--muted)]">
        <span>{isAr ? "وقت البدء المجدول" : "Start Time"}</span>
        <span>{percent}% {isAr ? "من إجمالي مدة الجولة" : "of tour completed"}</span>
        <span>{durationHours} {isAr ? "ساعات" : "hours"}</span>
      </div>
    </div>
  );
}
