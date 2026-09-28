import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "../i18n";
import { getAuthConfig } from "./config";

export async function authClient() {
  const config = getAuthConfig();
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components are read-only; the proxy refreshes their cookies. */ }
      },
    },
  });
}

export type Profile = { id: string; display_name: string; role: "tourist" | "guide" | "admin"; account_status: "active" | "suspended" };
export async function requireAccount(locale: Locale) {
  const client = await authClient();
  if (!client) redirect(`/${locale}/login?notice=unavailable`);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || !user.email_confirmed_at) redirect(`/${locale}/login`);
  const { data: profile, error: profileError } = await client.from("profiles").select("id, display_name, role, account_status").eq("id", user.id).single<Profile>();
  if (profileError || !profile) throw new Error("Account profile is not available. Check migrations and access policies.");
  if (profile.account_status !== "active") redirect(`/${locale}/login?notice=suspended`);
  return { client, user, profile };
}
