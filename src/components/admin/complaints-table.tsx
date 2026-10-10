"use client";

import { useState } from "react";
import { resolveComplaint } from "@/lib/admin/actions";
import type { Complaint } from "@/lib/bookings/types";
import type { Locale } from "@/lib/i18n";
import { CheckCircle2, Check, Loader2 } from "lucide-react";

export function ComplaintsTable({ complaints, locale }: { complaints: Complaint[], locale: Locale }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const isAr = locale === "ar";

  const handleResolve = async (id: string) => {
    setLoadingId(id);
    try {
      await resolveComplaint(id, locale);
    } catch (e: unknown) {
      console.error(e);
      alert(isAr ? "حدث خطأ أثناء معالجة الشكوى" : "Error resolving complaint");
    } finally {
      setLoadingId(null);
    }
  };


  const filteredComplaints = complaints.filter(c => {
    if (filter === "pending") return c.status !== "resolved";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  const pendingCount = complaints.filter(c => c.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="admin-toolbar">
        <div className="admin-tabs">
          <button
            onClick={() => setFilter("all")}
            className={`admin-tab-btn ${filter === "all" ? "active" : ""}`}
          >
            <span>{isAr ? "جميع الشكاوى" : "All Complaints"}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--border)]">{complaints.length}</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`admin-tab-btn ${filter === "pending" ? "active" : ""}`}
          >
            <span>{isAr ? "قيد الانتظار" : "Pending"}</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`admin-tab-btn ${filter === "resolved" ? "active" : ""}`}
          >
            <span>{isAr ? "المحلولة" : "Resolved"}</span>
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="text-start">{isAr ? "السائح الشاكي" : "Tourist"}</th>
              <th className="text-start">{isAr ? "المرشد المشكو ضده" : "Guide"}</th>
              <th className="text-start">{isAr ? "سبب الشكوى والتفاصيل" : "Reason & Details"}</th>
              <th className="text-start">{isAr ? "تاريخ الحجز" : "Booking Date"}</th>
              <th className="text-start">{isAr ? "الحالة" : "Status"}</th>
              <th className="text-end">{isAr ? "الإجراء" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 size={32} className="text-emerald-500 opacity-60" />
                    <p className="font-semibold m-0">{isAr ? "لا توجد شكاوى مطابقة للتصفية" : "No complaints found"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const isResolved = c.status === "resolved";

                return (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.tourist?.display_name || "N/A"}</td>
                    <td>{c.guide?.display_name || "N/A"}</td>
                    <td className="max-w-sm">
                      <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">{c.reason}</p>
                    </td>
                    <td className="text-xs text-[var(--muted)]">
                      {c.bookings ? new Date(c.bookings.start_time).toLocaleDateString(locale, { timeZone: "Asia/Riyadh" }) : "—"}
                    </td>
                    <td>
                      <span className={`status-pill ${isResolved ? "approved" : "rejected"}`}>
                        {isResolved ? (isAr ? "تم الحل ✓" : "Resolved") : (isAr ? "قيد الانتظار ⏳" : "Pending")}
                      </span>
                    </td>
                    <td className="text-end">
                      {!isResolved && (
                        <button 
                          onClick={() => handleResolve(c.id)}
                          disabled={loadingId === c.id}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                        >
                          {loadingId === c.id ? (
                            <><Loader2 size={13} className="animate-spin" /> {isAr ? "جارٍ الحفظ..." : "Resolving..."}</>
                          ) : (
                            <><Check size={14} /> {isAr ? "إغلاق وحل الشكوى" : "Resolve"}</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
