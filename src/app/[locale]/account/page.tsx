import type { Booking, Earning } from "@/lib/bookings/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/auth/server";
import { signOut } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import { bookingsMessages } from "@/content/bookings";
import { GuideForm, AvailabilityForm, ExceptionsForm, type GuideProfile, type DayAvailability, type AvailabilityException } from "@/components/auth-forms";
import { BookingsList } from "@/components/bookings-list";
import { EarningsSummary } from "@/components/earnings-summary";
import { AccountTabs } from "@/components/account-tabs";
import { 
  User, 
  CalendarDays, 
  Clock, 
  Calendar, 
  Wallet, 
  ShieldAlert, 
  Shield, 
  LogOut, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft 
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "حسابي | نديم" : "My Account | Nadeem",
    description: locale === "ar" ? "إدارة حسابك الشخصي وحجوزاتك في منصة نديم" : "Manage your Nadeem personal account and bookings",
    robots: { index: false, follow: false }
  };
}

export default async function Account({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { client, profile, user } = await requireAccount(locale);
  const m = authMessages(locale);
  let guide: GuideProfile | null = null;
  let availability: DayAvailability[] = [];
  let exceptions: AvailabilityException[] = [];
  if (profile.role === "guide") {
    const { data, error } = await client.from("guide_profiles").select("user_id, city, bio, languages, service_areas, hourly_rate, max_participants, inclusions, status, review_reason").eq("user_id", profile.id).single<GuideProfile>();
    if (error) throw new Error("Guide profile could not be loaded");
    guide = data;
    const { data: avData, error: avError } = await client.from("guide_availability_weekly").select("day_of_week, start_time, end_time").eq("guide_id", profile.id);
    if (!avError && avData) availability = avData;
    const { data: exData, error: exError } = await client.from("guide_availability_exceptions").select("id, exception_date, is_available, start_time, end_time").eq("guide_id", profile.id).order("exception_date", { ascending: true });
    if (!exError && exData) exceptions = exData;
  }

  // Fetch bookings and earnings based on role
  let bookings: Booking[] = [];
  let earnings: Earning[] = [];
  if (profile.role === "guide") {
    const { data } = await client
      .from("bookings")
      .select("*, tourist:tourist_id(display_name)")
      .eq("guide_id", profile.id)
      .order("start_time", { ascending: false });
    if (data) bookings = data;

    const { data: earningsData } = await client
      .from("guide_earnings")
      .select("*")
      .eq("guide_id", profile.id)
      .order("created_at", { ascending: false });
    if (earningsData) earnings = earningsData;
  } else if (profile.role === "tourist") {
    const { data } = await client
      .from("bookings")
      .select("*, guide:guide_id(display_name)")
      .eq("tourist_id", profile.id)
      .order("start_time", { ascending: false });
    if (data) bookings = data;
  }

  const bm = bookingsMessages(locale);
  const isAr = locale === "ar";

  // Calculations for quick metrics
  const totalBookingsCount = bookings.length;
  const pendingCount = profile.role === "guide" 
    ? bookings.filter(b => b.status === "pending").length
    : bookings.filter(b => b.status === "awaiting_payment").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed" || b.status === "in_progress").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const availableEarnings = profile.role === "guide" 
    ? earnings.filter(e => e.status === "available").reduce((acc, e) => acc + Number(e.guide_amount), 0)
    : undefined;

  const profileContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Account Info & Stats Grid */}
      <div className="dashboard-card">
        <h2>
          <User className="w-5 h-5 text-emerald-800" />
          {isAr ? "بيانات الحساب الشخصي" : "Personal Account Details"}
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ padding: "16px", background: "var(--background-alt)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: "4px" }}>
              {m.name || (isAr ? "الاسم الكامل" : "Full Name")}
            </span>
            <strong style={{ fontSize: "1.05rem", color: "var(--color-text)" }}>
              {profile.display_name || "—"}
            </strong>
          </div>

          <div style={{ padding: "16px", background: "var(--background-alt)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: "4px" }}>
              {m.email || (isAr ? "البريد الإلكتروني" : "Email Address")}
            </span>
            <strong style={{ fontSize: "1rem", color: "var(--color-text)" }}>
              {user.email || "—"}
            </strong>
          </div>

          <div style={{ padding: "16px", background: "var(--background-alt)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: "4px" }}>
              {m.role || (isAr ? "نوع الحساب" : "Account Role")}
            </span>
            <span className="badge-status badge-status-completed" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
              {m[profile.role]}
            </span>
          </div>

          <div style={{ padding: "16px", background: "var(--background-alt)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: "4px" }}>
              {isAr ? "حالة الحساب" : "Account Status"}
            </span>
            <span className="badge-status badge-status-confirmed" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isAr ? "نشط ومفعل" : "Active"}
            </span>
          </div>
        </div>

        {/* Quick Stats overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center", padding: "14px", background: "rgba(14, 53, 38, 0.03)", borderRadius: "12px", border: "1px solid rgba(14, 53, 38, 0.08)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>{totalBookingsCount}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
              {isAr ? "إجمالي الحجوزات" : "Total Bookings"}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "14px", background: "rgba(16, 185, 129, 0.04)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#065f46" }}>{confirmedCount}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
              {isAr ? "رحلات مؤكدة / حالية" : "Confirmed / Active"}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "14px", background: "rgba(245, 158, 11, 0.04)", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#92400e" }}>{pendingCount}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
              {isAr ? "بانتظار الإجراء" : "Action Required"}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "14px", background: "rgba(14, 53, 38, 0.04)", borderRadius: "12px", border: "1px solid rgba(14, 53, 38, 0.1)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>{completedCount}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
              {isAr ? "رحلات مكتملة" : "Completed Tours"}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Session Card */}
      <div className="dashboard-card">
        <h2>
          <Shield className="w-5 h-5 text-emerald-800" />
          {isAr ? "الأمان وإدارة الجلسة" : "Security & Session"}
        </h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <strong style={{ display: "block", color: "var(--color-text)", marginBottom: "4px" }}>
              {isAr ? "تسجيل الخروج من الحساب" : "Sign Out of Account"}
            </strong>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "إنهاء الجلسة الحالية والعودة إلى الصفحة الرئيسية." : "End current session and return to homepage."}
            </p>
          </div>

          <form action={signOut.bind(null, locale)}>
            <button 
              className="button" 
              type="submit"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--error, #dc2626)", borderColor: "rgba(220, 38, 38, 0.3)" }}
            >
              <LogOut className="w-4 h-4" />
              {m.logout || (isAr ? "تسجيل الخروج" : "Sign Out")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const guideContent = guide ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <GuideForm locale={locale} name={profile.display_name} guide={guide} />
      <div className="dashboard-card">
        <h2>
          <Clock className="w-5 h-5 text-emerald-800" />
          {m.availability}
        </h2>
        <AvailabilityForm locale={locale} availability={availability} />
      </div>
      <div className="dashboard-card">
        <h2>
          <Calendar className="w-5 h-5 text-emerald-800" />
          {m.exceptions}
        </h2>
        <ExceptionsForm locale={locale} exceptions={exceptions} />
      </div>
    </div>
  ) : undefined;

  const bookingsContent = (profile.role === "tourist" || profile.role === "guide") ? (
    <div className="dashboard-card">
      <h2>
        <CalendarDays className="w-5 h-5 text-emerald-800" />
        {isAr ? "سجل الحجوزات والرحلات" : "Bookings & Trips"}
      </h2>
      <BookingsList bookings={bookings} role={profile.role} m={bm} locale={locale} />
    </div>
  ) : undefined;

  const earningsContent = profile.role === "guide" ? (
    <div className="dashboard-card">
      <h2>
        <Wallet className="w-5 h-5 text-emerald-800" />
        {isAr ? "المحفظة والأرباح المالية" : "Financial Wallet & Earnings"}
      </h2>
      <EarningsSummary earnings={earnings} m={bm} />
    </div>
  ) : undefined;

  const adminContent = profile.role === "admin" ? (
    <div className="dashboard-card">
      <h2>
        <ShieldAlert className="w-5 h-5 text-emerald-800" />
        {isAr ? "لوحة الإدارة والإشراف" : "Administration Portal"}
      </h2>
      <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
        {isAr 
          ? "لديك صلاحيات إدارة النظام لمراجعة وتدقيق ملفات المرشدين، والشكاوى، ومراقبة العمليات المالية."
          : "You have full administrator privileges to review guides, handle disputes, and oversee transactions."}
      </p>
      <Link className="button button-primary" href={`/${locale}/admin`} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        {isAr ? "الانتقال إلى لوحة تحكم الإدارة" : "Open Admin Dashboard"}
        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </Link>
    </div>
  ) : undefined;

  return (
    <main id="main-content" className="container account-page" tabIndex={-1}>
      <AccountTabs 
        locale={locale} 
        role={profile.role} 
        userName={profile.display_name}
        userEmail={user.email}
        guideCity={guide?.city}
        pendingActionCount={pendingCount}
        confirmedCount={confirmedCount}
        availableEarnings={availableEarnings}
        profileContent={profileContent} 
        bookingsContent={bookingsContent}
        guideContent={guideContent}
        earningsContent={earningsContent}
        adminContent={adminContent}
      />
    </main>
  );
}
