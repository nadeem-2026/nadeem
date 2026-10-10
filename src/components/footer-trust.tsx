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

      {/* Payment Gateway Icons */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--muted)] mb-2.5">
          {isAr ? "وسائل الدفع المعتمدة" : "Accepted Payment Methods"}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mada Logo */}
          <div 
            className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-[var(--border)] shadow-2xs hover:border-[var(--color-primary)] transition"
            title="Mada (مدى)"
          >
            <svg className="h-3.5 w-auto" viewBox="0 0 24 16" fill="none">
              <path d="M2 13.5C6.5 13.5 9 8 13 8C17 8 19.5 13.5 24 13.5" stroke="#00A389" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M2 5.5C6.5 5.5 9 10 13 10C17 10 19.5 5.5 24 5.5" stroke="#005B94" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[11px] font-black text-[#005B94] dark:text-teal-400 tracking-tight leading-none">مدى</span>
          </div>

          {/* Apple Pay Logo */}
          <div 
            className="h-7 px-2.5 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border border-[var(--border)] shadow-2xs hover:border-[var(--color-primary)] transition"
            title="Apple Pay"
          >
            <svg className="h-4 w-auto text-black dark:text-white" viewBox="0 0 34 16" fill="currentColor">
              <path d="M5.5 4.3C5.9 3.8 6.2 3.1 6.1 2.4C5.5 2.4 4.7 2.8 4.3 3.3C3.9 3.7 3.6 4.5 3.7 5.2C4.4 5.2 5.1 4.8 5.5 4.3ZM6.1 5.3C5.1 5.3 4.4 5.9 3.9 5.9C3.4 5.9 2.8 5.4 2.1 5.4C1 5.4 0 6.3 0 8C0 9.7 1.5 12.2 2.5 12.2C3 12.2 3.3 11.9 3.9 11.9C4.5 11.9 4.8 12.2 5.4 12.2C6.4 12.2 7.2 10.6 7.6 9.8C6.4 9.3 6.3 7.6 7.5 7.1C7.1 6.3 6.6 5.3 6.1 5.3Z"/>
              <path d="M12.2 4.2H9.5V12.2H10.9V9.5H12.2C14.1 9.5 15.3 8.3 15.3 6.8C15.3 5.4 14.1 4.2 12.2 4.2ZM12.1 8.2H10.9V5.5H12.1C13.2 5.5 13.9 6.1 13.9 6.8C13.9 7.6 13.2 8.2 12.1 8.2ZM18.7 6.5C17.6 6.5 16.6 7.3 16.6 8.5C16.6 10.4 18.7 10.4 18.7 10.4C19.3 10.4 19.9 10.2 20.3 9.8V10.3H21.6V6.6H20.3V7.2C19.9 6.7 19.3 6.5 18.7 6.5ZM19.2 9.2C18.4 9.2 17.9 8.7 17.9 8.5C17.9 8.2 18.4 7.6 19.2 7.6C20 7.6 20.4 8.2 20.4 8.5C20.4 8.7 19.9 9.2 19.2 9.2ZM24.4 12.7C25.5 12.7 26.1 12.2 26.5 11.3L29.3 4.4H27.8L25.9 9.8L24 4.4H22.5L24.5 9.7L23.7 11.6C23.4 12.2 23 12.4 22.5 12.4H22.1V12.7H24.4Z"/>
            </svg>
          </div>

          {/* Visa Logo */}
          <div 
            className="h-7 px-2.5 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border border-[var(--border)] shadow-2xs hover:border-[var(--color-primary)] transition"
            title="Visa"
          >
            <svg className="h-3.5 w-auto" viewBox="0 0 36 12" fill="none">
              <path d="M14.65 0.5L11.75 11.5H9.35L11.55 3.2L9.2 11.5H6.95L3.8 2.6C3.6 2 3.35 1.7 2.8 1.4C1.95 0.95 0.65 0.6 0 0.5L0.05 0.5H5.45C6.15 0.5 6.75 0.95 6.9 1.7L8.25 8.7L11.25 0.5H14.65ZM27.65 7.8C27.65 4.8 23.55 4.65 23.55 3.35C23.55 2.95 23.95 2.5 24.85 2.4C25.3 2.35 26.55 2.3 27.95 2.95L28.5 0.75C27.75 0.45 26.8 0.25 25.6 0.25C22.65 0.25 20.6 1.8 20.6 4C20.6 5.65 22.1 6.55 23.25 7.1C24.4 7.65 24.8 8.05 24.8 8.55C24.8 9.35 23.85 9.7 22.95 9.7C21.75 9.7 20.5 9.25 19.8 8.85L19.2 11.1C20.05 11.5 21.6 11.8 22.8 11.8C26 11.8 27.65 10.2 27.65 7.8ZM35.75 11.5H33.05C32.35 11.5 31.8 11.1 31.55 10.5L27 1.8L29.9 0.5L32.6 8.3L34.1 0.5H36.9L35.75 11.5ZM19.2 0.5L16.4 11.5H14L16.8 0.5H19.2Z" fill="#1434CB" className="dark:fill-blue-400"/>
            </svg>
          </div>

          {/* Mastercard Logo */}
          <div 
            className="h-7 px-2.5 rounded-lg flex items-center justify-center bg-white dark:bg-zinc-900 border border-[var(--border)] shadow-2xs hover:border-[var(--color-primary)] transition"
            title="Mastercard"
          >
            <svg className="h-4.5 w-auto" viewBox="0 0 32 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#EB001B"/>
              <circle cx="22" cy="10" r="8" fill="#F79E1B"/>
              <path d="M16 4.36A7.98 7.98 0 0 1 19.2 10 7.98 7.98 0 0 1 16 15.64 7.98 7.98 0 0 1 12.8 10 7.98 7.98 0 0 1 16 4.36Z" fill="#FF5F00"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
