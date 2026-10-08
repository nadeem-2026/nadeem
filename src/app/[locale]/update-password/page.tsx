import { AuthPage } from "@/components/auth-page";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تحديث كلمة المرور | نديم" : "Update Password | Nadeem",
    robots: { index: false, follow: false }
  };
}

export default function Update({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="update" />; }
