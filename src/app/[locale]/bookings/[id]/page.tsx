import { DemoPayment } from "@/components/demo-payment";
import { demoMessages } from "@/lib/payments/demo";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { requireAccount } from "@/lib/auth/server";
import { bookingsMessages } from "@/content/bookings";
import { ChatRoom } from "@/components/chat-room";
import { StartTourForm, EndTourForm } from "@/components/tour-operations";
import { LiveLocationTracker, LiveLocationViewer } from "@/components/live-location";
import { TourFeedback } from "@/components/tour-feedback";
import { TourStatusStepper } from "@/components/tour-status-stepper";
import { LiveTourTimer } from "@/components/live-tour-timer";
import { EmergencySosCard } from "@/components/emergency-sos-card";
import { TourQuickActions } from "@/components/tour-quick-actions";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, Clock, MapPin, Users, DollarSign, ShieldCheck, 
  ArrowRight, ArrowLeft, KeyRound, Sparkles, Info, Compass, CheckCircle2 
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تفاصيل ومتابعة الحجز | نديم" : "Tour Tracking & Booking Details | Nadeem",
    robots: { index: false, follow: false }
  };
}

export default async function BookingDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const { client, profile, user } = await requireAccount(locale);
  const bm = bookingsMessages(locale);
  const isAr = locale === "ar";

  // Fetch booking with tourist and guide basic relations
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
  
  // Fetch tour start OTP code for tourist when confirmed
  const { data: tourCode } = isTourist && booking.status === "confirmed"
    ? await client.rpc("get_tour_start_code", { p_booking_id: id }) : { data: null };

  // Fetch guide profile details (photo, city, rate, areas)
  const { data: guideProfile } = await client
    .from("guide_profiles")
    .select("city, hourly_rate, languages, service_areas, personal_photo_url")
    .eq("user_id", booking.guide_id)
    .maybeSingle();

  const dm = demoMessages[locale];
  const { data: demoPayment } = booking.is_demo 
    ? await client.from("demo_payments").select("outcome,amount,platform_fee,guide_amount").eq("booking_id", id).maybeSingle() 
    : { data: null };
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

  const { data: touristProfile } = (isGuide || profile.role === "admin")
    ? await client.from("tourist_profiles").select("*").eq("user_id", booking.tourist_id).maybeSingle()
    : { data: null };

  // Date and Time calculations
  const startDate = new Date(booking.start_time);
  const durationHours = booking.duration_hours || 2;
  const endDate = booking.end_time 
    ? new Date(booking.end_time) 
    : new Date(startDate.getTime() + durationHours * 3600000);

  const dateFormatted = startDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTimeFormatted = startDate.toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTimeFormatted = endDate.toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract clean meeting point and special requests if separated by '|'
  const [meetingLocation, specialNotes] = (booking.meeting_point || "")
    .split("|")
    .map((s: string) => s.trim());

  return (
    <main id="main-content" className="container" tabIndex={-1} style={{ maxWidth: "1100px", paddingBottom: "5rem" }}>
      {/* Back button & Header */}
      <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }} className="print:hidden">
        <Link 
          href={`/${locale}/account`} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: "var(--color-primary)", 
            textDecoration: "none", 
            fontWeight: "600",
            fontSize: "0.9rem" 
          }}
        >
          {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span>{isAr ? "العودة لحسابي وحجوزاتي" : "Back to My Account"}</span>
        </Link>
      </div>

      <header className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", width: "100%" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{bm.bookingReference}</span>
              <span style={{ fontFamily: "monospace", fontWeight: "bold", background: "var(--background-alt)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.95rem" }}>
                #{booking.id.split("-")[0].toUpperCase()}
              </span>
            </div>
            <h1 style={{ margin: "4px 0", fontSize: "1.75rem", fontWeight: "800", color: "var(--foreground)" }}>
              {isAr ? "متابعة وإدارة الجولة السياحية" : "Tour Tracking & Management"}
            </h1>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "تاريخ تقديم الطلب:" : "Requested on:"} {new Date(booking.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <span className={`badge badge-${booking.status}`} style={{ fontSize: "0.95rem", padding: "8px 18px", borderRadius: "999px", fontWeight: "700" }}>
              {bm.status[booking.status as keyof typeof bm.status] || booking.status}
            </span>
            <TourQuickActions meetingPoint={meetingLocation || ""} tourCode={tourCode} locale={locale} />
          </div>
        </div>
      </header>

      {/* Status Progress Stepper */}
      <section style={{ marginBottom: "1.5rem" }}>
        <TourStatusStepper status={booking.status} locale={locale} />
      </section>

      {/* Live Tour Active Timer Banner (when tour is in progress) */}
      {booking.status === "in_progress" && (
        <section style={{ marginBottom: "1.5rem" }}>
          <LiveTourTimer startTime={booking.start_time} durationHours={durationHours} locale={locale} />
        </section>
      )}

      {/* Tourist OTP Security Voucher (When confirmed) */}
      {isTourist && booking.status === "confirmed" && tourCode && (
        <section 
          className="card" 
          style={{ 
            marginBottom: "1.5rem", 
            border: "2px dashed var(--color-primary)", 
            background: "linear-gradient(135deg, rgba(14, 53, 38, 0.04) 0%, rgba(197, 160, 89, 0.08) 100%)",
            borderRadius: "20px",
            padding: "1.75rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ maxWidth: "600px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)", marginBottom: "6px" }}>
                <KeyRound size={22} />
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800" }}>
                  {isAr ? "رمز التحقق الميداني لبدء الجولة (OTP)" : "Field Tour Start Pass (OTP)"}
                </h2>
              </div>
              <p style={{ margin: "4px 0 12px 0", fontSize: "0.88rem", color: "var(--muted)", lineHeight: "1.6" }}>
                {isAr 
                  ? "هذا الرمز هو ضمانتك المالية. اعرضه للمرشد عند نقطة اللقاء فقط ليتمكن من التحقق وبدء الجولة رسمياً عبر المنصة." 
                  : "This code protects your escrow. Present it to the guide only at the meeting point to verify and officially start the tour."}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600" }}>
                <ShieldCheck size={16} />
                <span>{isAr ? "مبلغ الجولة محفوظ ومحمي بنظام الضمان" : "Tour funds secured in escrow"}</span>
              </div>
            </div>

            <div style={{ textAlign: "center", alignSelf: "center" }}>
              <div 
                style={{ 
                  fontSize: "2.6rem", 
                  letterSpacing: "8px", 
                  fontFamily: "monospace", 
                  fontWeight: "900", 
                  color: "var(--foreground)", 
                  background: "var(--color-surface)", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "14px", 
                  border: "2px solid var(--border)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  display: "inline-block" 
                }}
              >
                {tourCode}
              </div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginTop: "6px" }}>
                {isAr ? "صالح لجولة اليوم فقط" : "Valid for today's tour only"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Tour Summary Details + Operational Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        
        {/* Tour Overview Snapshot Card */}
        <section className="card" style={{ padding: "1.5rem", borderRadius: "18px" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={20} className="text-[var(--color-primary)]" />
            <span>{isAr ? "بيانات وتفاصيل الرحلة" : "Tour & Booking Overview"}</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {/* Date & Day */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(14, 53, 38, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0 }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{bm.dateLabel}</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--foreground)" }}>{dateFormatted}</strong>
              </div>
            </div>

            {/* Time & Duration */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(14, 53, 38, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "التوقيت والمدة" : "Time & Duration"}</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--foreground)" }}>
                  {startTimeFormatted} - {endTimeFormatted} ({durationHours} {isAr ? "ساعات" : "hours"})
                </strong>
              </div>
            </div>

            {/* Participants */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(14, 53, 38, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{bm.participantsLabel}</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--foreground)" }}>
                  {booking.participants} {isAr ? "أشخاص" : "guests"}
                </strong>
              </div>
            </div>

            {/* Total Price & Escrow */}
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(197, 160, 89, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309", flexShrink: 0 }}>
                <DollarSign size={20} />
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{bm.totalPrice}</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--color-primary)", fontWeight: "800" }}>
                  {booking.total_price} {isAr ? "ريال" : "SAR"}
                </strong>
              </div>
            </div>
          </div>

          {/* Meeting Point Box */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(220, 38, 38, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{bm.meetingPointLabel}</span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingLocation || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "underline", fontWeight: "600" }}
                  >
                    {isAr ? "عرض الموقع في خرائط Google" : "View on Google Maps"} &rarr;
                  </a>
                </div>
                <strong style={{ fontSize: "1rem", color: "var(--foreground)", display: "block", marginTop: "2px" }}>
                  {meetingLocation || (isAr ? "سيتم التنسيق في المحادثة" : "To be coordinated in chat")}
                </strong>
                {specialNotes && (
                  <p style={{ margin: "6px 0 0 0", fontSize: "0.82rem", color: "var(--muted)", background: "var(--background-alt)", padding: "6px 12px", borderRadius: "8px" }}>
                    <strong>{isAr ? "ملاحظات إضافية:" : "Notes:"}</strong> {specialNotes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guide Snapshot details */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {guideProfile?.personal_photo_url ? (
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", position: "relative", border: "2px solid var(--color-primary)" }}>
                  <Image 
                    src={guideProfile.personal_photo_url} 
                    alt={booking.guide?.display_name || "Guide"} 
                    fill 
                    style={{ objectFit: "cover" }} 
                  />
                </div>
              ) : (
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                  {(booking.guide?.display_name || "G")[0]}
                </div>
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{booking.guide?.display_name || (isAr ? "المرشد السياحي" : "Tour Guide")}</strong>
                  <span className="badge" style={{ background: "rgba(14, 53, 38, 0.08)", color: "var(--color-primary)", fontSize: "0.7rem", padding: "2px 6px" }}>
                    {isAr ? "مرشد مرخص ✓" : "Certified ✓"}
                  </span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
                  {guideProfile?.city ? `${guideProfile.city}` : ""} 
                  {guideProfile?.languages && guideProfile.languages.length > 0 ? ` • ${guideProfile.languages.join(", ")}` : ""}
                </span>
              </div>
            </div>

            <Link 
              href={`/${locale}/guides/${booking.guide_id}`} 
              target="_blank"
              className="button button-outline text-xs" 
              style={{ padding: "6px 14px", textDecoration: "none" }}
            >
              {isAr ? "الملف التعريفي للمرشد" : "View Guide Profile"}
            </Link>
          </div>
        </section>

        {/* Emergency SOS & Safety Services Card */}
        <EmergencySosCard 
          locale={locale} 
          touristEmergencyName={touristProfile?.emergency_contact_name} 
          touristEmergencyPhone={touristProfile?.emergency_contact_phone} 
        />

        {/* Academic / Demo Payment Card */}
        {booking.is_demo && (
          <section className="card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem" }}>{dm.title}</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{dm.notice}</p>
            {demoPayment && (
              <div className="booking-notice" style={{ marginTop: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{dm.summary}</h3>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <span className="badge badge-in_progress">{dm.amount}: {demoPayment.amount}</span>
                  <span className="badge badge-awaiting_payment">{dm.fee}: {demoPayment.platform_fee}</span>
                  <span className="badge badge-confirmed">{dm.guide}: {demoPayment.guide_amount}</span>
                </div>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.92rem", fontWeight: "600" }}>{dm.results[demoPayment.outcome as keyof typeof dm.results]}</p>
                {demoPayment.outcome === "refunded" && <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>{dm.refundedNote}</p>}
              </div>
            )}
            <div style={{ marginTop: "1.25rem" }}>
              {isTourist && booking.status === "awaiting_payment" && <DemoPayment bookingId={id} locale={locale} />}
              {isTourist && demoPayment?.outcome === "success" && booking.status === "confirmed" && <DemoPayment bookingId={id} locale={locale} refund />}
            </div>
          </section>
        )}

        {/* Tourist Profile & Care Summary for Guide/Admin */}
        {(isGuide || profile.role === "admin") && touristProfile && (
          <section className="card" style={{ border: "1px solid rgba(14, 53, 38, 0.15)", background: "linear-gradient(135deg, rgba(14, 53, 38, 0.02) 0%, rgba(197, 160, 89, 0.05) 100%)" }}>
            <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🎒</span>
              {isAr ? "تفضيلات ورعاية السائح" : "Tourist Preferences & Care"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {touristProfile.phone_number && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "رقم الاتصال / واتساب" : "Contact / WhatsApp"}</span>
                  <strong dir="ltr" style={{ fontSize: "0.95rem" }}>{touristProfile.phone_number}</strong>
                </div>
              )}
              {touristProfile.nationality && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "الجنسية" : "Nationality"}</span>
                  <strong style={{ fontSize: "0.95rem" }}>{touristProfile.nationality}</strong>
                </div>
              )}
              {touristProfile.travel_style && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "نمط الرحلة" : "Travel Style"}</span>
                  <strong style={{ fontSize: "0.95rem" }}>
                    {touristProfile.travel_style === "family" ? (isAr ? "عائلي مع أطفال" : "Family with kids") :
                     touristProfile.travel_style === "couples" ? (isAr ? "أزواج" : "Couples") :
                     touristProfile.travel_style === "friends" ? (isAr ? "مجموعة أصدقاء" : "Friends") :
                     (isAr ? "مسافر فردي" : "Solo Traveler")}
                  </strong>
                </div>
              )}
              {touristProfile.dietary_requirements && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "القيود والحساسية الغذائية" : "Dietary Restrictions"}</span>
                  <strong style={{ fontSize: "0.95rem", color: "#b45309" }}>{touristProfile.dietary_requirements}</strong>
                </div>
              )}
              {touristProfile.mobility_needs && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "الاحتياجات الحركية الخاصة" : "Mobility Needs"}</span>
                  <strong style={{ fontSize: "0.95rem" }}>{touristProfile.mobility_needs}</strong>
                </div>
              )}
              {touristProfile.emergency_contact_phone && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>{isAr ? "جهة اتصال للطوارئ" : "Emergency Contact"}</span>
                  <strong dir="ltr" style={{ fontSize: "0.95rem" }}>{touristProfile.emergency_contact_name ? `${touristProfile.emergency_contact_name}: ` : ""}{touristProfile.emergency_contact_phone}</strong>
                </div>
              )}
            </div>
            {touristProfile.interests && touristProfile.interests.length > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: "6px" }}>{isAr ? "الاهتمامات السياحية" : "Tour Interests"}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {touristProfile.interests.map((it: string) => (
                    <span key={it} className="badge" style={{ background: "rgba(14, 53, 38, 0.08)", color: "var(--color-primary)", fontWeight: 500 }}>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tour Operations (Active when confirmed or in_progress) */}
        {chatActive && (
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={20} className="text-[var(--color-primary)]" />
              <span>{isAr ? "إجراءات وتشغيل الجولة الميدانية" : "Field Operations & Tracking"}</span>
            </h2>
            
            {/* Guide: OTP Verification Form */}
            {isGuide && booking.status === "confirmed" && (
              <StartTourForm bookingId={booking.id} m={bm} locale={locale} />
            )}

            {/* Guide: End Tour Confirmation */}
            {isGuide && booking.status === "in_progress" && (
              <EndTourForm bookingId={booking.id} m={bm} locale={locale} />
            )}
            
            {/* Tourist message when in progress */}
            {booking.status === "in_progress" && isTourist && (
              <div className="booking-callout" style={{ marginBottom: "1.5rem" }}>
                <strong style={{ display: "block", marginBottom: "0.35rem", color: "var(--color-primary)" }}>
                  {bm.operations?.tourStarted || "Tour is in progress"}
                </strong>
                <p style={{ margin: 0, color: "var(--foreground)", fontSize: "0.88rem" }}>
                  {isAr ? "جولتك بدأت الآن بنجاح! استمتع بوقتك وتواصل مع المرشد مباشرة في أي وقت." : "Your tour is officially in progress! Enjoy your time."}
                </p>
              </div>
            )}

            {/* Live Location Sharing & Viewer */}
            {isGuide && booking.status === "in_progress" && (
              <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                <LiveLocationTracker bookingId={booking.id} m={bm} />
              </div>
            )}

            {isTourist && booking.status === "in_progress" && (
              <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                <LiveLocationViewer bookingId={booking.id} m={bm} />
              </div>
            )}
          </section>
        )}

        {/* Feedback Section (For completed tours) */}
        {isTourist && booking.status === "completed" && (
          <section className="card" style={{ padding: "1.5rem" }}>
            <TourFeedback 
              bookingId={booking.id} 
              m={bm} 
              locale={locale} 
              existingReview={existingReview} 
              existingComplaint={existingComplaint} 
            />
          </section>
        )}

        {/* Direct Chat Room */}
        <section className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
              {bm.operations?.chat || (isAr ? "محادثة الجولة الفورية" : "Tour Live Chat")}
            </h2>
            <span style={{ fontSize: "0.75rem", color: chatActive ? "var(--color-primary)" : "var(--muted)", fontWeight: "600" }}>
              {chatActive 
                ? (isAr ? "المحادثة نشطة ومباشرة" : "Chat is active") 
                : (isAr ? "المحادثة مقفلة" : "Chat closed")}
            </span>
          </div>
          <div style={{ background: "var(--background-alt)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border)" }}>
            <ChatRoom bookingId={booking.id} userId={user.id} m={bm} active={chatActive} />
          </div>
        </section>

      </div>
    </main>
  );
}

