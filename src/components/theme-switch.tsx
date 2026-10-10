"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Sun, Moon, Monitor } from "lucide-react";

export type Theme = "system" | "light" | "dark";

export function ThemeSwitch({ locale, initialTheme }: { locale: Locale; initialTheme: Theme }) {
  const [theme, setTheme] = useState(initialTheme);
  const ar = locale === "ar";

  const renderIcon = () => {
    if (theme === "dark") return <Moon className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
    if (theme === "light") return <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />;
    return <Monitor className="w-4 h-4 text-muted" aria-hidden="true" />;
  };

  return (
    <label className="theme-switch" title={ar ? "تغيير مظهر الموقع" : "Toggle theme"}>
      {renderIcon()}
      <span className="sr-only">{ar ? "مظهر الموقع" : "Appearance"}</span>
      <select 
        value={theme} 
        onChange={event => {
          const next = event.target.value as Theme;
          document.documentElement.dataset.theme = next;
          document.cookie = `nadeem-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
          setTheme(next);
        }}
      >
        <option value="system">{ar ? "الجهاز" : "System"}</option>
        <option value="light">{ar ? "فاتح" : "Light"}</option>
        <option value="dark">{ar ? "داكن" : "Dark"}</option>
      </select>
    </label>
  );
}
