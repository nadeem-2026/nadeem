import { requireAccount } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const { profile } = await requireAccount(locale);

  if (profile.role !== "admin") {
    notFound();
  }

  const adminClient = getSupabaseAdmin();
  const [{ count: pendingGuidesCount }, { count: unresolvedComplaintsCount }] = await Promise.all([
    adminClient.from("guide_profiles").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    adminClient.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending")
  ]);

  return (
    <AdminShell
      locale={locale}
      pendingGuidesCount={pendingGuidesCount || 0}
      unresolvedComplaintsCount={unresolvedComplaintsCount || 0}
      adminName={profile.display_name || (locale === "ar" ? "المشرف" : "Administrator")}
    >
      {children}
    </AdminShell>
  );
}

