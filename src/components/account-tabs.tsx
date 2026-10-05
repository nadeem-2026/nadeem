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
    { id: "guide", label: ar ? "المرشد والتوفر" : "Guide Profile & Availability", show: role === "guide" },
    { id: "earnings", label: ar ? "الأرباح" : "Earnings", show: role === "guide" },
    { id: "admin", label: ar ? "الإدارة" : "Administration", show: role === "admin" }
  ].filter(t => t.show);

  return (
    <div className="account-tabs-container">
      <div className="tabs-nav-wrapper">
        <div className="tabs-nav">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-button ${isActive ? "active" : ""}`}
                aria-selected={isActive}
                role="tab"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "profile" && profileContent}
        {activeTab === "bookings" && bookingsContent}
        {activeTab === "guide" && guideContent}
        {activeTab === "earnings" && earningsContent}
        {activeTab === "admin" && adminContent}
      </div>
    </div>
  );
}
