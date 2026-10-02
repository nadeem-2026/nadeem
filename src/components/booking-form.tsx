"use client";

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
  m: any;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  const total = duration * hourlyRate;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!date || !time) {
      setError(m.invalidDate);
      return;
    }

    const formData = new FormData(e.currentTarget);
    // Construct valid ISO start_time
    const startTimeStr = `${date}T${time}:00`;
    formData.set("start_time", startTimeStr);
    formData.set("guide_id", guideId);

    startTransition(async () => {
      const res = await createBooking(formData);
      if (res.success) {
        alert(m.successMessage);
        router.push(`/${locale}/account`);
      } else {
        setError(res.message || m.errorMessage);
      }
    });
  };

  // Prevent past dates
  const today = new Date().toISOString().split("T")[0];

  return (
    <form className="account-form" onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {error && <div className="form-error">{error}</div>}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label>
          {m.dateLabel}
          <input type="date" name="date" value={date} min={today} onChange={e => setDate(e.target.value)} required />
        </label>
        
        <label>
          {m.startTimeLabel}
          <input type="time" name="time" value={time} onChange={e => setTime(e.target.value)} required />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label>
          {m.durationLabel}
          <input type="number" name="duration_hours" min="1" max="12" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} required />
        </label>
        
        <label>
          {m.participantsLabel}
          <input type="number" name="participants" min="1" defaultValue="1" required />
        </label>
      </div>

      <label>
        {m.meetingPointLabel}
        <input type="text" name="meeting_point" placeholder={m.meetingPointPlaceholder} required />
      </label>

      <div style={{ padding: "1.5rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px", marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem 0" }}>{m.summaryTitle}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span>{m.hourlyRate}</span>
          <span>{hourlyRate}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span>{m.durationLabel}</span>
          <span>{duration}</span>
        </div>
        <hr style={{ border: "0", borderTop: "1px solid var(--border-color, #ccc)", margin: "1rem 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary, #0070f3)" }}>
          <span>{m.totalPrice}</span>
          <span>{total}</span>
        </div>
      </div>

      <button type="submit" className="button button-primary" disabled={isPending} style={{ padding: "1rem", fontSize: "1.1rem" }}>
        {isPending ? "..." : m.submitRequest}
      </button>
    </form>
  );
}
