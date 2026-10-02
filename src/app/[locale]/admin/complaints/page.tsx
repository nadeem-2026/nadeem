import { requireAccount } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";
import { ComplaintsTable } from "@/components/admin/complaints-table";

export default async function AdminComplaintsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  await requireAccount(locale);

  const adminClient = getSupabaseAdmin();
  const { data: complaints } = await adminClient
    .from("complaints")
    .select(`
      *,
      tourist:profiles!complaints_tourist_id_fkey(display_name),
      guide:profiles!complaints_guide_id_fkey(display_name),
      bookings(start_time)
    `)
    .order("created_at", { ascending: false });

  const isAr = locale === "ar";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isAr ? "إدارة الشكاوى" : "Manage Complaints"}</h1>
      <ComplaintsTable complaints={complaints || []} locale={locale} />
    </div>
  );
}
