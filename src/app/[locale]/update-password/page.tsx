import { AuthPage } from "@/components/auth-page";
export default function Update({ params }: { params: Promise<{ locale: string }> }) { return <AuthPage params={params} intent="update" />; }
