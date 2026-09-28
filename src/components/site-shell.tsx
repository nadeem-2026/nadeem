import Link from "next/link";
import { Brand } from "./brand";
import { getMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { authMessages } from "@/content/auth";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return <>
    <a href="#main-content" className="skip-link">{m.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} aria-label={m.name} className="brand-link"><Brand name={m.name} /></Link>
        <nav aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
          <a href={`/${locale}#about`}>{m.nav.about}</a>
          <a href={`/${locale}#how-it-works`}>{m.nav.how}</a>
          <a href={`/${locale}#platform-status`}>{m.nav.status}</a>
          <Link href={`/${locale}/account`}>{authMessages(locale).account}</Link>
        </nav>
        <LanguageSwitch locale={locale} />
      </div>
    </header>
    <aside className="foundation-notice" aria-label={m.notice}><div className="container notice-inner">
      <span className="notice-label">{m.notice}</span><span>{m.noticeDetail}</span>
    </div></aside>
  </>;
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return <footer className="site-footer"><div className="container footer-inner">
    <div><Brand name={m.name} reverse /><p>{m.footer}</p></div>
    <p className="footer-note">{m.footerNote}</p>
  </div></footer>;
}
