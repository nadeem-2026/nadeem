import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/auth/server";
import { getAuthConfig } from "@/lib/auth/config";
import { callbackDestination } from "@/lib/auth/validation";
import { isLocale } from "@/lib/i18n";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new NextResponse(null, { status: 404 });
  const config = getAuthConfig();
  const client = await authClient();
  const code = request.nextUrl.searchParams.get("code");
  const origin = config?.siteUrl ?? request.nextUrl.origin;
  if (client && code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(callbackDestination(locale, request.nextUrl.searchParams.get("next")), origin));
  }
  return NextResponse.redirect(new URL(`/${locale}/login?notice=expired`, origin));
}
