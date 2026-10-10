"use client";

import type { BookingMessages, Earning } from "@/lib/bookings/types";
import { 
  Coins, 
  Wallet, 
  Clock, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";

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
    <div>
      {/* 3 Metric Cards */}
      <div className="wallet-stats-grid">
        <div className="wallet-stat-card primary">
          <div className="wallet-stat-label">
            <Coins className="w-5 h-5 text-amber-200" />
            <span>{m.totalEarnings || "إجمالي الأرباح"}</span>
          </div>
          <div className="wallet-stat-value">
            {total} <span style={{ fontSize: "1rem", fontWeight: 500 }}>ر.س</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.75)" }}>
            إجمالي العوائد المحققة لكافة الجولات
          </span>
        </div>

        <div className="wallet-stat-card available">
          <div className="wallet-stat-label" style={{ color: "#065f46" }}>
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>{m.availableEarnings || "الرصيد المتاح للسحب"}</span>
          </div>
          <div className="wallet-stat-value" style={{ color: "#065f46" }}>
            {available} <span style={{ fontSize: "1rem", fontWeight: 500 }}>ر.س</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            جاهز للتحويل إلى حسابك البنكي المعتمد
          </span>
        </div>

        <div className="wallet-stat-card pending">
          <div className="wallet-stat-label" style={{ color: "#92400e" }}>
            <Clock className="w-5 h-5 text-amber-600" />
            <span>{m.pendingEarnings || "الأرباح المعلقة بالضمان"}</span>
          </div>
          <div className="wallet-stat-value" style={{ color: "#92400e" }}>
            {pending} <span style={{ fontSize: "1rem", fontWeight: 500 }}>ر.س</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            محتجزة في حساب الضمان حتى اكتمال الجولات
          </span>
        </div>
      </div>

      {/* Escrow Guarantee Notice */}
      <div className="wallet-escrow-notice">
        <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
        <div>
          <strong style={{ display: "block", color: "var(--color-primary)", marginBottom: "4px" }}>
            نظام الضمان المالي المعتمد في نديم (Escrow Protection)
          </strong>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
            يتم تحصيل قيمة الجولة وحفظها في محفظة الضمان المالي فور دفع السائح، ويتم الإفراج التلقائي عن أرباحك وتحويلها إلى الرصيد المتاح للسحب بمجرد تأكيد رمز إتمام الجولة.
          </p>
        </div>
      </div>

      {/* Transactions History */}
      {earnings.length === 0 ? (
        <div style={{
          padding: "36px 20px",
          textAlign: "center",
          background: "var(--background-alt)",
          borderRadius: "var(--radius-card)",
          color: "var(--muted)"
        }}>
          <Coins className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p style={{ margin: 0, fontWeight: 600 }}>لم تُسجل أي عوائد مالية في حسابك بعد.</p>
          <span style={{ fontSize: "0.85rem" }}>بمجرد إتمام أول جولة سياحية، ستظهر سجلات الأرباح ورسوم المنصة هنا.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--color-surface)", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--background-alt)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 18px", textAlign: "start", fontWeight: 700, color: "var(--muted)" }}>
                  {m.bookingReference || "رقم الحجز"}
                </th>
                <th style={{ padding: "14px 18px", textAlign: "start", fontWeight: 700, color: "var(--muted)" }}>
                  {m.netAmount || "صافي ربح المرشد"}
                </th>
                <th style={{ padding: "14px 18px", textAlign: "start", fontWeight: 700, color: "var(--muted)" }}>
                  {m.platformFee || "رسوم المنصة"}
                </th>
                <th style={{ padding: "14px 18px", textAlign: "start", fontWeight: 700, color: "var(--muted)" }}>
                  {m.status?.pending || "حالة الدفعة"}
                </th>
              </tr>
            </thead>
            <tbody>
              {earnings.map(e => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 18px", fontFamily: "monospace", fontWeight: 700, color: "var(--color-primary)" }}>
                    #BK-{e.booking_id.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={{ padding: "16px 18px", fontWeight: 700, color: "#065f46", fontSize: "1rem" }}>
                    {e.guide_amount} ر.س
                  </td>
                  <td style={{ padding: "16px 18px", color: "var(--muted)" }}>
                    {e.platform_fee} ر.س
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    {e.status === "available" ? (
                      <span className="badge-status badge-status-confirmed" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        متاح للسحب
                      </span>
                    ) : (
                      <span className="badge-status badge-status-pending" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                        <Clock className="w-3.5 h-3.5" />
                        معلق بالضمان
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
