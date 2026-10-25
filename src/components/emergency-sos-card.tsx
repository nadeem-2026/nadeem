"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Phone, ShieldAlert, ChevronDown, ChevronUp, LifeBuoy, HeartPulse, ShieldCheck, Siren } from "lucide-react";

interface EmergencySosCardProps {
  locale: Locale;
  touristEmergencyName?: string;
  touristEmergencyPhone?: string;
}

export function EmergencySosCard({ 
  locale, 
  touristEmergencyName, 
  touristEmergencyPhone 
}: EmergencySosCardProps) {
  const isAr = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);

  const emergencyServices = [
    { number: "997", name: isAr ? "الإسعاف (الهلال الأحمر)" : "Ambulance", icon: <HeartPulse size={22} className="text-rose-600 mb-1" /> },
    { number: "999", name: isAr ? "الشرطة" : "Police", icon: <ShieldAlert size={22} className="text-blue-600 mb-1" /> },
    { number: "996", name: isAr ? "أمن الطرق" : "Highway Patrol", icon: <ShieldCheck size={22} className="text-emerald-700 mb-1" /> },
    { number: "930", name: isAr ? "رعاية السياح (وزارة السياحة)" : "Tourism Care (Ministry)", icon: <Phone size={22} className="text-amber-600 mb-1" /> },
  ];

  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between text-start text-xs font-bold text-red-900 dark:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-950/40 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          <span>{isAr ? "أرقام الطوارئ والمساعدة السريعة (SOS)" : "Emergency & Safety Assistance (SOS)"}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-red-700 dark:text-red-400 font-normal">
          <span>{isOpen ? (isAr ? "إخفاء" : "Hide") : (isAr ? "عرض الأرقام" : "Show Numbers")}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-red-100 dark:border-red-900/30 text-xs">
          <p className="text-[11px] text-[var(--muted)] mb-3 leading-relaxed">
            {isAr 
              ? "في حالات الطوارئ الطبية أو الأمنية أثناء الجولة، يمكنك الاتصال فوراً بالجهات الحكومية المعنية:"
              : "In medical or security emergencies during the tour, contact emergency authorities directly:"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {emergencyServices.map((service) => (
              <a
                key={service.number}
                href={`tel:${service.number}`}
                className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] hover:border-red-400 flex flex-col items-center justify-center text-center transition group shadow-2xs no-underline"
              >
                <div className="flex items-center justify-center">{service.icon}</div>
                <span className="text-[11px] font-semibold text-[var(--foreground)] line-clamp-1">{service.name}</span>
                <strong className="text-sm font-mono text-red-600 dark:text-red-400 mt-0.5 group-hover:scale-105 transition-transform">{service.number}</strong>
              </a>
            ))}
          </div>

          {touristEmergencyPhone && (
            <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs">
                <HeartPulse size={16} className="text-rose-600" />
                <span className="text-[var(--muted)]">{isAr ? "جهة اتصال طوارئ السائح:" : "Tourist Emergency Contact:"}</span>
                <strong>{touristEmergencyName ? `${touristEmergencyName}` : ""}</strong>
              </div>
              <a
                href={`tel:${touristEmergencyPhone}`}
                dir="ltr"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition no-underline"
              >
                <Phone size={12} />
                <span>{touristEmergencyPhone}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
