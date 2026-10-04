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
      <header style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/account`} style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary, #0070f3)", textDecoration: "none" }}>
          &larr; {locale === "ar" ? "العودة لحسابي" : "Back to Account"}
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ margin: 0 }}>{bm.bookingReference}: {booking.id.split("-")[0]}</h1>
          <span className={`badge badge-${booking.status}`} style={{ fontSize: "1rem", padding: "8px 16px" }}>
            {bm.status[booking.status as keyof typeof bm.status] || booking.status}
          </span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "4rem" }}>
        
        {booking.is_demo && <section style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card, 12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{dm.title}</h2>
          <p style={{ color: "var(--muted)" }}>{dm.notice}</p>
          {demoPayment && <div style={{ background: "var(--background-alt)", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{dm.summary}</h3>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>{dm.amount}: {demoPayment.amount} · {dm.fee}: {demoPayment.platform_fee} · {dm.guide}: {demoPayment.guide_amount}</p>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>{dm.results[demoPayment.outcome as keyof typeof dm.results]}</p>
            {demoPayment.outcome === "refunded" && <p style={{ margin: 0, fontSize: "0.9rem" }}>{dm.refundedNote}</p>}
          </div>}
          <div style={{ marginTop: "1.5rem" }}>
            {isTourist && booking.status === "awaiting_payment" && <DemoPayment bookingId={id} locale={locale} />}
            {isTourist && demoPayment?.outcome === "success" && booking.status === "confirmed" && <DemoPayment bookingId={id} locale={locale} refund />}
          </div>
        </section>}
        {/* Tour Operations (Only active when confirmed or in_progress) */}
        {chatActive && (
          <section style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card, 12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{locale === "ar" ? "إدارة الجولة" : "Tour Operations"}</h2>
            
            {isTourist && booking.status === "confirmed" && tourCode && (
              <div style={{ padding: "1.5rem", background: "var(--background-alt)", borderRadius: "8px", borderInlineStart: "4px solid var(--primary)", marginBottom: "1.5rem" }}>
                <p style={{ margin: "0 0 1rem 0", fontWeight: "600" }}>{bm.operations?.touristOtpNote}</p>
                <div style={{ fontSize: "2.5rem", letterSpacing: "8px", fontFamily: "monospace", color: "var(--text)" }}>
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
              <div style={{ padding: "1.5rem", background: "var(--background-alt)", borderRadius: "8px", borderInlineStart: "4px solid var(--primary)", marginBottom: "1.5rem" }}>
                <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--primary)" }}>{bm.operations?.tourStarted || "Tour is in progress"}</strong>
                <p style={{ margin: 0, color: "var(--text)" }}>
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
          <section style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card, 12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
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
        <section style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card, 12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{bm.operations?.chat || "Chat"}</h2>
          <div style={{ background: "var(--background-alt)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
            <ChatRoom bookingId={booking.id} userId={user.id} m={bm} active={chatActive} />
          </div>
        </section>

      </div>
    </main>
  );
}
