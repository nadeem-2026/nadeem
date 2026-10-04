"use client";

import type { BookingMessages } from "@/lib/bookings/types";

import { useState, useTransition } from "react";
import { createBooking } from "@/lib/bookings/actions";
import { useRouter } from "next/navigation";

export function BookingForm({ 
  guideId, 
  hourlyRate, 
  m,
  locale 
}: { 
  guideId: string; 
  hourlyRate: number; 
  m: BookingMessages;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Step state: 1 = Details, 2 = Review
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [duration, setDuration] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [participants, setParticipants] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState("");

  const total = duration * hourlyRate;
  const today = new Date().toISOString().split("T")[0];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !meetingPoint) {
      setError(m.invalidDate || "Please fill all required fields.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    const startTimeStr = `${date}T${time}:00+03:00`;
    const formData = new FormData();
    formData.set("start_time", startTimeStr);
    formData.set("guide_id", guideId);
    formData.set("duration_hours", duration.toString());
    formData.set("participants", participants.toString());
    formData.set("meeting_point", meetingPoint);

    startTransition(async () => {
      const res = await createBooking(formData);
      if (res.success) {
        alert(m.successMessage);
        router.push(`/${locale}/account`);
      } else {
        setError(res.message || m.errorMessage);
        setStep(1); // Go back on error
      }
    });
  };

  return (
    <div className="account-form" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      {/* Steps indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
        <div style={{ fontWeight: step === 1 ? "bold" : "normal", color: step === 1 ? "var(--nadeem-green)" : "var(--muted)" }}>
          1. {m.touristDetails}
        </div>
        <div style={{ fontWeight: step === 2 ? "bold" : "normal", color: step === 2 ? "var(--nadeem-green)" : "var(--muted)" }}>
          2. {m.summaryTitle}
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {step === 1 && (
        <form onSubmit={handleNextStep} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>
              {m.dateLabel}
              <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required />
            </label>
            <label>
              {m.startTimeLabel}
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label>
              {m.durationLabel}
              <input type="number" min="1" max="12" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} required />
            </label>
            <label>
              {m.participantsLabel}
              <input type="number" min="1" value={participants} onChange={e => setParticipants(parseInt(e.target.value) || 1)} required />
            </label>
          </div>

          <label>
            {m.meetingPointLabel}
            <input type="text" placeholder={m.meetingPointPlaceholder} value={meetingPoint} onChange={e => setMeetingPoint(e.target.value)} required />
          </label>

          <button type="submit" className="button button-primary" style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.1rem" }}>
            {locale === "ar" ? "التالي: مراجعة الطلب" : "Next: Review Request"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "var(--color-page)", padding: "1.5rem", borderRadius: "var(--radius-card)", border: "1px solid var(--border)" }}>
            <h3 style={{ margin: "0 0 1rem", color: "var(--color-primary)" }}>{m.summaryTitle}</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.dateLabel}</span>
              <strong>{date} @ {time}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.meetingPointLabel}</span>
              <strong>{meetingPoint}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.durationLabel}</span>
              <strong>{duration} {m.hours}</strong>
            </div>
            
            <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.2rem", color: "var(--color-text)" }}>
              <span>{m.totalPrice}</span>
              <span>{total} ر.س</span>
            </div>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>
            {locale === "ar" 
              ? "بإرسالك لهذا الطلب، فإنك ترسل طلباً للمرشد لمراجعته. لن يتم خصم أي مبلغ حتى يقوم المرشد بقبول طلبك وتأكيد توفره."
              : "By submitting this request, you are sending it to the guide for review. No amount will be charged until the guide accepts your request and confirms availability."}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => setStep(1)} className="button" style={{ flex: 1 }}>
              {locale === "ar" ? "تعديل التفاصيل" : "Edit Details"}
            </button>
            <button onClick={handleSubmit} className="button button-primary" disabled={isPending} style={{ flex: 2 }}>
              {isPending ? "..." : m.submitRequest}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
