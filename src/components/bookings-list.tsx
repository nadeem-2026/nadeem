"use client";

import { DemoPayment } from "./demo-payment";
import type { BookingMessages, Booking } from "@/lib/bookings/types";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/lib/bookings/actions";
import { createPaymentCharge } from "@/lib/payments/actions";
import { useRouter } from "next/navigation";

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

  const handleStatusChange = (bookingId: string, status: string) => {
    if (!confirm(m.confirmAction || "Are you sure?")) return;

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
        alert(res.message || "Payment initiation failed");
        setPayingId(null);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
      setPayingId(null);
    }
  };

  if (!bookings || bookings.length === 0) {
    return <p style={{ color: "var(--text-muted, #666)" }}>{m.noBookings || "No bookings found."}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {bookings.map((booking) => {
        // Find other party's name
        const otherPartyName = role === "guide" ? booking.tourist?.display_name : booking.guide?.display_name;

        return (
          <div key={booking.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>
                {role === "guide" ? (m.touristLabel || "Tourist:") : (m.guideLabel || "Guide:")} {otherPartyName}
              </h3>
              <span className={`badge badge-${booking.status}`}>
                {m.status?.[booking.status] || booking.status}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.95rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
              <div><strong>{m.dateLabel || "Date:"}</strong> {new Date(booking.start_time).toLocaleString(locale, { timeZone: "Asia/Riyadh" })}</div>
              <div><strong>{m.durationLabel || "Duration:"}</strong> {booking.duration_hours} {m.hours || "hours"}</div>
              <div><strong>{m.participantsLabel || "Participants:"}</strong> {booking.participants}</div>
              <div><strong>{m.totalPrice || "Total:"}</strong> {booking.total_price} SAR</div>
              <div style={{ gridColumn: "1 / -1" }}><strong>{m.meetingPointLabel || "Meeting Point:"}</strong> {booking.meeting_point}</div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? "none" : "auto" }}>
              {role === "guide" && booking.status === "pending" && (
                <>
                  <button onClick={() => handleStatusChange(booking.id, "awaiting_payment")} className="button button-primary" style={{ flex: 1, background: "#28a745" }}>
                    {m.acceptBooking || "Accept"}
                  </button>
                  <button onClick={() => handleStatusChange(booking.id, "declined")} className="button" style={{ flex: 1, color: "var(--error, #d32f2f)" }}>
                    {m.declineBooking || "Decline"}
                  </button>
                </>
              )}

              {role === "tourist" && booking.is_demo && booking.status === "awaiting_payment" && <DemoPayment bookingId={booking.id} locale={locale} />}
              {role === "tourist" && !booking.is_demo && booking.status === "awaiting_payment" && (
                <button
                  className="button button-primary"
                  style={{ flex: 1 }}
                  onClick={() => handlePayment(booking.id)}
                  disabled={payingId === booking.id}
                >
                  {payingId === booking.id ? "..." : (m.payNow || "Pay Now")}
                </button>
              )}

              {role === "tourist" && (booking.status === "pending" || booking.status === "awaiting_payment") && (
                <button onClick={() => handleStatusChange(booking.id, "cancelled")} className="button" style={{ flex: 1, color: "var(--error, #d32f2f)" }}>
                  {m.cancelBooking || "Cancel"}
                </button>
              )}

              {(booking.status === "confirmed" || booking.status === "in_progress" || booking.status === "completed") && (
                <button
                  onClick={() => router.push(`/${locale}/bookings/${booking.id}`)}
                  className="button"
                  style={{ flex: 1, background: "var(--background-alt, #f5f5f5)" }}
                >
                  {m.viewDetails || (locale === "ar" ? "تفاصيل وإدارة الحجز" : "View & Manage Details")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
