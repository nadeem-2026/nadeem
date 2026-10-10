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
  type TabKey = "profile" | "bookings" | "guide" | "earnings" | "admin";
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const tabs: { id: TabKey; label: string; show: boolean }[] = [
    { id: "profile" as const, label: ar ? "ملخص الحساب" : "Account Summary", show: true },
    { id: "bookings" as const, label: ar ? "الحجوزات" : "Bookings", show: role === "guide" || role === "tourist" },
    { id: "guide" as const, label: ar ? "المرشد والتوفر" : "Guide Profile & Availability", show: role === "guide" },
    { id: "earnings" as const, label: ar ? "الأرباح" : "Earnings", show: role === "guide" },
    { id: "admin" as const, label: ar ? "الإدارة" : "Administration", show: role === "admin" }
  ].filter(t => t.show);

  return (
    <div className="account-layout">
      <div className="account-sidebar">
        <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--foreground)", padding: "0 10px" }} className="hide-on-mobile">{ar ? "إدارة الحساب" : "Account Management"}</h3>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${isActive ? "active" : ""}`}
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="account-content fade-in">
        {activeTab === "profile" && profileContent}
        {activeTab === "bookings" && bookingsContent}
        {activeTab === "guide" && guideContent}
        {activeTab === "earnings" && earningsContent}
        {activeTab === "admin" && adminContent}
      </div>
    </div>
  );
}
