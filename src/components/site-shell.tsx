import Link from "next/link";
import { Brand } from "./brand";
import { getMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { authMessages } from "@/content/auth";
import { NotificationsBell } from "./notifications-bell";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return <>
    <a href="#main-content" className="skip-link">{m.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} aria-label={m.name} className="brand-link"><Brand name={m.name} /></Link>
        <nav aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
          <Link href={`/${locale}/guides`}>{m.nav.guides}</Link>
          <a href={`/${locale}#about`}>{m.nav.about}</a>
          <a href={`/${locale}#how-it-works`}>{m.nav.how}</a>
          <a href={`/${locale}#platform-status`}>{m.nav.status}</a>
          <Link href={`/${locale}/account`}>{authMessages(locale).account}</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsBell locale={locale} />
          <LanguageSwitch locale={locale} />
        </div>
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
    <div>
      <Brand name={m.name} reverse />
      <p style={{ marginTop: "12px", marginBottom: "16px" }}>{m.footer}</p>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", opacity: 0.9 }}>
        <Link href={`/${locale}/terms`} style={{ textDecoration: "underline" }}>{m.footerLinks.terms}</Link>
        <Link href={`/${locale}/privacy`} style={{ textDecoration: "underline" }}>{m.footerLinks.privacy}</Link>
        <a href="mailto:support@nadeem.local" style={{ textDecoration: "underline" }}>{m.footerLinks.contact}</a>
      </div>
    </div>
    <p className="footer-note">{m.footerNote}</p>
  </div></footer>;
}
