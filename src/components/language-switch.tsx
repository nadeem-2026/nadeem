"use client";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/content/messages";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  const suffix = /^\/(ar|en)(\/|$)/.test(pathname) ? pathname.replace(/^\/(ar|en)/, "") : "";
  const m = getMessages(locale);
  // Full navigation updates the root layout's language, including account pages.
  return <a className="language-switch" href={`/${other}${suffix}`} hrefLang={other} lang={other} aria-label={m.languageLabel}><span aria-hidden="true">◎</span> {m.otherLanguage}</a>;
}
