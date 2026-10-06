"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function MobileNav({ 
  locale, 
  messages, 
  accountText 
}: { 
  locale: Locale; 
  messages: any; 
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <nav className="mobile-menu-drawer" onClick={e => e.stopPropagation()} aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
            <div className="mobile-menu-header">
              <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Link href={`/${locale}`} onClick={() => setIsOpen(false)}>{messages.home}</Link>
            <a href={`/${locale}#about`} onClick={() => setIsOpen(false)}>{messages.about}</a>
            <a href={`/${locale}#services`} onClick={() => setIsOpen(false)}>{messages.services}</a>
            <a href={`/${locale}#contact`} onClick={() => setIsOpen(false)}>{messages.contact}</a>
            <Link href={`/${locale}/account`} onClick={() => setIsOpen(false)} className="mobile-account-link">{accountText}</Link>
          </nav>
        </div>
      )}
    </>
  );
}
