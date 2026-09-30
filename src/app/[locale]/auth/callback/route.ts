import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/auth/server";
import { getAuthConfig } from "@/lib/auth/config";
import { resolveAuthCallback } from "@/lib/auth/callback";
import { isLocale } from "@/lib/i18n";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new NextResponse(null, { status: 404 });
  const config = getAuthConfig();
  const client = await authClient();
  const origin = config?.siteUrl ?? request.nextUrl.origin;
  const destination = await resolveAuthCallback(client?.auth ?? null, locale, request.nextUrl.searchParams);
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

// Link scanners probing with HEAD must not consume a one-time recovery token.
export function HEAD() { return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }
