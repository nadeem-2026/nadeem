import { requireAdmin } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  await requireAdmin(locale); // already checked for admin in layout, but double check doesn't hurt

  const adminClient = getSupabaseAdmin();

  const [{ count: usersCount }, { count: guidesCount }, { count: bookingsCount }, { data: earnings }] = await Promise.all([
    adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tourist"),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "guide"),
    adminClient.from("bookings").select("*", { count: "exact", head: true }),
    adminClient.from("guide_earnings").select("platform_fee")
  ]);

  const totalRevenue = earnings?.reduce((acc, curr) => acc + Number(curr.platform_fee), 0) || 0;
  const isAr = locale === "ar";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isAr ? "نظرة عامة" : "Admin Overview"}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-gray-500 mb-2">{isAr ? "إجمالي السياح" : "Total Tourists"}</h3>
          <p className="text-3xl font-bold">{usersCount || 0}</p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-gray-500 mb-2">{isAr ? "إجمالي المرشدين" : "Total Guides"}</h3>
          <p className="text-3xl font-bold">{guidesCount || 0}</p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm bg-white">
          <h3 className="text-gray-500 mb-2">{isAr ? "إجمالي الحجوزات" : "Total Bookings"}</h3>
          <p className="text-3xl font-bold">{bookingsCount || 0}</p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm bg-white bg-blue-50">
          <h3 className="text-blue-600 mb-2">{isAr ? "أرباح المنصة" : "Platform Revenue"}</h3>
          <p className="text-3xl font-bold text-blue-800">{totalRevenue.toFixed(2)} SAR</p>
        </div>
      </div>
    </div>
  );
}
