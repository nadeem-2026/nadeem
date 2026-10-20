import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/auth/server";
import { getAuthConfig } from "@/lib/auth/config";
import { resolveAuthCallback } from "@/lib/auth/callback";
import { isLocale } from "@/lib/i18n";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new NextResponse(null, { status: 404 });
  const config = getAuthConfig();
  const client = await authClient();
  const origin = config?.siteUrl ?? request.nextUrl.origin;
  const destination = await resolveAuthCallback(client?.auth ?? null, locale, request.nextUrl.searchParams);

  const code = request.nextUrl.searchParams.get("code");
  if (code && client && !destination.includes("notice=")) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const roleParam = request.nextUrl.searchParams.get("role");
        const admin = getSupabaseAdmin();
        const { data: profile } = await admin.from("profiles").select("id, display_name, role, avatar_url, created_at").eq("id", user.id).single();
        if (profile) {
          const updates: Record<string, string> = {};
          const googleName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "").trim();
          if (!profile.display_name && googleName) {
            updates.display_name = googleName.slice(0, 120);
          }
          const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
          if (!profile.avatar_url && typeof googleAvatar === "string" && googleAvatar) {
            updates.avatar_url = googleAvatar.slice(0, 500);
          }
          const isFreshUser = Date.now() - new Date(profile.created_at).getTime() < 300_000;
          if (roleParam === "guide" && profile.role === "tourist" && isFreshUser) {
            updates.role = "guide";
            await admin.from("guide_profiles").upsert({ user_id: user.id }, { onConflict: "user_id" });
          }
          if (Object.keys(updates).length > 0) {
            await admin.from("profiles").update(updates).eq("id", user.id);
          }
        }
      }
    } catch {
      // Non-blocking: profile enrichment failure should not prevent valid login
    }
  }

  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

// Link scanners probing with HEAD must not consume a one-time recovery token.
export function HEAD() { return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }
