"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { 
  Menu, 
  X, 
  Compass, 
  Users, 
  Award, 
  Headphones, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Brand } from "./brand";

interface MobileNavProps {
  locale: Locale;
  messages: Record<string, string>;
  accountText: string;
  siteName?: string;
}

export function MobileNav({ 
  locale, 
  messages, 
  accountText,
  siteName
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAr = locale === "ar";
  const brandName = siteName || (isAr ? "نديم" : "Nadeem");
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Automatically close menu when navigating to another route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: `/${locale}`,
      label: messages.home || (isAr ? "الرئيسية" : "Home"),
      subtext: isAr ? "استكشف التجارب والوجهات" : "Explore Saudi destinations",
      icon: Compass,
      exact: true,
    },
    {
      href: `/${locale}/guides`,
      label: isAr ? "المرشدون السياحيون" : "Tour Guides",
      subtext: isAr ? "نخبة المرشدين المرخصين" : "Verified local experts",
      icon: Users,
    },
    {
      href: `/${locale}/become-a-guide`,
      label: isAr ? "انضم كمرشد" : "Become a Guide",
      subtext: isAr ? "قد جولاتك وضاعف دخلك" : "Lead tours & grow earnings",
      icon: Award,
      badge: isAr ? "فرصة معتمدة" : "Licensed",
    },
    {
      href: `/${locale}/contact`,
      label: messages.contact || (isAr ? "تواصل معنا" : "Contact Us"),
      subtext: isAr ? "دعم واستفسارات على مدار الساعة" : "24/7 tourist assistance",
      icon: Headphones,
    },
    {
      href: `/${locale}/account`,
      label: accountText || (isAr ? "حسابي" : "My Account"),
      subtext: isAr ? "إدارة الحجوزات والملف الشخصي" : "Manage bookings & profile",
      icon: User,
      isAccount: true,
    },
  ];

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isAr ? (isOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية") : (isOpen ? "Close menu" : "Open main menu")}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsOpen(false)}
          aria-hidden={!isOpen}
        >
          <nav 
            className="mobile-menu-drawer" 
            onClick={e => e.stopPropagation()} 
            aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}
          >
            {/* Header: Brand Logo & Styled Close Button */}
            <div className="mobile-drawer-header">
              <Link 
                href={`/${locale}`} 
                onClick={() => setIsOpen(false)} 
                className="mobile-drawer-brand"
                aria-label={brandName}
              >
                <Brand name={brandName} />
                <span className="mobile-drawer-tagline">
                  {isAr ? "منصة السياحة السعودية" : "Saudi Tourism Platform"}
                </span>
              </Link>
              
              <button 
                className="mobile-drawer-close" 
                onClick={() => setIsOpen(false)} 
                aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links List */}
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact 
                    ? pathname === item.href 
                    : (pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/${locale}`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`mobile-nav-link ${isActive ? "active" : ""} ${item.isAccount ? "mobile-nav-account" : ""}`}
                    >
                      <div className="mobile-nav-icon-wrap">
                        <Icon size={19} />
                      </div>
                      <div className="mobile-nav-text">
                        <div className="flex items-center gap-2">
                          <span className="mobile-nav-title">{item.label}</span>
                          {item.badge && (
                            <span className="mobile-nav-badge">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="mobile-nav-subtext">{item.subtext}</span>
                      </div>
                      <ChevronIcon size={16} className="mobile-nav-chevron" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer Trust & Action Hub */}
            <div className="mobile-drawer-footer">
              <div className="mobile-drawer-trust">
                <div className="mobile-trust-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="mobile-trust-title">
                    {isAr ? "منصة سعودية معتمدة" : "Certified Saudi Platform"}
                  </span>
                  <span className="mobile-trust-sub">
                    {isAr ? "مرشدون موثقون بترخيص وزارة السياحة" : "Official Ministry of Tourism Guides"}
                  </span>
                </div>
              </div>

              <Link 
                href={`/${locale}/guides`} 
                onClick={() => setIsOpen(false)}
                className="mobile-drawer-cta"
              >
                <Sparkles size={16} />
                <span>{isAr ? "استكشف المرشدين الآن" : "Explore Tour Guides"}</span>
                {isAr ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
