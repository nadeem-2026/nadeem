import { AuthPage } from "@/components/auth-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل حساب جديد | نديم" : "Sign Up | Nadeem",
    description: locale === "ar" ? "سجل كمرشد سياحي أو سائح في منصة نديم" : "Sign up as a guide or tourist on Nadeem",
    robots: { index: false, follow: false }
  };
}
export default function Signup({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="signup" />; }
