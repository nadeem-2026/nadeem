"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, requireAccount } from "./server";
import { getAuthConfig } from "./config";
import { emailValue, passwordValid, registrationRole, shortText } from "./validation";
import { isLocale, type Locale } from "../i18n";
import { recoveryRequestClient } from "./recovery";

export type FormState = { error?: "invalid" | "failed" | "unavailable"; success?: "checkEmail" | "recoverySent" | "saved" | "submitted" | "reviewed" };
export type AuthIntent = "login" | "signup" | "forgot" | "update";

export async function authenticate(locale: Locale, intent: AuthIntent, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale) || !["login", "signup", "forgot", "update"].includes(intent)) return { error: "invalid" };
  const config = getAuthConfig();
  const client = await authClient();
  if (!client || !config) return { error: "unavailable" };
  if (intent === "update") {
    const { user } = await requireAccount(locale);
    if (!user || !passwordValid(form.get("password"))) return { error: "invalid" };
    const { error } = await client.auth.updateUser({ password: form.get("password") as string });
    if (error) return { error: "failed" };
    await client.auth.signOut({ scope: "local" });
    redirect(`/${locale}/login`);
  }
  const email = emailValue(form.get("email"));
  if (!email) return { error: "invalid" };
  if (intent === "forgot") {
    const callback = `${config.siteUrl}/${locale}/auth/callback?next=/${locale}/update-password`;
    const { error } = await recoveryRequestClient(config.url, config.key).auth.resetPasswordForEmail(email, { redirectTo: callback });
    return error ? { error: "failed" } : { success: "recoverySent" };
  }
  const password = form.get("password");
  if (typeof password !== "string" || !password || password.length > 128) return { error: "invalid" };
  if (intent === "signup") {
    const role = registrationRole(form.get("role"));
    const name = shortText(form.get("name"), 120);
    if (!role || !name || !passwordValid(password)) return { error: "invalid" };
    const { error } = await client.auth.signUp({ email, password, options: {
      data: { account_type: role, display_name: name },
      emailRedirectTo: `${config.siteUrl}/${locale}/auth/callback`,
    } });
    return error ? { error: "failed" } : { success: "checkEmail" };
  }
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: "failed" };
  redirect(`/${locale}/account`);
}

export async function signOut(locale: Locale) {
  if (!isLocale(locale)) return;
  const client = await authClient();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Sign out failed");
  }
  redirect(`/${locale}/login`);
}

export async function saveGuide(locale: Locale, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale)) return { error: "invalid" };
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "guide") return { error: "failed" };
  const name = shortText(form.get("name"), 120);
  const city = shortText(form.get("city"), 120);
  const bio = shortText(form.get("bio"), 2000);
  const submit = form.get("intent") === "submit";
  if (!name || !city || !bio) return { error: "invalid" };
  const { error } = await client.rpc("save_guide_profile", { p_name: name, p_city: city, p_bio: bio, p_submit: submit });
  if (error) return { error: "failed" };
  revalidatePath(`/${locale}/account`);
  return { success: submit ? "submitted" : "saved" };
}

export async function reviewGuide(locale: Locale, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale)) return { error: "invalid" };
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "admin") return { error: "failed" };
  const target = form.get("guide_id");
  const decision = form.get("decision");
  const reason = shortText(form.get("reason"), 1000);
  if (typeof target !== "string" || !/^[0-9a-f-]{36}$/i.test(target) || !reason || !["approved", "rejected", "suspended"].includes(String(decision))) return { error: "invalid" };
  const { error } = await client.rpc("review_guide_profile", { p_guide_id: target, p_decision: decision, p_reason: reason });
  if (error) return { error: "failed" };
  revalidatePath(`/${locale}/admin/guides`);
  return { success: "reviewed" };
}
