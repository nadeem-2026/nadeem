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
        <h1>{bm.bookingReference}: {booking.id.split("-")[0]}</h1>
        <p style={{ fontSize: "1.1rem" }}>
          {locale === "ar" ? "حالة الحجز:" : "Status:"} <strong>{bm.status[booking.status as keyof typeof bm.status] || booking.status}</strong>
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginBottom: "3rem" }}>
        
        {/* Tour Operations (Only active when confirmed or in_progress) */}
        {chatActive && (
          <section style={{ padding: "1.5rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px" }}>
            <h2 style={{ marginBottom: "1rem" }}>{locale === "ar" ? "إدارة الجولة" : "Tour Operations"}</h2>
            
            {isTourist && booking.status === "confirmed" && tourCode && (
              <div style={{ padding: "1rem", background: "#e2e3e5", borderRadius: "8px", borderLeft: "4px solid #383d41", marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>{bm.operations?.touristOtpNote}</p>
                <div style={{ fontSize: "2rem", letterSpacing: "5px", fontFamily: "monospace", color: "#383d41" }}>
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
              <div style={{ padding: "1rem", background: "#d4edda", color: "#155724", borderRadius: "8px" }}>
                {bm.operations?.tourStarted || "Tour is in progress"}
              </div>
            )}

            {isGuide && booking.status === "in_progress" && (
              <LiveLocationTracker bookingId={booking.id} m={bm} />
            )}

            {isTourist && booking.status === "in_progress" && (
              <LiveLocationViewer bookingId={booking.id} m={bm} />
            )}
          </section>
        )}

        {/* Feedback Section (Only for completed tours) */}
        {isTourist && booking.status === "completed" && (
          <section>
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
        <section>
          <h2 style={{ marginBottom: "1rem" }}>{bm.operations?.chat || "Chat"}</h2>
          <ChatRoom bookingId={booking.id} userId={user.id} m={bm} active={chatActive} />
        </section>

      </div>
    </main>
  );
}
