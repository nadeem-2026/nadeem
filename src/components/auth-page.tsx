import Link from "next/link";
import Image from "next/image";
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
  const ar = locale === "ar";
  
  return (
    <main id="main-content" tabIndex={-1} className="auth-split-layout">
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <Link href={`/${locale}`} className="auth-back-link">
            {ar ? "← العودة للرئيسية" : "← Back to Home"}
          </Link>
          <h1 className="auth-title">{m[intent]}</h1>
          
          {notice === "suspended" && <p role="alert" className="form-error">{m.suspended}</p>}
          {notice === "expired" && <p role="alert" className="form-error">{m.sessionExpired}</p>}
          
          <AuthForm locale={locale} intent={intent} configured={!!getAuthConfig()} />
          
          <nav className="account-links" aria-label={ar ? "روابط الحساب" : "Account links"}>
            {intent !== "login" && <Link href={`/${locale}/login`}>{m.login}</Link>}
            {intent !== "signup" && <Link href={`/${locale}/signup`}>{m.signup}</Link>}
            {intent !== "forgot" && <Link href={`/${locale}/forgot-password`}>{m.forgot}</Link>}
          </nav>
        </div>
      </div>
      <div className="auth-image-side">
         <Image src="/photos/alula.jpg" alt="AlUla" fill style={{ objectFit: "cover" }} priority />
         <div className="auth-image-overlay">
           <div className="auth-quote">
             <h2>{ar ? "السعودية أجمل برفقة أهلها" : "Saudi Arabia, through local eyes"}</h2>
             <p>{ar ? "اكتشف الوجهات والحكايات المحلية مع نديم." : "Discover places, people and stories with Nadeem."}</p>
           </div>
         </div>
      </div>
    </main>
  );
}
