"use client";

import { useState } from "react";
import { resolveComplaint } from "@/lib/admin/actions";
import type { Complaint } from "@/lib/bookings/types";
import type { Locale } from "@/lib/i18n";

export function ComplaintsTable({ complaints, locale }: { complaints: Complaint[], locale: Locale }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isAr = locale === "ar";

  const handleResolve = async (id: string) => {
    setLoadingId(id);
    try {
      await resolveComplaint(id, locale);
    } catch (e) {
      console.error(e);
      alert(isAr ? "حدث خطأ" : "Error resolving complaint");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left">{isAr ? "السائح" : "Tourist"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "المرشد" : "Guide"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "السبب" : "Reason"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "تاريخ الحجز" : "Booking Date"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "الحالة" : "Status"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "إجراء" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                {isAr ? "لا يوجد شكاوى" : "No complaints found"}
              </td>
            </tr>
          ) : (
            complaints.map(c => (
              <tr key={c.id} className="border-b">
                <td className="py-3 px-4">{c.tourist?.display_name || 'N/A'}</td>
                <td className="py-3 px-4">{c.guide?.display_name || 'N/A'}</td>
                <td className="py-3 px-4 max-w-xs truncate">{c.reason}</td>
                <td className="py-3 px-4">{c.bookings ? new Date(c.bookings.start_time).toLocaleDateString(locale, { timeZone: "Asia/Riyadh" }) : "—"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${c.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status === 'resolved' ? (isAr ? "محلولة" : "Resolved") : (isAr ? "قيد الانتظار" : "Pending")}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {c.status !== 'resolved' && (
                    <button 
                      onClick={() => handleResolve(c.id)}
                      disabled={loadingId === c.id}
                      className="px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50"
                    >
                      {loadingId === c.id ? "..." : (isAr ? "حل الشكوى" : "Resolve")}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
