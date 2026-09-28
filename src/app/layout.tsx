import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { direction } from "@/lib/i18n";
import { getMessages } from "@/content/messages";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const m = getMessages(await getRequestLocale());
  return {
    title: `${m.name} | ${m.footer}`,
    description: m.description,
    robots: { index: false, follow: false },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64" }, { url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  return <html lang={locale} dir={direction(locale)}>
    <body><SiteHeader locale={locale} />{children}<SiteFooter locale={locale} /></body>
  </html>;
}
