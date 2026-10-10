"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Menu, X } from "lucide-react";

export function MobileNav({ 
  locale, 
  messages, 
  accountText 
}: { 
  locale: Locale; 
  messages: Record<string, string>; 
  accountText: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <nav className="mobile-menu-drawer" onClick={e => e.stopPropagation()} aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
            <div className="mobile-menu-header">
              <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <Link href={`/${locale}`} onClick={() => setIsOpen(false)}>{messages.home}</Link>
            <Link href={`/${locale}/guides`} onClick={() => setIsOpen(false)}>{locale === "ar" ? "المرشدون السياحيون" : "Tour Guides"}</Link>
            <Link href={`/${locale}/become-a-guide`} onClick={() => setIsOpen(false)}>{locale === "ar" ? "انضم كمرشد" : "Become a Guide"}</Link>
            <Link href={`/${locale}/contact`} onClick={() => setIsOpen(false)}>{messages.contact}</Link>
            <Link href={`/${locale}/account`} onClick={() => setIsOpen(false)} className="mobile-account-link">{accountText}</Link>
          </nav>
        </div>
      )}
    </>
  );
}
