import { NextResponse, type NextRequest } from "next/server";
import { localeFromPath } from "./lib/i18n";
import { createServerClient } from "@supabase/ssr";
import { getAuthConfig } from "./lib/auth/config";

// The URL is authoritative. Never trust a client-supplied locale header.
export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nadeem-locale", localeFromPath(request.nextUrl.pathname));
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const authRoute = /^\/(ar|en)\/(account|admin|login|signup|forgot-password|update-password|auth)(\/|$)/.test(request.nextUrl.pathname);
  const auth = authRoute ? getAuthConfig() : null;
  if (auth) {
    const client = createServerClient(auth.url, auth.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await client.auth.getClaims();
  }
  if (authRoute) response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|fonts/).*)"],
};
