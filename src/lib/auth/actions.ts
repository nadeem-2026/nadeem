"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, requireAccount } from "./server";
import { getAuthConfig } from "./config";
import { emailValue, passwordValid, registrationRole, shortText } from "./validation";
import { isLocale, type Locale } from "../i18n";
import { recoveryRequestClient } from "./recovery";
import { getSupabaseAdmin } from "./admin";

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
    const firstName = shortText(form.get("first_name"), 60);
    const lastName = shortText(form.get("last_name"), 60);
    const legacyName = shortText(form.get("name"), 120);
    const name = (firstName && lastName)
      ? shortText(`${firstName} ${lastName}`.trim(), 120)
      : legacyName;
    if (!role || !name || !passwordValid(password)) return { error: "invalid" };
    const { error } = await client.auth.signUp({ email, password, options: {
      data: {
        account_type: role,
        display_name: name,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
      },
      emailRedirectTo: `${config.siteUrl}/${locale}/auth/callback`,
    } });
    return error ? { error: "failed" } : { success: "checkEmail" };
  }
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: "failed" };
  redirect(`/${locale}/account`);
}

export async function signInWithGoogle(locale: Locale, intent: "login" | "signup", role?: "tourist" | "guide") {
  if (!isLocale(locale)) return;
  const config = getAuthConfig();
  const client = await authClient();
  if (!client || !config) redirect(`/${locale}/${intent}?notice=unavailable`);

  // Verify whether Google provider is active in Supabase
  try {
    const res = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key },
      cache: "no-store",
    });
    if (res.ok) {
      const settings = await res.json();
      if (settings?.external && settings.external.google === false) {
        redirect(`/${locale}/${intent}?notice=google_not_configured`);
      }
    }
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e && typeof (e as { digest: string }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
  }

  const nextPath = `/${locale}/account`;
  const roleQuery = role && (role === "guide" || role === "tourist") ? `&role=${role}` : "";
  const redirectTo = `${config.siteUrl}/${locale}/auth/callback?next=${encodeURIComponent(nextPath)}${roleQuery}`;

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect(`/${locale}/${intent}?notice=failed`);
  }

  redirect(data.url);
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
  const first_name = shortText(form.get("first_name"), 50);
  const last_name = shortText(form.get("last_name"), 50);
  const full_name_ar = shortText(form.get("full_name_ar"), 120);
  const full_name_en = shortText(form.get("full_name_en"), 120);

  const rawName = form.get("name") || full_name_ar || `${first_name} ${last_name}`.trim() || profile.display_name;
  const name = shortText(rawName, 120);
  const city = shortText(form.get("city"), 120);
  let bio = shortText(form.get("bio"), 2000);

  const languages = form.get("languages")?.toString().split(",").map(s => shortText(s.trim(), 50)).filter(Boolean) || [];
  const service_areas = form.get("service_areas")?.toString().split(",").map(s => shortText(s.trim(), 50)).filter(Boolean) || [];
  const hourly_rate = parseFloat(form.get("hourly_rate")?.toString() || "0") || 0;
  const max_participants = parseInt(form.get("max_participants")?.toString() || "1", 10) || 1;
  const inclusions = form.get("inclusions")?.toString().split(",").map(s => shortText(s.trim(), 100)).filter(Boolean) || [];
  
  let address_details = {};
  try { address_details = JSON.parse(form.get("address_details")?.toString() || "{}"); } catch { address_details = { raw: form.get("address_details")?.toString() }; }
  
  const national_id_url = form.get("national_id_url")?.toString() || "";
  const official_license_url = form.get("official_license_url")?.toString() || "";
  const personal_photo_url = form.get("personal_photo_url")?.toString() || "";
  const language_certificates_val = form.get("language_certificates")?.toString() || "";
  const language_certificates = language_certificates_val ? { url: language_certificates_val } : {};

  const submit = form.get("intent") === "submit";
  if (!submit && !bio) {
    bio = locale === "ar" ? "مسودة نبذة تعريفية" : "Draft bio";
  }
  if (!name || !city || !bio) return { error: "invalid" };
  const { error } = await client.rpc("save_guide_profile", { 
    p_name: name, p_city: city, p_bio: bio, 
    p_languages: languages, p_service_areas: service_areas, 
    p_hourly_rate: hourly_rate, p_max_participants: max_participants, 
    p_inclusions: inclusions, 
    p_first_name: first_name, p_last_name: last_name, 
    p_full_name_ar: full_name_ar, p_full_name_en: full_name_en, 
    p_address_details: address_details, 
    p_national_id_url: national_id_url, p_official_license_url: official_license_url, 
    p_language_certificates: language_certificates,
    p_personal_photo_url: personal_photo_url,
    p_submit: submit 
  });
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

export async function saveAvailability(locale: Locale, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale)) return { error: "invalid" };
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "guide") return { error: "failed" };
  
  const days = [0, 1, 2, 3, 4, 5, 6];
  const inserts = [];
  for (const day of days) {
    if (form.get(`day_${day}_active`)) {
      const start_time = form.get(`day_${day}_start`)?.toString() || "09:00";
      const end_time = form.get(`day_${day}_end`)?.toString() || "17:00";
      if (start_time >= end_time) return { error: "invalid" };
      inserts.push({ guide_id: profile.id, day_of_week: day, start_time: `${start_time}:00`, end_time: `${end_time}:00` });
    }
  }

  const { error: deleteError } = await client.from("guide_availability_weekly").delete().eq("guide_id", profile.id);
  if (deleteError) return { error: "failed" };
  
  if (inserts.length > 0) {
    const { error: insertError } = await client.from("guide_availability_weekly").insert(inserts);
    if (insertError) return { error: "failed" };
  }

  revalidatePath(`/${locale}/account`);
  return { success: "saved" };
}

