import { requireAdmin } from "@/lib/auth/server";
import { getSupabaseAdmin } from "@/lib/auth/admin";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  CalendarDays, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  ChevronRight, 
  TrendingUp
} from "lucide-react";

interface RecentGuideItem {
  user_id: string;
  city: string | null;
  status: "draft" | "pending_review" | "approved" | "rejected" | "suspended";
  hourly_rate: number;
  created_at: string;
  profiles: { display_name: string } | null;
}

interface RecentBookingItem {
  id: string;
  total_price: number;
  status: string;
  start_time: string | null;
  tourist: { display_name: string } | null;
  guide: { display_name: string } | null;
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return {
    title: locale === "ar" ? "لوحة الإدارة | نديم" : "Admin Dashboard | Nadeem",
    description: locale === "ar" ? "لوحة تحكم إدارة منصة نديم" : "Nadeem Platform Admin Dashboard"
  };
}

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  await requireAdmin(locale);

  const adminClient = getSupabaseAdmin();

  const [
    { count: touristsCount },
    { count: totalGuidesCount },
    { count: pendingGuidesCount },
    { count: bookingsCount },
    { data: earnings },
    { data: recentGuides },
    { data: recentBookings },
    { data: guidesByCity }
  ] = await Promise.all([
    adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tourist"),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "guide"),
    adminClient.from("guide_profiles").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    adminClient.from("bookings").select("*", { count: "exact", head: true }),
    adminClient.from("guide_earnings").select("platform_fee"),
    adminClient.from("guide_profiles")
      .select("user_id, city, status, hourly_rate, created_at, profiles!guide_profiles_user_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    adminClient.from("bookings")
      .select("id, total_price, status, start_time, tourist:profiles!bookings_tourist_id_fkey(display_name), guide:profiles!bookings_guide_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    adminClient.from("guide_profiles").select("city")
  ]);

  const totalRevenue = earnings?.reduce((acc, curr) => acc + Number(curr.platform_fee), 0) || 0;
  const isAr = locale === "ar";

  // Calculate city distribution
  const cityCounts: Record<string, number> = {};
  guidesByCity?.forEach(g => {
    if (g.city) {
      cityCounts[g.city] = (cityCounts[g.city] || 0) + 1;
    }
  });
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Alert banner if guides are pending review */}
      {(pendingGuidesCount || 0) > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-base m-0">
                {isAr 
                  ? `يوجد ${pendingGuidesCount} طلبات مرشدين بانتظار المراجعة والاعتماد` 
                  : `${pendingGuidesCount} guides are waiting for verification`}
              </h3>
              <p className="text-xs text-amber-700 m-0 mt-0.5">
                {isAr 
                  ? "تأكد من تدقيق رخصة الإرشاد السياحي والهوية الوطنية لضمان موثوقية المنصة."
                  : "Verify tourism licenses and national IDs to maintain platform quality."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/admin/guides`}
            className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs whitespace-nowrap"
          >
            <span>{isAr ? "بدء المراجعة الفورية" : "Review Now"}</span>
            <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-metrics-grid">
        {/* Total Tourists */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">{isAr ? "إجمالي السياح" : "Total Tourists"}</span>
            <div className="admin-stat-icon blue">
              <Users size={22} />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{touristsCount || 0}</div>
            <div className="admin-stat-sub mt-2">
              <span className="admin-stat-badge">
                <TrendingUp size={12} className="inline mr-1" /> +100%
              </span>
              <span>{isAr ? "سائح ومستخدم مسجل" : "Registered travelers"}</span>
            </div>
          </div>
        </div>

        {/* Total Guides */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">{isAr ? "المرشدون السياحيون" : "Tour Guides"}</span>
            <div className="admin-stat-icon gold">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{totalGuidesCount || 0}</div>
            <div className="admin-stat-sub mt-2">
              <span className="text-xs text-[var(--color-primary)] font-semibold">
                {pendingGuidesCount || 0} {isAr ? "قيد التدقيق" : "pending"}
              </span>
              <span>•</span>
              <span>{totalGuidesCount ? totalGuidesCount - (pendingGuidesCount || 0) : 0} {isAr ? "معتمد" : "active"}</span>
            </div>
          </div>
        </div>

        {/* Bookings Count */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">{isAr ? "إجمالي الجولات والحجوزات" : "Total Bookings"}</span>
            <div className="admin-stat-icon emerald">
              <CalendarDays size={22} />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{bookingsCount || 0}</div>
            <div className="admin-stat-sub mt-2">
              <span>{isAr ? "جولات سياحية مسجلة" : "Tours scheduled"}</span>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">{isAr ? "أرباح وعمولة المنصة" : "Platform Revenue"}</span>
            <div className="admin-stat-icon">
              <DollarSign size={22} />
            </div>
          </div>
          <div>
            <div className="admin-stat-value text-[var(--color-primary)]">
              {totalRevenue.toFixed(2)} <span className="text-xs font-normal">SAR</span>
            </div>
            <div className="admin-stat-sub mt-2">
              <span>{isAr ? "صافي الرسوم المحصلة (15%)" : "Net service fee (15%)"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Guides & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Guides Queue (2 Cols) */}
        <div className="lg:col-span-2 admin-card m-0">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-primary)] w-5 h-5" />
              <h3 className="text-lg font-bold m-0">{isAr ? "أحدث المرشدين المسجلين" : "Recent Guide Registrations"}</h3>
            </div>
            <Link 
              href={`/${locale}/admin/guides`} 
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "عرض الكل" : "View All"}</span>
              <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
            </Link>
          </div>

          <div className="space-y-3">
            {(!recentGuides || recentGuides.length === 0) ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">
                {isAr ? "لا يوجد مرشدون مسجلون حالياً" : "No guides registered yet"}
              </p>
            ) : (
              (recentGuides as unknown as RecentGuideItem[]).map((guide) => (
                <div 
                  key={guide.user_id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--background-alt)] border border-[var(--border)] hover:border-[var(--color-primary)] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm">
                      {(guide.profiles?.display_name || "G")[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm m-0 leading-tight">
                        {guide.profiles?.display_name || (isAr ? "مرشد" : "Guide")}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {guide.city || "—"}</span>
                        <span>•</span>
                        <span>{guide.hourly_rate} SAR/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`status-pill ${guide.status}`}>
                      {guide.status === "approved" && (isAr ? "معتمد" : "Approved")}
                      {guide.status === "pending_review" && (isAr ? "بانتظار التدقيق" : "Pending")}
                      {guide.status === "rejected" && (isAr ? "مرفوض" : "Rejected")}
                      {guide.status === "draft" && (isAr ? "مسودة" : "Draft")}
                    </span>
                    <Link
                      href={`/${locale}/admin/guides`}
                      className="p-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition border border-[var(--border)]"
                      title={isAr ? "مراجعة الملف" : "Review"}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Regional Distribution Breakdown (1 Col) */}
        <div className="admin-card m-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[var(--border)]">
              <MapPin className="text-[var(--color-primary)] w-5 h-5" />
              <h3 className="text-lg font-bold m-0">{isAr ? "التوزيع الجغرافي للمرشدين" : "Guides by Destination"}</h3>
            </div>

            {topCities.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">
                {isAr ? "لا توجد بيانات مدن كافية" : "No destination data yet"}
              </p>
            ) : (
              <div className="space-y-4">
                {topCities.map(([cityName, count]) => {
                  const percentage = Math.round((count / (totalGuidesCount || 1)) * 100);
                  return (
                    <div key={cityName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[var(--color-text)]">{cityName}</span>
                        <span className="text-xs text-[var(--muted)]">{count} {isAr ? "مرشد" : "guides"} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--background-alt)] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[var(--color-primary)]" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)] flex items-center justify-between">
            <span>{isAr ? "تغطية الوجهات السياحية" : "National Coverage"}</span>
            <span className="font-semibold text-[var(--color-primary)]">{Object.keys(cityCounts).length} {isAr ? "مدن ومناطق" : "destinations"}</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Stream */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-[var(--color-primary)] w-5 h-5" />
            <h3 className="text-lg font-bold m-0">{isAr ? "أحدث الحجوزات والجولات السياحية" : "Recent Tour Bookings"}</h3>
          </div>
        </div>

        {(!recentBookings || recentBookings.length === 0) ? (
          <p className="text-sm text-[var(--muted)] text-center py-8">
            {isAr ? "لا توجد حجوزات مسجلة بعد" : "No bookings recorded yet"}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{isAr ? "السائح" : "Tourist"}</th>
                  <th>{isAr ? "المرشد" : "Guide"}</th>
                  <th>{isAr ? "تاريخ وموعد الجولة" : "Tour Date"}</th>
                  <th>{isAr ? "القيمة الإجمالية" : "Total Price"}</th>
                  <th>{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {(recentBookings as unknown as RecentBookingItem[]).map((b) => (
                  <tr key={b.id}>
                    <td className="font-semibold">{b.tourist?.display_name || "—"}</td>
                    <td>{b.guide?.display_name || "—"}</td>
                    <td className="text-xs text-[var(--muted)]">
                      {b.start_time ? new Date(b.start_time).toLocaleDateString(locale, { timeZone: "Asia/Riyadh", dateStyle: "medium" }) : "—"}
                    </td>
                    <td className="font-bold text-[var(--color-primary)]">
                      {b.total_price} SAR
                    </td>
                    <td>
                      <span className="status-pill approved">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
