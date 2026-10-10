"use client";

import { useState, useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import { type GuideProfile } from "@/components/auth-forms";
import { GuideInspectorModal } from "./guide-inspector-modal";
import { 
  Search, 
  Eye, 
  MapPin, 
  Users
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";


type ReviewedGuide = GuideProfile & { profiles: { display_name: string } | null };

interface GuidesTableProps {
  guides: ReviewedGuide[];
  locale: Locale;
}

export function GuidesTable({ guides, locale }: GuidesTableProps) {
  const isAr = locale === "ar";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"all" | "pending_review" | "approved" | "rejected" | "suspended">("pending_review");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<ReviewedGuide | null>(null);

  // Filter guides based on tab & search query
  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      // Tab filter
      if (activeTab !== "all" && guide.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameAr = (guide.full_name_ar || "").toLowerCase();
        const nameEn = (guide.full_name_en || "").toLowerCase();
        const displayName = (guide.profiles?.display_name || "").toLowerCase();
        const city = (guide.city || "").toLowerCase();

        return (
          displayName.includes(query) ||
          nameAr.includes(query) ||
          nameEn.includes(query) ||
          city.includes(query)
        );
      }

      return true;
    });
  }, [guides, activeTab, searchQuery]);

  // Status counts for tabs
  const counts = useMemo(() => {
    return {
      all: guides.length,
      pending_review: guides.filter(g => g.status === "pending_review").length,
      approved: guides.filter(g => g.status === "approved").length,
      rejected: guides.filter(g => g.status === "rejected").length,
      suspended: guides.filter(g => g.status === "suspended").length,
    };
  }, [guides]);

  const tabs: Array<{ id: "pending_review" | "approved" | "all" | "rejected" | "suspended"; label: string; count: number; alert?: boolean }> = [
    { id: "pending_review", label: isAr ? "بانتظار التدقيق" : "Pending Review", count: counts.pending_review, alert: counts.pending_review > 0 },
    { id: "approved", label: isAr ? "المعتمدون" : "Approved", count: counts.approved },
    { id: "all", label: isAr ? "جميع المرشدين" : "All Guides", count: counts.all },
    { id: "rejected", label: isAr ? "المرفوضون" : "Rejected", count: counts.rejected },
    { id: "suspended", label: isAr ? "الموقوفون" : "Suspended", count: counts.suspended },
  ];


  return (
    <div className="space-y-6">
      {/* Top Controls: Tabs and Search */}
      <div className="admin-toolbar">
        {/* Filter Tabs */}
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${tab.alert && activeTab !== tab.id ? "bg-amber-100 text-amber-800 font-bold" : "bg-[var(--border)] text-[var(--muted)]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="admin-search-box">
          <Search size={18} className="text-[var(--muted)] flex-shrink-0" />
          <input
            type="text"
            placeholder={isAr ? "البحث بالاسم أو المدينة..." : "Search by name or city..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Guides Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{isAr ? "المرشد والاسم" : "Guide & Identity"}</th>
              <th>{isAr ? "المدينة ومناطق التغطية" : "City & Region"}</th>
              <th>{isAr ? "السعر / سعة المجموعة" : "Pricing & Capacity"}</th>
              <th>{isAr ? "الوثائق المرفقة" : "Documents"}</th>
              <th>{isAr ? "الحالة" : "Status"}</th>
              <th className="text-end">{isAr ? "الإجراء" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Users size={36} className="text-[var(--muted)] opacity-40" />
                    <p className="text-base font-semibold m-0">
                      {isAr ? "لا توجد نتائج مطابقة للتصفية الحالية" : "No guides found matching this filter"}
                    </p>
                    <p className="text-xs m-0 text-[var(--muted)]">
                      {isAr ? "جرّب تغيير التبويب أو تصفية البحث" : "Try changing the tab or search query"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredGuides.map((guide) => {
                const hasLicense = !!guide.official_license_url;
                const hasID = !!guide.national_id_url;
                const avatar = guide.personal_photo_url || guide.avatar_url;

                return (
                  <tr key={guide.user_id} className="cursor-pointer" onClick={() => setSelectedGuide(guide)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center overflow-hidden flex-shrink-0 border border-[var(--nadeem-sand)] relative">
                          {avatar ? (
                            <Image 
                              src={avatar} 
                              alt="" 
                              width={44}
                              height={44}
                              unoptimized
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            (guide.profiles?.display_name || "G")[0]
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-[var(--color-text)]">
                            {guide.profiles?.display_name || (isAr ? "مرشد" : "Guide")}
                          </div>
                          <div className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                            {guide.full_name_ar && <span>{guide.full_name_ar}</span>}
                            {guide.full_name_en && <span className="opacity-75 font-sans">({guide.full_name_en})</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin size={15} className="text-[var(--muted)]" />
                        <span>{guide.city || "—"}</span>
                      </div>
                      {guide.service_areas && guide.service_areas.length > 0 && (
                        <div className="text-xs text-[var(--muted)] mt-1 truncate max-w-[200px]">
                          {guide.service_areas.join("، ")}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="font-bold text-sm text-[var(--color-primary)]">
                        {guide.hourly_rate} <span className="text-xs font-normal text-[var(--muted)]">SAR/hr</span>
                      </div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">
                        {guide.max_participants || 1} {isAr ? "مشاركين" : "participants"}
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <span 
                          title={isAr ? "رخصة السياحة" : "License"}
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${hasLicense ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                        >
                          {hasLicense ? (isAr ? "الرخصة ✓" : "License ✓") : (isAr ? "الرخصة ✗" : "License ✗")}
                        </span>
                        <span 
                          title={isAr ? "الهوية الوطنية" : "ID"}
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${hasID ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                        >
                          {hasID ? (isAr ? "الهوية ✓" : "ID ✓") : (isAr ? "الهوية ✗" : "ID ✗")}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill ${guide.status}`}>
                        {guide.status === "approved" && (isAr ? "معتمد" : "Approved")}
                        {guide.status === "pending_review" && (isAr ? "قيد التدقيق" : "Pending")}
                        {guide.status === "rejected" && (isAr ? "مرفوض" : "Rejected")}
                        {guide.status === "suspended" && (isAr ? "معلّق" : "Suspended")}
                        {guide.status === "draft" && (isAr ? "مسودة" : "Draft")}
                      </span>
                    </td>

                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedGuide(guide)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-[var(--background-alt)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] font-semibold text-xs border border-[var(--border)] transition"
                      >
                        <Eye size={14} />
                        <span>{isAr ? "فحص واعتماد" : "Inspect & Review"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspection Modal */}
      {selectedGuide && (
        <GuideInspectorModal
          guide={selectedGuide}
          locale={locale}
          onClose={() => setSelectedGuide(null)}
          onActionComplete={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
