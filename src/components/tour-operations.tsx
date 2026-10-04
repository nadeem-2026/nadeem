"use client";

import type { BookingMessages } from "@/lib/bookings/types";

import { useState } from "react";
import { startTour, endTour } from "@/lib/bookings/actions";
import type { Locale } from "@/lib/i18n";

export function StartTourForm({ bookingId, m, locale }: { bookingId: string, m: BookingMessages, locale: Locale }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await startTour(bookingId, otp, locale);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "2rem" }}>
      <div>
        <input 
          type="text" 
          value={otp} 
          onChange={(e) => setOtp(e.target.value)} 
          placeholder={m.operations?.enterOtp || "Enter OTP"} 
          required 
          maxLength={6}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color, #ccc)" }}
        />
        {error && <div style={{ color: "red", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</div>}
      </div>
      <button type="submit" className="button button-primary" disabled={loading || otp.length < 6}>
        {loading ? "..." : (m.operations?.startTour || "Start Tour")}
      </button>
    </form>
  );
}

export function EndTourForm({ bookingId, m, locale }: { bookingId: string, m: BookingMessages, locale: Locale }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await endTour(bookingId, locale);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <button type="submit" className="button button-primary" disabled={loading} style={{ background: "#dc3545", borderColor: "#dc3545" }}>
        {loading ? "..." : (m.operations?.endTour || "End Tour")}
      </button>
    </form>
  );
}
