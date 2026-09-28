import { AuthPage } from "@/components/auth-page";
export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ notice?: string }> }) {
  return <AuthPage params={params} intent="login" notice={(await searchParams).notice} />;
}
