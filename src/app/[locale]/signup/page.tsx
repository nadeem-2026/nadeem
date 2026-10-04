import { AuthPage } from "@/components/auth-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تسجيل حساب جديد | نديم" : "Sign Up | Nadeem"
  };
}
export default function Signup({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="signup" />; }
