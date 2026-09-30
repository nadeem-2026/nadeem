import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "../i18n";
import { callbackDestination } from "./validation";

type CallbackAuth = Pick<SupabaseClient["auth"], "exchangeCodeForSession">;

export async function resolveAuthCallback(auth: CallbackAuth | null, locale: Locale, query: URLSearchParams) {
  const recovery = query.get("type") === "recovery" || query.get("next") === `/${locale}/update-password`;
  const failed = `/${locale}/${recovery ? "forgot-password" : "login"}?notice=expired`;
  if (!auth || query.has("error") || query.has("error_code")) return failed;

  if (query.has("token_hash")) return failed;

  // Keep existing signup links and same-browser recovery links working.
  const code = query.get("code");
  if (code) {
    const { data, error } = await auth.exchangeCodeForSession(code);
    if (!error && data.session && data.user) return callbackDestination(locale, query.get("next"));
    return failed;
  }
  // URL fragments are only visible in the browser. A redirect without a
  // fragment preserves it, letting the recovery page establish SSR cookies.
  if (recovery) return `/${locale}/auth/recovery`;
  return failed;
}
