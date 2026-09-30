import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Only password-recovery requests use this flow. Signup/login keep their SSR
// client and PKCE. No template customization or browser verifier is required.
export function recoveryRequestClient(url: string, key: string) {
  return createClient(url, key, { auth: {
    flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } });
}

export async function establishRecoverySession(auth: Pick<SupabaseClient["auth"], "setSession">, fragment: string) {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (params.has("error") || params.has("error_code") || !accessToken || !refreshToken) return false;
  const { data, error } = await auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return !error && !!data.session && !!data.user;
}
