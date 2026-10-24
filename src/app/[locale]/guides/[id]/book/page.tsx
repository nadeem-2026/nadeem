import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { authClient } from "@/lib/auth/server";
import { bookingsMessages } from "@/content/bookings";
import { publicGuides } from "@/lib/guides/public";
import { BookingForm } from "@/components/booking-form";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default async function BookGuidePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = bookingsMessages(locale);
  const isAr = locale === "ar";
  const client = await authClient();
  if (!client) throw new Error("Auth client unavailable");

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/guides/${id}/book`);
  }

  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) notFound();

  return (
    <main className="container" id="main-content" tabIndex={-1} style={{ paddingBottom: "4rem", paddingTop: "2rem" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto 1.5rem" }}>
        <Link 
          href={`/${locale}/guides/${id}`} 
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}
        >
          {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{m.backToGuide}</span>
        </Link>
      </div>

      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 className="hero-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{m.bookTitle}</h1>
        <p className="hero-description" style={{ margin: 0, fontSize: "1rem" }}>
          {isAr ? "حدد موعد وتفاصيل جولتك السياحية المخصصة" : "Set your custom tour date and preferences"}
        </p>
      </header>

      <BookingForm 
        guide={profile}
        guideId={profile.id}
        hourlyRate={profile.hourly_rate} 
        m={m} 
        locale={locale} 
      />
    </main>
  );
}
