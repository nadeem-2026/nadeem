import { requireAccount } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";
import { GuidesTable } from "@/components/admin/guides-table";

export default async function AdminGuidesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  await requireAccount(locale);

  const adminClient = getSupabaseAdmin();
  const { data: guides } = await adminClient
    .from("guide_profiles")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false });

  const isAr = locale === "ar";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isAr ? "إدارة المرشدين" : "Manage Guides"}</h1>
      <GuidesTable guides={guides || []} locale={locale} />
    </div>
  );
}
