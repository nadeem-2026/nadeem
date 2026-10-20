import { AuthPage } from "@/components/auth-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل حساب جديد | نديم" : "Sign Up | Nadeem",
    description: locale === "ar" ? "سجل كمرشد سياحي أو سائح في منصة نديم" : "Sign up as a guide or tourist on Nadeem",
    robots: { index: false, follow: false }
  };
}
export default async function Signup({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ notice?: string }> }) {
  return <AuthPage params={params} intent="signup" notice={(await searchParams).notice} />;
}
