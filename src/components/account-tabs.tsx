"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

interface AccountTabsProps {
  locale: Locale;
  role: "guide" | "tourist" | "admin";
  profileContent: React.ReactNode;
  bookingsContent?: React.ReactNode;
  guideContent?: React.ReactNode;
  earningsContent?: React.ReactNode;
  adminContent?: React.ReactNode;
}

export function AccountTabs({
  locale,
  role,
  profileContent,
  bookingsContent,
  guideContent,
  earningsContent,
  adminContent
}: AccountTabsProps) {
  const ar = locale === "ar";
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "guide" | "earnings" | "admin">("profile");

  const tabs = [
    { id: "profile", label: ar ? "ملخص الحساب" : "Account Summary", show: true },
    { id: "bookings", label: ar ? "الحجوزات" : "Bookings", show: role === "guide" || role === "tourist" },
    { id: "guide", label: ar ? "ملف المرشد والتوفر" : "Guide Profile & Availability", show: role === "guide" },
    { id: "earnings", label: ar ? "الأرباح" : "Earnings", show: role === "guide" },
    { id: "admin", label: ar ? "الإدارة" : "Administration", show: role === "admin" }
  ].filter(t => t.show);

  return (
    <div className="account-tabs-container">
      <div className="tabs-nav" style={{ 
        display: "flex", 
        gap: "1.5rem", 
        borderBottom: "1px solid var(--border-color, #e5e5e5)", 
        marginBottom: "2rem",
        overflowX: "auto",
        whiteSpace: "nowrap"
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: "none",
              border: "none",
              padding: "0.75rem 0",
              cursor: "pointer",
              fontSize: "1.05rem",
              fontWeight: activeTab === tab.id ? "600" : "400",
              color: activeTab === tab.id ? "var(--primary)" : "var(--text)",
              borderBottom: activeTab === tab.id ? "3px solid var(--primary)" : "3px solid transparent",
              transition: "all 0.2s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content" style={{ animation: "fadeIn 0.3s ease" }}>
        {activeTab === "profile" && profileContent}
        {activeTab === "bookings" && bookingsContent}
        {activeTab === "guide" && guideContent}
        {activeTab === "earnings" && earningsContent}
        {activeTab === "admin" && adminContent}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tabs-nav::-webkit-scrollbar {
          height: 4px;
        }
        .tabs-nav::-webkit-scrollbar-thumb {
          background-color: var(--border-color, #e5e5e5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
