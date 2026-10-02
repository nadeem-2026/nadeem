"use client";

import { useState } from "react";
import { approveGuide } from "@/lib/admin/actions";
import type { Locale } from "@/lib/i18n";

export function GuidesTable({ guides, locale }: { guides: any[], locale: Locale }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isAr = locale === "ar";

  const handleApprove = async (userId: string) => {
    setLoadingId(userId);
    try {
      await approveGuide(userId, locale);
    } catch (e) {
      console.error(e);
      alert(isAr ? "حدث خطأ أثناء الموافقة" : "Error approving guide");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left">{isAr ? "الاسم" : "Name"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "السيرة الذاتية" : "Bio"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "المدينة" : "City"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "الحالة" : "Status"}</th>
            <th className="py-3 px-4 text-left">{isAr ? "إجراء" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {guides.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                {isAr ? "لا يوجد مرشدين" : "No guides found"}
              </td>
            </tr>
          ) : (
            guides.map(g => (
              <tr key={g.user_id} className="border-b">
                <td className="py-3 px-4">{g.profiles?.display_name || 'N/A'}</td>
                <td className="py-3 px-4 max-w-xs truncate">{g.bio}</td>
                <td className="py-3 px-4">{g.city}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${g.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {g.is_verified ? (isAr ? "مُعتمد" : "Verified") : (isAr ? "قيد الانتظار" : "Pending")}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {!g.is_verified && (
                    <button 
                      onClick={() => handleApprove(g.user_id)}
                      disabled={loadingId === g.user_id}
                      className="px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-50"
                    >
                      {loadingId === g.user_id ? "..." : (isAr ? "اعتماد" : "Approve")}
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
