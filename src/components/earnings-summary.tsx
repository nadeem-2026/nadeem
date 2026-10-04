"use client";

import type { BookingMessages, Earning } from "@/lib/bookings/types";

export function EarningsSummary({
  earnings,
  m
}: {
  earnings: Earning[];
  m: BookingMessages;
}) {
  const total = earnings.reduce((acc, e) => acc + Number(e.guide_amount), 0);
  const pending = earnings.filter(e => e.status === "pending").reduce((acc, e) => acc + Number(e.guide_amount), 0);
  const available = earnings.filter(e => e.status === "available").reduce((acc, e) => acc + Number(e.guide_amount), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div style={{ padding: "1.5rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted, #666)", marginBottom: "0.5rem" }}>{m.totalEarnings}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--primary, #0070f3)" }}>{total} SAR</div>
        </div>
        <div style={{ padding: "1.5rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted, #666)", marginBottom: "0.5rem" }}>{m.pendingEarnings}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#856404" }}>{pending} SAR</div>
        </div>
        <div style={{ padding: "1.5rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted, #666)", marginBottom: "0.5rem" }}>{m.availableEarnings}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#155724" }}>{available} SAR</div>
        </div>
      </div>

      {earnings.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color, #e5e5e5)", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0" }}>{m.bookingReference}</th>
              <th style={{ padding: "0.75rem 0" }}>{m.netAmount}</th>
              <th style={{ padding: "0.75rem 0" }}>{m.platformFee}</th>
              <th style={{ padding: "0.75rem 0" }}>{m.status?.pending || "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map(e => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--border-color, #e5e5e5)" }}>
                <td style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontFamily: "monospace" }}>{e.booking_id.split("-")[0]}</td>
                <td style={{ padding: "0.75rem 0", fontWeight: "bold" }}>{e.guide_amount}</td>
                <td style={{ padding: "0.75rem 0", color: "var(--text-muted, #666)" }}>{e.platform_fee}</td>
                <td style={{ padding: "0.75rem 0" }}>
                  <span style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    background: e.status === "pending" ? "#fff3cd" : e.status === "available" ? "#d4edda" : "#f5f5f5",
                    color: e.status === "pending" ? "#856404" : e.status === "available" ? "#155724" : "#666"
                  }}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
