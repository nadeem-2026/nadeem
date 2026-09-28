import Link from "next/link";
import { AuthForm } from "./auth-forms";
import { authMessages } from "@/content/auth";
import { getAuthConfig } from "@/lib/auth/config";
import { requireAccount } from "@/lib/auth/server";
import { isLocale } from "@/lib/i18n";
import type { AuthIntent } from "@/lib/auth/actions";
import { notFound } from "next/navigation";

export async function AuthPage({ params, intent, notice }: { params: Promise<{ locale: string }>; intent: AuthIntent; notice?: string }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (intent === "update") await requireAccount(locale);
  const m = authMessages(locale);
  return <main id="main-content" className="container account-page" tabIndex={-1}>
    <p className="eyebrow">{m.development}</p><h1>{m[intent]}</h1><p>{m.developmentNote}</p>
    {notice === "suspended" && <p role="alert">{m.suspended}</p>}
    {notice === "expired" && <p role="alert">{m.sessionExpired}</p>}
    <AuthForm locale={locale} intent={intent} configured={!!getAuthConfig()} />
    <nav className="account-links" aria-label={locale === "ar" ? "روابط الحساب" : "Account links"}>
      {intent !== "login" && <Link href={`/${locale}/login`}>{m.login}</Link>}
      {intent !== "signup" && <Link href={`/${locale}/signup`}>{m.signup}</Link>}
      {intent !== "forgot" && <Link href={`/${locale}/forgot-password`}>{m.forgot}</Link>}
    </nav>
  </main>;
}
