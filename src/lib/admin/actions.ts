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
  revalidatePath(`/${locale}/admin/complaints`);
  return { success: true };
}

export async function getGuideDocumentSignedUrl(filePath: string, locale: Locale) {
  await requireAdmin(locale);
  if (!filePath) return { url: null };
  try {
    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient.storage.from("guide_documents").createSignedUrl(filePath, 3600);
    if (error || !data) return { url: null, error: error?.message || "Could not generate link" };
    return { url: data.signedUrl };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load document";
    return { url: null, error: errorMsg };
  }
}

export async function adminReviewGuide(guideId: string, decision: "approved" | "rejected" | "suspended", reason: string, locale: Locale) {
  const { client } = await requireAdmin(locale);
  if (!guideId || !decision || !reason) throw new Error("Missing parameters");
  const { error } = await client.rpc("review_guide_profile", {
    p_guide_id: guideId,
    p_decision: decision,
    p_reason: reason
  });
  if (error) throw new Error(error.message || "Failed to submit review");
  revalidatePath(`/${locale}/admin/guides`);
  revalidatePath(`/${locale}/admin`);
  return { success: true };
}

