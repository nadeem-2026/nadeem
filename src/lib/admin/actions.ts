"use server";

import { requireAccount } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

async function requireAdmin(locale: Locale) {
  const account = await requireAccount(locale);
  if (account.profile.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return account;
}

export async function approveGuide(userId: string, locale: Locale) {
  await requireAdmin(locale);
  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient.from("guide_profiles").update({ is_verified: true }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/[locale]/admin/guides", "page");
  return { success: true };
}

export async function resolveComplaint(complaintId: string, locale: Locale) {
  await requireAdmin(locale);
  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient.from("complaints").update({ status: 'resolved', updated_at: new Date().toISOString() }).eq("id", complaintId);
  if (error) throw new Error(error.message);
  revalidatePath("/[locale]/admin/complaints", "page");
  return { success: true };
}
