import { ThemeSwitch, type Theme } from "./theme-switch";
import { SocialChannels } from "./social-channels";
import Link from "next/link";
import { Brand } from "./brand";
import { getMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { authMessages } from "@/content/auth";
import { NotificationsBell } from "./notifications-bell";
import { MobileNav } from "./mobile-nav";
import { Mail, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react";

export function SiteHeader({ locale, theme = "system" }: { locale: Locale; theme?: Theme }) {
  const m = getMessages(locale);
  return <>
    <a href="#main-content" className="skip-link">{m.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} aria-label={m.name} className="brand-link"><Brand name={m.name} /></Link>
        <nav className="desktop-nav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
          <Link href={`/${locale}`}>{m.nav.home}</Link>
          <a href={`/${locale}#about`}>{m.nav.about}</a>
          <a href={`/${locale}#services`}>{m.nav.services}</a>
          <a href={`/${locale}#contact`}>{m.nav.contact}</a>
          <Link href={`/${locale}/account`}>{authMessages(locale).account}</Link>
        </nav>
        <div className="header-controls">
          <NotificationsBell locale={locale} />
          <ThemeSwitch locale={locale} initialTheme={theme} />
          <LanguageSwitch locale={locale} />
          <MobileNav locale={locale} messages={m.nav} accountText={authMessages(locale).account} />
        </div>
      </div>
    </header>
  </>;
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const ar = locale === "ar";
  const ArrowIcon = ar ? ArrowLeft : ArrowRight;

  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <Brand name={m.name} />
        <p className="footer-tagline">
          {ar 
            ? "السعودية أجمل برفقة أهلها. اكتشف الوجهات والحكايات المحلية مع نديم، حيث تلتقي الأصالة بالحداثة." 
            : "Saudi Arabia, through local eyes. Discover places, people and stories with Nadeem."}
        </p>
        <div className="footer-contact-info">
          <div className="contact-item">
            <Phone size={18} />
            <span dir="ltr">+966 50 123 4567</span>
          </div>
          <div className="contact-item">
            <Mail size={18} />
            <span>hello@nadeem-sa.com</span>
          </div>
          <div className="contact-item">
            <MapPin size={18} />
            <span>{ar ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span>
          </div>
        </div>
      </div>
      
      <div className="footer-column">
        <h2>{ar ? "استكشف نديم" : "Explore Nadeem"}</h2>
        <ul>
          <li><Link href={`/${locale}`}><ArrowIcon size={14} className="footer-arrow" /> {m.nav.home}</Link></li>
          <li><Link href={`/${locale}#about`}><ArrowIcon size={14} className="footer-arrow" /> {m.nav.about}</Link></li>
          <li><Link href={`/${locale}#services`}><ArrowIcon size={14} className="footer-arrow" /> {m.nav.services}</Link></li>
          <li><Link href={`/${locale}/account`}><ArrowIcon size={14} className="footer-arrow" /> {authMessages(locale).account}</Link></li>
        </ul>
      </div>

      <div className="footer-column">
        <h2>{ar ? "معلومات تهمك" : "Useful information"}</h2>
        <ul>
          <li><Link href={`/${locale}/terms`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.terms}</Link></li>
          <li><Link href={`/${locale}/privacy`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.privacy}</Link></li>
          <li><Link href={`/${locale}/photo-credits`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "مصادر الصور" : "Photo credits"}</Link></li>
        </ul>
      </div>

      <div className="footer-column">
        <h2>{ar ? "تواصل معنا" : "Connect with us"}</h2>
        <p className="footer-social-text">
          {ar ? "تابعنا على منصات التواصل الاجتماعي لمعرفة أحدث الجولات السياحية والوجهات المميزة." : "Follow us on social media for the latest tours and special destinations."}
        </p>
        <SocialChannels />
      </div>
    </div>
    <div className="container footer-bottom">
      <p>© 2026 {m.name}. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      <div className="footer-bottom-links">
        <Link href={`/${locale}/terms`}>{m.footerLinks.terms}</Link>
        <Link href={`/${locale}/privacy`}>{m.footerLinks.privacy}</Link>
      </div>
    </div>
  </footer>;
}
