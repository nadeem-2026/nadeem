import { requireAdmin } from "@/lib/auth/server";
import type { Locale } from "@/lib/i18n";
import { GuidesTable } from "@/components/admin/guides-table";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return {
    title: locale === "ar" ? "إدارة المرشدين | نديم" : "Manage Guides | Nadeem",
    description: locale === "ar" ? "لوحة تحكم إدارة المرشدين السياحيين" : "Guides Management Dashboard"
  };
}

export default async function AdminGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const { client: adminClient } = await requireAdmin(locale);
  const { data: guides, error } = await adminClient
    .from("guide_profiles")
    .select("*, profiles!guide_profiles_user_id_fkey(display_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Guide review queue could not be loaded");

  return (
    <div className="space-y-6">
      <GuidesTable guides={guides || []} locale={locale} />
    </div>
  );
}

