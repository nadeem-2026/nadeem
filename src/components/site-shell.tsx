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

export function SiteHeader({ locale, theme = "light" }: { locale: Locale; theme?: Theme }) {
  const m = getMessages(locale);
  return <>
    <a href="#main-content" className="skip-link">{m.skip}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link href={`/${locale}`} aria-label={m.name} className="brand-link"><Brand name={m.name} /></Link>
        <nav className="desktop-nav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
          <Link href={`/${locale}`}>{m.nav.home}</Link>
          <Link href={`/${locale}/guides`}>{locale === "ar" ? "المرشدون السياحيون" : "Tour Guides"}</Link>
          <Link href={`/${locale}/become-a-guide`}>{locale === "ar" ? "انضم كمرشد" : "Become a Guide"}</Link>
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
          <li><Link href={`/${locale}/guides`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "المرشدون السياحيون" : "Tour Guides"}</Link></li>
          <li><Link href={`/${locale}/become-a-guide`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "انضم كمرشد سياحي" : "Become a Guide"}</Link></li>
          <li><Link href={`/${locale}/account`}><ArrowIcon size={14} className="footer-arrow" /> {authMessages(locale).account}</Link></li>
        </ul>
      </div>

      <div className="footer-column">
        <h2>{ar ? "معلومات تهمك" : "Useful information"}</h2>
        <ul>
          <li><Link href={`/${locale}/contact`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.contact}</Link></li>
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
        
        <div className="footer-map-container" style={{ marginTop: "32px", borderRadius: "12px", overflow: "hidden", height: "180px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: "1px solid var(--border)" }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115934.33120610313!2d46.738586!3d24.774265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: "grayscale(20%)" }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Nadeem Location Map"
          ></iframe>
        </div>
      </div>
    </div>
    <div className="container footer-bottom">
      <p>© 2026 {m.name}. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      <div className="footer-bottom-links">
        <Link href={`/${locale}/contact`}>{m.footerLinks.contact}</Link>
        <Link href={`/${locale}/terms`}>{m.footerLinks.terms}</Link>
        <Link href={`/${locale}/privacy`}>{m.footerLinks.privacy}</Link>
      </div>
    </div>
  </footer>;
}
