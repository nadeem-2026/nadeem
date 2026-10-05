import { DemoPayment } from "@/components/demo-payment";
import { demoMessages } from "@/lib/payments/demo";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/auth/server";
import { bookingsMessages } from "@/content/bookings";
import { ChatRoom } from "@/components/chat-room";
import { StartTourForm, EndTourForm } from "@/components/tour-operations";
import { LiveLocationTracker, LiveLocationViewer } from "@/components/live-location";
import { TourFeedback } from "@/components/tour-feedback";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تفاصيل الحجز | نديم" : "Booking Details | Nadeem"
  };
}

export default async function BookingDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const { client, profile, user } = await requireAccount(locale);
  const bm = bookingsMessages(locale);

  // Fetch booking
  const { data: booking, error } = await client
    .from("bookings")
    .select("*, tourist:tourist_id(display_name), guide:guide_id(display_name)")
    .eq("id", id)
    .single();

  if (error || !booking) notFound();

  // Verify participant
  if (booking.tourist_id !== user.id && booking.guide_id !== user.id && profile.role !== "admin") {
    notFound();
  }

  const isGuide = profile.role === "guide" && booking.guide_id === user.id;
  const isTourist = profile.role === "tourist" && booking.tourist_id === user.id;
  
  const { data: tourCode } = isTourist && booking.status === "confirmed"
    ? await client.rpc("get_tour_start_code", { p_booking_id: id }) : { data: null };

  const dm = demoMessages[locale];
  const { data: demoPayment } = booking.is_demo ? await client.from("demo_payments").select("outcome,amount,platform_fee,guide_amount").eq("booking_id", id).maybeSingle() : { data: null };
  const chatActive = booking.status === "confirmed" || booking.status === "in_progress";

  let existingReview = null;
  let existingComplaint = null;

  if (isTourist && (booking.status === "completed" || booking.status === "in_progress")) {
    const [reviewRes, complaintRes] = await Promise.all([
      client.from("reviews").select("*").eq("booking_id", id).maybeSingle(),
      client.from("complaints").select("*").eq("booking_id", id).maybeSingle()
    ]);
    existingReview = reviewRes.data;
    existingComplaint = complaintRes.data;
  }

  return (
    <main id="main-content" className="container" tabIndex={-1}>
      <header className="page-header" style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/account`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: "500" }}>
          &larr; {locale === "ar" ? "العودة لحسابي" : "Back to Account"}
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{bm.bookingReference}: {booking.id.split("-")[0]}</h1>
          <span className={`badge badge-${booking.status}`} style={{ fontSize: "1rem", padding: "8px 16px" }}>
            {bm.status[booking.status as keyof typeof bm.status] || booking.status}
          </span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "4rem" }}>
        
        {booking.is_demo && <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{dm.title}</h2>
          <p style={{ color: "var(--muted)" }}>{dm.notice}</p>
          {demoPayment && <div className="booking-notice">
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>{dm.summary}</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <span className="badge badge-in_progress">{dm.amount}: {demoPayment.amount}</span>
              <span className="badge badge-awaiting_payment">{dm.fee}: {demoPayment.platform_fee}</span>
              <span className="badge badge-confirmed">{dm.guide}: {demoPayment.guide_amount}</span>
            </div>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", fontWeight: "500" }}>{dm.results[demoPayment.outcome as keyof typeof dm.results]}</p>
            {demoPayment.outcome === "refunded" && <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>{dm.refundedNote}</p>}
          </div>}
          <div style={{ marginTop: "1.5rem" }}>
            {isTourist && booking.status === "awaiting_payment" && <DemoPayment bookingId={id} locale={locale} />}
            {isTourist && demoPayment?.outcome === "success" && booking.status === "confirmed" && <DemoPayment bookingId={id} locale={locale} refund />}
          </div>
        </section>}

        {/* Tour Operations (Only active when confirmed or in_progress) */}
        {chatActive && (
          <section className="card">
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{locale === "ar" ? "إدارة الجولة" : "Tour Operations"}</h2>
            
            {isTourist && booking.status === "confirmed" && tourCode && (
              <div className="booking-callout">
                <p style={{ margin: "0 0 1rem 0", fontWeight: "600", color: "var(--color-primary)" }}>{bm.operations?.touristOtpNote}</p>
                <div style={{ fontSize: "2.5rem", letterSpacing: "8px", fontFamily: "monospace", color: "var(--foreground)", background: "var(--color-surface)", padding: "1rem", borderRadius: "8px", display: "inline-block" }}>
                  {tourCode}
                </div>
              </div>
            )}

            {isGuide && booking.status === "confirmed" && (
              <StartTourForm bookingId={booking.id} m={bm} locale={locale} />
            )}

            {isGuide && booking.status === "in_progress" && (
              <EndTourForm bookingId={booking.id} m={bm} locale={locale} />
            )}
            
            {booking.status === "in_progress" && isTourist && (
              <div className="booking-callout">
                <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-primary)" }}>{bm.operations?.tourStarted || "Tour is in progress"}</strong>
                <p style={{ margin: 0, color: "var(--foreground)" }}>
                  {locale === "ar" ? "جولتك بدأت الآن، استمتع بوقتك!" : "Your tour has started, enjoy your time!"}
                </p>
              </div>
            )}

            {isGuide && booking.status === "in_progress" && (
              <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                <LiveLocationTracker bookingId={booking.id} m={bm} />
              </div>
            )}

            {isTourist && booking.status === "in_progress" && (
              <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                <LiveLocationViewer bookingId={booking.id} m={bm} />
              </div>
            )}
          </section>
        )}

        {/* Feedback Section (Only for completed tours) */}
        {isTourist && booking.status === "completed" && (
          <section className="card">
            <TourFeedback 
              bookingId={booking.id} 
              m={bm} 
              locale={locale} 
              existingReview={existingReview} 
              existingComplaint={existingComplaint} 
            />
          </section>
        )}

        {/* Chat Section */}
        <section className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{bm.operations?.chat || "Chat"}</h2>
          <div style={{ background: "var(--background-alt)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
            <ChatRoom bookingId={booking.id} userId={user.id} m={bm} active={chatActive} />
          </div>
        </section>

      </div>
    </main>
  );
}
