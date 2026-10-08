import { AuthPage } from "@/components/auth-page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "استعادة كلمة المرور | نديم" : "Forgot Password | Nadeem",
    robots: { index: false, follow: false }
  };
}

export default async function Forgot({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  return <AuthPage params={params} intent="forgot" notice={notice} />;
}
