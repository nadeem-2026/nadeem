import { cookies } from "next/headers";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { direction } from "@/lib/i18n";
import { getMessages } from "@/content/messages";
import "./globals.css";
import type { Theme } from "@/components/theme-switch";
import { Alexandria, Inter } from "next/font/google";

const alexandria = Alexandria({ subsets: ["arabic", "latin"], variable: "--font-arabic" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const m = getMessages(locale);
  return {
    title: `${m.name} | ${m.footer}`,
    description: m.description,
    robots: { index: false, follow: false },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64" }, { url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      url: "https://nadeem-sa.com",
      title: `${m.name} | ${m.footer}`,
      description: m.description,
      siteName: m.name,
      images: [
        {
          url: "/photos/alula.jpg",
          width: 1280,
          height: 853,
          alt: m.name,
        }
      ]
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const savedTheme = (await cookies()).get("nadeem-theme")?.value;
  const theme: Theme = savedTheme === "dark" ? "dark" : "light";
  return <html lang={locale} dir={direction(locale)} data-theme={theme} className={`${alexandria.variable} ${inter.variable}`} suppressHydrationWarning>
    <body suppressHydrationWarning><SiteHeader locale={locale} theme={theme} />{children}<SiteFooter locale={locale} /></body>
  </html>;
}
