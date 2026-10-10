import type { Locale } from "@/lib/i18n";
import { ShieldCheck } from "lucide-react";

export function FooterTrust({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border)] mt-4">
      {/* Saudi Ministry License Badge */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-medium text-[var(--color-text)]">
          {isAr ? "منصة معتمدة ومطابقة لمعايير وزارة السياحة" : "Licensed & Compliant with Ministry of Tourism"}
        </span>
      </div>

      {/* Payment Methods */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--muted)] mb-2">
          {isAr ? "وسائل دفع إلكترونية آمنة 100%" : "100% Secure Payment Methods"}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mada */}
          <div className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--background-alt)] text-[10px] font-extrabold tracking-wider text-[var(--color-text)] shadow-2xs">
            mada
          </div>
          {/* Visa */}
          <div className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--background-alt)] text-[10px] font-extrabold tracking-wider text-[var(--color-text)] shadow-2xs">
            VISA
          </div>
          {/* Mastercard */}
          <div className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--background-alt)] text-[10px] font-extrabold tracking-wider text-[var(--color-text)] shadow-2xs">
            mastercard
          </div>
          {/* Apple Pay */}
          <div className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--background-alt)] text-[10px] font-extrabold tracking-wider text-[var(--color-text)] shadow-2xs">
             Pay
          </div>
        </div>
      </div>
    </div>
  );
}
