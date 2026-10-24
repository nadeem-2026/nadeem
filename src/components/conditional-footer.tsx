"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-shell";
import type { Locale } from "@/lib/i18n";

/**
 * Determines whether the marketing SiteFooter should be shown based on route.
 * Shows on: Homepage, Guides directory, Guide details, Become a guide, Contact/FAQ, Terms, Privacy, Photo credits.
 * Hides on: Admin dashboard, Account/Wizard, Auth (Login, Signup, Recover), Booking form, Individual Bookings, Payments.
 */
export function shouldShowFooter(pathname: string | null): boolean {
  if (!pathname) return true;

  // Normalize by stripping locale prefix (e.g., /ar/contact -> /contact, /en -> /)
  const cleanPath = pathname.replace(/^\/(?:ar|en)(?=\/|$)/, "") || "/";

  // Routes where the marketing footer should NOT be displayed
  const hiddenPrefixes = [
    "/admin",
    "/account",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/auth",
    "/payment",
    "/bookings",
  ];

  for (const prefix of hiddenPrefixes) {
    if (cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)) {
      return false;
    }
  }

  // Specifically hide on focused booking step (/guides/:id/book)
  if (cleanPath.endsWith("/book") || cleanPath.includes("/book/")) {
    return false;
  }

  return true;
}

export function ConditionalFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  if (!shouldShowFooter(pathname)) {
    return null;
  }

  return <SiteFooter locale={locale} />;
}
