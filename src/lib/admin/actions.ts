"use server";

import { requireAdmin } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

export async function resolveComplaint(complaintId: string, locale: Locale) {
  await requireAdmin(locale);
  const adminClient = getSupabaseAdmin();
  const { error } = await adminClient.from("complaints").update({ status: 'resolved', updated_at: new Date().toISOString() }).eq("id", complaintId);
  if (error) throw new Error(error.message);
  revalidatePath("/[locale]/admin/complaints", "page");
  return { success: true };
}
