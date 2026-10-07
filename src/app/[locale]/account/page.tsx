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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "حسابي | نديم" : "My Account | Nadeem"
  };
}

export default async function Account({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { client, profile } = await requireAccount(locale);
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

  const profileContent = (
    <div className="dashboard-card">
      <h2 style={{ marginBottom: "8px" }}>{profile.display_name || m.account}</h2>
      <p style={{ color: "var(--muted)", marginBottom: "32px", fontSize: "0.95rem" }}>{m.role}: {m[profile.role]}</p>
      
      <form action={signOut.bind(null, locale)}>
        <button className="button" type="submit">{m.logout}</button>
      </form>
    </div>
  );

  const guideContent = guide ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="dashboard-card"><h2>{m.profile}</h2><GuideForm locale={locale} name={profile.display_name} guide={guide} /></div>
      <div className="dashboard-card"><h2>{m.availability}</h2><AvailabilityForm locale={locale} availability={availability} /></div>
      <div className="dashboard-card"><h2>{m.exceptions}</h2><ExceptionsForm locale={locale} exceptions={exceptions} /></div>
    </div>
  ) : undefined;

  const bookingsContent = (profile.role === "tourist" || profile.role === "guide") ? (
    <div className="dashboard-card">
      <h2>{locale === "ar" ? "الحجوزات" : "Bookings"}</h2>
      <BookingsList bookings={bookings} role={profile.role} m={bm} locale={locale} />
    </div>
  ) : undefined;

  const earningsContent = profile.role === "guide" ? (
    <div className="dashboard-card">
      <h2>{locale === "ar" ? "الأرباح" : "Earnings"}</h2>
      <EarningsSummary earnings={earnings} m={bm} />
    </div>
  ) : undefined;

  const adminContent = profile.role === "admin" ? (
    <div className="dashboard-card">
      <h2>{locale === "ar" ? "الإدارة" : "Administration"}</h2>
      <Link className="button button-primary" href={`/${locale}/admin`}>
        {locale === "ar" ? "الدخول إلى لوحة التحكم" : "Go to Admin Dashboard"}
      </Link>
    </div>
  ) : undefined;

  return (
    <main id="main-content" className="container account-page" tabIndex={-1}>
      <AccountTabs 
        locale={locale as any} 
        role={profile.role} 
        profileContent={profileContent} 
        bookingsContent={bookingsContent}
        guideContent={guideContent}
        earningsContent={earningsContent}
        adminContent={adminContent}
      />
    </main>
  );
}
