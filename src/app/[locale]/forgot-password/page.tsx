import { AuthPage } from "@/components/auth-page";
export default async function Forgot({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  return <AuthPage params={params} intent="forgot" notice={notice} />;
}
