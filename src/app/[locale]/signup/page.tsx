import { AuthPage } from "@/components/auth-page";
export default function Signup({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="signup" />; }
