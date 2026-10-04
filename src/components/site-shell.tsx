import { ThemeSwitch, type Theme } from "./theme-switch";
import { SocialChannels } from "./social-channels";
import Link from "next/link";
import { Brand } from "./brand";
import { getMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { authMessages } from "@/content/auth";
import { NotificationsBell } from "./notifications-bell";

export function SiteHeader({ locale, theme = "system" }: { locale: Locale; theme?: Theme }) {
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
        <div className="header-controls">
          <NotificationsBell locale={locale} />
          <ThemeSwitch locale={locale} initialTheme={theme} />
          <LanguageSwitch locale={locale} />
        </div>
      </div>
    </header>
  </>;
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const ar = locale === "ar";
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <Brand name={m.name} reverse />
        <p>{ar ? "السعودية أجمل برفقة أهلها. اكتشف الوجهات والحكايات المحلية مع نديم." : "Saudi Arabia, through local eyes. Discover places, people and stories with Nadeem."}</p>
      </div>
      <div className="footer-column">
        <h2>{ar ? "استكشف نديم" : "Explore Nadeem"}</h2>
        <ul>
          <li><Link href={`/${locale}/guides`}>{m.nav.guides}</Link></li>
          <li><Link href={`/${locale}#about`}>{m.nav.about}</Link></li>
          <li><Link href={`/${locale}#how-it-works`}>{m.nav.how}</Link></li>
          <li><Link href={`/${locale}/account`}>{authMessages(locale).account}</Link></li>
        </ul>
      </div>
      <div className="footer-column">
        <h2>{ar ? "معلومات تهمك" : "Useful information"}</h2>
        <ul>
          <li><Link href={`/${locale}/terms`}>{m.footerLinks.terms}</Link></li>
          <li><Link href={`/${locale}/privacy`}>{m.footerLinks.privacy}</Link></li>
          <li><Link href={`/${locale}/photo-credits`}>{ar ? "مصادر الصور" : "Photo credits"}</Link></li>
          <li><Link href={`/${locale}#platform-status`}>{m.nav.status}</Link></li>
        </ul>
      </div>
      <div className="footer-column">
        <h2>{ar ? "تواصل معنا" : "Connect with us"}</h2>
        <SocialChannels />
      </div>
    </div>
    <div className="container footer-bottom">
      <p>© 2026 {m.name}</p>
    </div>
  </footer>;
}
