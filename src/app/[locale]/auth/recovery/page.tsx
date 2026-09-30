import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { getAuthConfig } from "@/lib/auth/config";
import { RecoverySession } from "@/components/recovery-session";

export const metadata: Metadata = { referrer: "no-referrer" };
export default async function Recovery({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const config = getAuthConfig();
  if (!config) redirect(`/${locale}/forgot-password?notice=expired`);
  return <main id="main-content" className="container account-page" tabIndex={-1}>
    <h1>{locale === "ar" ? "استعادة كلمة المرور" : "Reset your password"}</h1>
    <RecoverySession locale={locale} url={config.url} publicKey={config.key} />
    <noscript>{locale === "ar" ? "فعّل JavaScript للتحقق من رابط الاستعادة." : "Enable JavaScript to verify your recovery link."}</noscript>
  </main>;
}
