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
import { NewsletterForm } from "./newsletter-form";
import { BackToTop } from "./back-to-top";
import { FooterTrust } from "./footer-trust";
import { Mail, Phone, MapPin, ArrowRight, ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

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
          <Link href={`/${locale}/contact`}>{m.nav.contact}</Link>
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

  const topDestinations = [
    { ar: "الرياض ونبض العاصمة", en: "Riyadh & Capital", slug: "riyadh" },
    { ar: "العلا وسحر التاريخ", en: "AlUla & Heritage", slug: "alula" },
    { ar: "جدة التاريخية والبلد", en: "Historic Jeddah", slug: "jeddah" },
    { ar: "عسير وسحر الجنوب", en: "Asir & Abha", slug: "asir" },
    { ar: "شواطئ البحر الأحمر", en: "Red Sea Coast", slug: "redsea" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        
        {/* Top Newsletter Dispatch Banner */}
        <div className="footer-newsletter">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-1">
                {ar ? "كن أول من يكتشف سحر المملكة" : "Be First to Discover Saudi's Wonders"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-lg leading-relaxed mb-0">
                {ar 
                  ? "اشترك في نشرة نديم لتصلك أحدث الجولات المحلية والتجارب الثقافية والعروض الحصرية مباشرة." 
                  : "Subscribe to Nadeem's travel dispatch for the latest local tours, cultural stories, and exclusive offers."}
              </p>
            </div>
          </div>
          <NewsletterForm locale={locale} />
        </div>

        {/* 5-Column Grid */}
        <div className="footer-grid">
          
          {/* Column 1: Brand & Trust */}
          <div className="footer-brand">
            <Brand name={m.name} />
            <p className="footer-tagline">
              {ar 
                ? "السعودية أجمل برفقة أهلها. اكتشف الوجهات والحكايات المحلية مع نديم، حيث تلتقي الأصالة بالحداثة." 
                : "Saudi Arabia, through local eyes. Discover places, people and stories with Nadeem."}
            </p>
            <FooterTrust locale={locale} />
          </div>
          
          {/* Column 2: Explore */}
          <div className="footer-column">
            <h2>{ar ? "استكشف نديم" : "Explore Nadeem"}</h2>
            <ul>
              <li><Link href={`/${locale}`}><ArrowIcon size={14} className="footer-arrow" /> {m.nav.home}</Link></li>
              <li><Link href={`/${locale}/guides`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "المرشدون السياحيون" : "Tour Guides"}</Link></li>
              <li><Link href={`/${locale}/become-a-guide`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "انضم كمرشد سياحي" : "Become a Guide"}</Link></li>
              <li><Link href={`/${locale}/account`}><ArrowIcon size={14} className="footer-arrow" /> {authMessages(locale).account}</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Destinations */}
          <div className="footer-column">
            <h2>{ar ? "أبرز الوجهات" : "Top Destinations"}</h2>
            <ul>
              {topDestinations.map((dest) => (
                <li key={dest.slug}>
                  <Link href={`/${locale}/guides?destination=${dest.slug}`}>
                    <ArrowIcon size={14} className="footer-arrow" />
                    <span>{ar ? dest.ar : dest.en}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Useful Information & Support */}
          <div className="footer-column">
            <h2>{ar ? "معلومات وتواصل" : "Help & Legal"}</h2>
            <ul>
              <li><Link href={`/${locale}/contact`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.contact}</Link></li>
              <li><Link href={`/${locale}/contact#faq`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "الأسئلة الشائعة" : "FAQs"}</Link></li>
              <li><Link href={`/${locale}/terms`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.terms}</Link></li>
              <li><Link href={`/${locale}/privacy`}><ArrowIcon size={14} className="footer-arrow" /> {m.footerLinks.privacy}</Link></li>
              <li><Link href={`/${locale}/photo-credits`}><ArrowIcon size={14} className="footer-arrow" /> {ar ? "مصادر الصور" : "Photo credits"}</Link></li>
            </ul>
          </div>

          {/* Column 5: Connect & Location */}
          <div className="footer-column">
            <h2>{ar ? "المقر والتواصل" : "Headquarters"}</h2>
            <div className="footer-contact-info" style={{ marginTop: 0 }}>
              <div className="contact-item">
                <Phone size={16} />
                <a href="tel:+966501234567" dir="ltr" className="hover:text-[var(--color-primary)] transition">+966 50 123 4567</a>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <a href="mailto:hello@nadeem-sa.com" className="hover:text-[var(--color-primary)] transition">hello@nadeem-sa.com</a>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>{ar ? "طريق الملك فهد، الرياض، السعودية" : "King Fahd Road, Riyadh, KSA"}</span>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <p className="footer-social-text" style={{ marginBottom: "10px", fontSize: "0.85rem" }}>
                {ar ? "تابعنا على منصات التواصل:" : "Follow our channels:"}
              </p>
              <SocialChannels />
            </div>
            
            <div className="footer-map-container" style={{ marginTop: "16px", borderRadius: "12px", overflow: "hidden", height: "130px", boxShadow: "var(--shadow-soft)", border: "1px solid var(--border)", position: "relative" }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115934.33120610313!2d46.738586!3d24.774265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Nadeem Location Map"
              ></iframe>
              <a 
                href="https://maps.google.com/?q=Riyadh+Saudi+Arabia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-2 inset-inline-end-2 px-2 py-0.5 rounded-md bg-[var(--color-surface)]/90 backdrop-blur-xs text-[10px] font-bold text-[var(--color-primary)] border border-[var(--border)] shadow-xs flex items-center gap-1 hover:bg-[var(--color-surface)] transition"
              >
                <span>{ar ? "الخريطة" : "Map"}</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

        </div>

        {/* Enhanced Bottom Bar */}
        <div className="footer-bottom">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs">
            <p>© 2026 {m.name}. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <p className="text-[11px] text-[var(--muted)]">
              {ar ? "سجل تجاري: 1010789012 • ترخيص سياحي: 73100234" : "CR: 1010789012 • Tourism Lic: 73100234"}
            </p>
          </div>

          {/* Live Platform Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{ar ? "جميع الأنظمة تعمل بكفاءة" : "All systems operational"}</span>
          </div>

          <div className="footer-bottom-links items-center gap-4">
            <Link href={`/${locale}/contact`}>{m.footerLinks.contact}</Link>
            <Link href={`/${locale}/terms`}>{m.footerLinks.terms}</Link>
            <Link href={`/${locale}/privacy`}>{m.footerLinks.privacy}</Link>
            <BackToTop locale={locale} />
          </div>
        </div>

      </div>
    </footer>
  );
}
