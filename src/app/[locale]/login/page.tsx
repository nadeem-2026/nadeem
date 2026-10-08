import { AuthPage } from "@/components/auth-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل الدخول | نديم" : "Login | Nadeem",
    description: locale === "ar" ? "تسجيل الدخول إلى حسابك في منصة نديم" : "Login to your Nadeem account",
    robots: { index: false, follow: false }
  };
}
export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ notice?: string }> }) {
  return <AuthPage params={params} intent="login" notice={(await searchParams).notice} />;
}
