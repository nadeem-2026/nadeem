import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { authClient } from "@/lib/auth/server";
import { bookingsMessages } from "@/content/bookings";
import { BookingForm } from "@/components/booking-form";

export default async function BookGuidePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = bookingsMessages(locale);
  const client = await authClient();
  if (!client) throw new Error("Auth client unavailable");

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/guides/${id}/book`);
  }

  // Fetch the guide profile
  const { data: profile, error } = await client
    .from("profiles")
    .select("id, display_name, guide_profiles!inner(hourly_rate, status, max_participants)")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const gp = Array.isArray(profile.guide_profiles) ? profile.guide_profiles[0] : profile.guide_profiles;
  
  if (gp.status !== "approved") {
    notFound();
  }

  return (
    <main className="container" id="main-content" tabIndex={-1}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/guides/${id}`} style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary, #0070f3)", textDecoration: "none" }}>
          &larr; {m.backToGuide}
        </Link>
      </div>

      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="hero-title">{m.bookTitle}</h1>
        <p className="hero-description">{m.guideName} <strong>{profile.display_name}</strong></p>
      </header>

      <BookingForm 
        guideId={profile.id} 
        hourlyRate={gp.hourly_rate} 
        m={m} 
        locale={locale} 
      />
    </main>
  );
}
