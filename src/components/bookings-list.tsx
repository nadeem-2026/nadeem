"use client";

import { DemoPayment } from "./demo-payment";
import type { BookingMessages, Booking } from "@/lib/bookings/types";
import { useTransition, useState, useMemo } from "react";
import { updateBookingStatus } from "@/lib/bookings/actions";
import { createPaymentCharge } from "@/lib/payments/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Coins,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  CreditCard,
  Compass,
  CalendarX2,
  ExternalLink
} from "lucide-react";

export function BookingsList({
  bookings,
  role,
  m,
  locale
}: {
  bookings: Booking[];
  role: "guide" | "tourist";
  m: BookingMessages;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "action" | "confirmed" | "completed" | "cancelled">("all");
  const isAr = locale === "ar";

  const handleStatusChange = (bookingId: string, status: string) => {
    if (!confirm(m.confirmAction || (isAr ? "هل أنت متأكد من هذا الإجراء؟" : "Are you sure?"))) return;

    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, status);
      if (!res.success) {
        alert(res.message);
      }
    });
  };

  const handlePayment = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const res = await createPaymentCharge(bookingId, locale);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert(res.message || (isAr ? "فشل بدء عملية الدفع" : "Payment initiation failed"));
        setPayingId(null);
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
      setPayingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (filter === "all") return bookings;
    if (filter === "action") {
      return bookings.filter(b => b.status === "pending" || b.status === "awaiting_payment");
    }
    if (filter === "confirmed") {
      return bookings.filter(b => b.status === "confirmed" || b.status === "in_progress");
    }
    if (filter === "completed") {
      return bookings.filter(b => b.status === "completed");
    }
    if (filter === "cancelled") {
      return bookings.filter(b => b.status === "cancelled" || b.status === "declined" || b.status === "expired");
    }
    return bookings;
  }, [bookings, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="badge-status badge-status-confirmed">
            <CheckCircle2 className="w-4 h-4" />
            {m.status?.confirmed || (isAr ? "مؤكد" : "Confirmed")}
          </span>
        );
      case "in_progress":
        return (
          <span className="badge-status badge-status-in_progress">
            <Clock className="w-4 h-4 animate-spin" />
            {m.status?.in_progress || (isAr ? "قيد التنفيذ" : "In Progress")}
          </span>
        );
      case "awaiting_payment":
        return (
          <span className="badge-status badge-status-awaiting_payment">
            <CreditCard className="w-4 h-4" />
            {m.status?.awaiting_payment || (isAr ? "بانتظار الدفع" : "Awaiting Payment")}
          </span>
        );
      case "pending":
        return (
          <span className="badge-status badge-status-pending">
            <AlertCircle className="w-4 h-4" />
            {m.status?.pending || (isAr ? "قيد المراجعة" : "Pending")}
          </span>
        );
      case "completed":
        return (
          <span className="badge-status badge-status-completed">
            <CheckCircle2 className="w-4 h-4" />
            {m.status?.completed || (isAr ? "مكتمل" : "Completed")}
          </span>
        );
      case "cancelled":
      case "declined":
      case "expired":
        return (
          <span className="badge-status badge-status-cancelled">
            <XCircle className="w-4 h-4" />
            {m.status?.[status as keyof typeof m.status] || status}
          </span>
        );
      default:
        return (
          <span className="badge-status badge-status-pending">
            {status}
          </span>
        );
    }
  };

  const filterOptions = [
    { id: "all" as const, label: isAr ? "جميع الرحلات" : "All Bookings", count: bookings.length },
    { 
      id: "action" as const, 
      label: isAr ? "تتطلب إجراء" : "Action Required", 
      count: bookings.filter(b => b.status === "pending" || b.status === "awaiting_payment").length 
    },
    { 
      id: "confirmed" as const, 
      label: isAr ? "المؤكدة والقادمة" : "Confirmed & Upcoming", 
      count: bookings.filter(b => b.status === "confirmed" || b.status === "in_progress").length 
    },
    { 
      id: "completed" as const, 
      label: isAr ? "المكتملة" : "Completed", 
      count: bookings.filter(b => b.status === "completed").length 
    },
    { 
      id: "cancelled" as const, 
      label: isAr ? "الملغية" : "Cancelled", 
      count: bookings.filter(b => b.status === "cancelled" || b.status === "declined" || b.status === "expired").length 
    }
  ];

  return (
    <div>
      {/* Filter Chips */}
      <div className="filter-chips-row" role="tablist" aria-label={isAr ? "تصفية الحجوزات" : "Filter bookings"}>
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`filter-chip ${filter === opt.id ? "active" : ""}`}
            role="tab"
            aria-selected={filter === opt.id}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          background: "var(--background-alt)",
          borderRadius: "var(--radius-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          <CalendarX2 className="w-12 h-12 text-muted" style={{ opacity: 0.5 }} />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--color-text)" }}>
              {isAr ? "لا توجد حجوزات ضمن هذا التصنيف" : "No bookings found in this category"}
            </h3>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>
              {isAr 
                ? "يمكنك استكشاف المرشدين واختيار جولة جديدة في أي وقت." 
                : "You can explore available guides and discover new tours anytime."}
            </p>
          </div>
          {role === "tourist" && (
            <Link 
              href={`/${locale}/guides`} 
              className="button button-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px" }}
            >
              <Compass className="w-4 h-4" />
              {isAr ? "استكشف المرشدين السياحيين" : "Explore Tour Guides"}
            </Link>
          )}
        </div>
      ) : (
        <div className="tour-tickets-grid">
          {filteredBookings.map((booking) => {
            const otherPartyName = role === "guide" ? booking.tourist?.display_name : booking.guide?.display_name;
            const otherInitial = (otherPartyName || (role === "guide" ? "T" : "G")).charAt(0).toUpperCase();
            const dateObj = new Date(booking.start_time);
            const dateStr = dateObj.toLocaleDateString(locale, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Riyadh"
            });
            const timeStr = dateObj.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Riyadh"
            });

            return (
              <article key={booking.id} className="tour-ticket-card" aria-label={isAr ? `حجز رقم ${booking.id}` : `Booking ${booking.id}`}>
                <div className="ticket-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {getStatusBadge(booking.status)}
                    <span className="ticket-booking-id">
                      #BK-{booking.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  {booking.is_demo && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", background: "rgba(201, 184, 139, 0.2)", borderRadius: "6px", color: "var(--color-primary)" }}>
                      {isAr ? "حجز تجريبي (Demo)" : "Demo Booking"}
                    </span>
                  )}
                </div>

                <div className="ticket-body">
                  <div className="ticket-counterparty">
                    <div className="ticket-counterparty-avatar">
                      {otherInitial}
                    </div>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
                        {role === "guide" ? (m.touristLabel || (isAr ? "السائح:" : "Tourist:")) : (m.guideLabel || (isAr ? "المرشد السياحي:" : "Tour Guide:"))}
                      </span>
                      <strong style={{ fontSize: "1.05rem", color: "var(--color-text)" }}>
                        {otherPartyName || (role === "guide" ? (isAr ? "سائح مجهول" : "Anonymous Tourist") : (isAr ? "مرشد سياحي" : "Guide"))}
                      </strong>
                    </div>
                  </div>

                  <div className="ticket-meta-grid">
                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">
                        <Calendar className="w-3.5 h-3.5" />
                        {m.dateLabel || (isAr ? "تاريخ الجولة" : "Tour Date")}
                      </span>
                      <span className="ticket-meta-value">{dateStr}</span>
                    </div>

                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">
                        <Clock className="w-3.5 h-3.5" />
                        {isAr ? "وقت البدء والمدة" : "Time & Duration"}
                      </span>
                      <span className="ticket-meta-value">
                        {timeStr} ({booking.duration_hours} {m.hours || (isAr ? "ساعات" : "hours")})
                      </span>
                    </div>

                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">
                        <Users className="w-3.5 h-3.5" />
                        {m.participantsLabel || (isAr ? "عدد المشاركين" : "Participants")}
                      </span>
                      <span className="ticket-meta-value">
                        {booking.participants} {isAr ? "أشخاص" : "persons"}
                      </span>
                    </div>

                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">
                        <Coins className="w-3.5 h-3.5" />
                        {m.totalPrice || (isAr ? "الإجمالي الصافي" : "Total Price")}
                      </span>
                      <span className="ticket-meta-value" style={{ color: "var(--color-primary)", fontSize: "1.1rem" }}>
                        {booking.total_price} {isAr ? "ر.س" : "SAR"}
                      </span>
                    </div>

                    <div className="ticket-meta-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="ticket-meta-label">
                        <MapPin className="w-3.5 h-3.5" />
                        {m.meetingPointLabel || (isAr ? "نقطة اللقاء المحددة" : "Meeting Point")}
                      </span>
                      <span className="ticket-meta-value" style={{ fontWeight: 500 }}>
                        {booking.meeting_point}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ticket-actions-bar" style={{ opacity: isPending ? 0.6 : 1, pointerEvents: isPending ? "none" : "auto" }}>
                    {role === "guide" && booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, "awaiting_payment")}
                          className="button button-primary"
                          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#10b981", borderColor: "#10b981" }}
                        >
                          <Check className="w-4 h-4" />
                          {m.acceptBooking || (isAr ? "قبول طلب الحجز" : "Accept Booking")}
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, "declined")}
                          className="button"
                          style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--error, #dc2626)", borderColor: "rgba(220, 38, 38, 0.3)" }}
                        >
                          <X className="w-4 h-4" />
                          {m.declineBooking || (isAr ? "اعتذار عن الحجز" : "Decline Booking")}
                        </button>
                      </>
                    )}

                    {role === "tourist" && booking.is_demo && booking.status === "awaiting_payment" && (
                      <div style={{ flex: 1 }}>
                        <DemoPayment bookingId={booking.id} locale={locale} />
                      </div>
                    )}

                    {role === "tourist" && !booking.is_demo && booking.status === "awaiting_payment" && (
                      <button
                        className="button button-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                        onClick={() => handlePayment(booking.id)}
                        disabled={payingId === booking.id}
                      >
                        <CreditCard className="w-4 h-4" />
                        {payingId === booking.id ? "..." : (m.payNow || (isAr ? "الدفع الآن وتأكيد الحجز" : "Pay & Confirm Now"))}
                      </button>
                    )}

                    {role === "tourist" && (booking.status === "pending" || booking.status === "awaiting_payment") && (
                      <button
                        onClick={() => handleStatusChange(booking.id, "cancelled")}
                        className="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--error, #dc2626)" }}
                      >
                        <X className="w-4 h-4" />
                        {m.cancelBooking || (isAr ? "إلغاء الطلب" : "Cancel Request")}
                      </button>
                    )}

                    {(booking.status === "confirmed" || booking.status === "in_progress" || booking.status === "completed") && (
                      <button
                        onClick={() => router.push(`/${locale}/bookings/${booking.id}`)}
                        className="button button-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {isAr ? "الدخول إلى غرفة الجولة والتتبع المباشر" : "Enter Tour Room & Live Tracking"}
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
