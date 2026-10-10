"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Sun, Moon } from "lucide-react";

export type Theme = "light" | "dark";

export function ThemeSwitch({ locale, initialTheme = "light" }: { locale: Locale; initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme === "dark" ? "dark" : "light");
  const ar = locale === "ar";

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `nadeem-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax${typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : ""}`;
    setTheme(next);
  };

  const label = theme === "dark"
    ? (ar ? "التبديل إلى الوضع الفاتح" : "Switch to light mode")
    : (ar ? "التبديل إلى الوضع الداكن" : "Switch to dark mode");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-switch"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-amber-400 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
      ) : (
        <Moon size={20} className="text-[var(--color-primary)] transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
      )}
    </button>
  );
}