export async function addException(locale: Locale, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale)) return { error: "invalid" };
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "guide") return { error: "failed" };
  
  const exception_date = form.get("exception_date")?.toString();
  const is_available = form.get("is_available") === "on";
  let start_time = form.get("start_time")?.toString();
  let end_time = form.get("end_time")?.toString();

  if (!exception_date) return { error: "invalid" };
  
  if (is_available) {
    if (!start_time || !end_time) return { error: "invalid" };
    start_time = `${start_time}:00`;
    end_time = `${end_time}:00`;
    if (start_time >= end_time) return { error: "invalid" };
  } else {
    start_time = undefined;
    end_time = undefined;
  }

  const { error } = await client.from("guide_availability_exceptions").upsert({
    guide_id: profile.id,
    exception_date,
    is_available,
    start_time,
    end_time
  }, { onConflict: "guide_id, exception_date" });

  if (error) return { error: "failed" };
  
  revalidatePath(`/${locale}/account`);
  return { success: "saved" };
}

export async function deleteException(locale: Locale, id: string) {
  if (!isLocale(locale)) return;
  const { client, profile } = await requireAccount(locale);
  if (profile.role === "guide") {
    await client.from("guide_availability_exceptions").delete().eq("id", id).eq("guide_id", profile.id);
    revalidatePath(`/${locale}/account`);
  }
}

export type TouristProfile = {
  user_id: string;
  phone_number: string;
  nationality: string;
  country_of_residence: string;
  city_of_residence: string;
  preferred_languages: string[];
  interests: string[];
  travel_style: "solo" | "family" | "couples" | "friends";
  dietary_requirements: string;
  mobility_needs: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  bio: string;
  created_at?: string;
  updated_at?: string;
};

export async function saveTourist(locale: Locale, _previous: FormState, form: FormData): Promise<FormState> {
  if (!isLocale(locale)) return { error: "invalid" };
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "tourist" && profile.role !== "admin") return { error: "failed" };

  const display_name = shortText(form.get("display_name"), 120);
  const phone_number = shortText(form.get("phone_number"), 30);
  const nationality = shortText(form.get("nationality"), 60);
  const country_of_residence = shortText(form.get("country_of_residence"), 60);
  const city_of_residence = shortText(form.get("city_of_residence"), 60);
  const preferred_languages = form.getAll("preferred_languages").map(String).filter(Boolean);
  const interests = form.getAll("interests").map(String).filter(Boolean);
  const travel_style_val = String(form.get("travel_style") || "solo");
  const travel_style = ["solo", "family", "couples", "friends"].includes(travel_style_val) ? travel_style_val : "solo";
  const dietary_requirements = shortText(form.get("dietary_requirements"), 250);
  const mobility_needs = shortText(form.get("mobility_needs"), 250);
  const emergency_contact_name = shortText(form.get("emergency_contact_name"), 100);
  const emergency_contact_phone = shortText(form.get("emergency_contact_phone"), 30);
  const bio = shortText(form.get("bio"), 500);
  const avatar_url = shortText(form.get("avatar_url"), 500);

  const { error } = await client.rpc("save_tourist_profile", {
    p_display_name: display_name,
    p_phone_number: phone_number,
    p_nationality: nationality,
    p_country_of_residence: country_of_residence,
    p_city_of_residence: city_of_residence,
    p_preferred_languages: preferred_languages.length > 0 ? preferred_languages : ["ar"],
    p_interests: interests,
    p_travel_style: travel_style,
    p_dietary_requirements: dietary_requirements,
    p_mobility_needs: mobility_needs,
    p_emergency_contact_name: emergency_contact_name,
    p_emergency_contact_phone: emergency_contact_phone,
    p_bio: bio,
    p_avatar_url: avatar_url || null,
  });

  if (error) {
    try {
      const admin = getSupabaseAdmin();
      await admin.from("profiles").update({
        display_name,
      }).eq("id", profile.id);

      const metadataProfile = {
        phone_number,
        nationality,
        country_of_residence,
        city_of_residence,
        preferred_languages: preferred_languages.length > 0 ? preferred_languages : ["ar"],
        interests,
        travel_style,
        dietary_requirements,
        mobility_needs,
        emergency_contact_name,
        emergency_contact_phone,
        bio,
      };

      await admin.auth.admin.updateUserById(profile.id, {
        user_metadata: {
          display_name,
          tourist_profile: metadataProfile,
        },
      });

      // Best effort upsert in case tourist_profiles table exists without RPC
      await admin.from("tourist_profiles").upsert({
        user_id: profile.id,
        ...metadataProfile,
      });

      revalidatePath(`/${locale}/account`);
      return { success: "saved" };
    } catch {
      return { error: "failed" };
    }
  }
  revalidatePath(`/${locale}/account`);
  return { success: "saved" };
}
