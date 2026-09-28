import { AuthPage } from "@/components/auth-page";
export default function Forgot({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="forgot" />; }
