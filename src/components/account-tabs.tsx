"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { 
  User, 
  CalendarDays, 
  Compass, 
  Wallet, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";

interface AccountTabsProps {
  locale: Locale;
  role: "guide" | "tourist" | "admin";
  userName?: string;
  userEmail?: string;
  guideCity?: string;
  pendingActionCount?: number;
  confirmedCount?: number;
  availableEarnings?: number;
  profileContent: React.ReactNode;
  bookingsContent?: React.ReactNode;
  guideContent?: React.ReactNode;
  earningsContent?: React.ReactNode;
  adminContent?: React.ReactNode;
}

export function AccountTabs({
  locale,
  role,
  userName,
  userEmail,
  guideCity,
  pendingActionCount = 0,
  confirmedCount = 0,
  availableEarnings,
  profileContent,
  bookingsContent,
  guideContent,
  earningsContent,
  adminContent
}: AccountTabsProps) {
  const ar = locale === "ar";
  type TabKey = "profile" | "bookings" | "guide" | "earnings" | "admin";
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const getRoleLabel = () => {
    if (role === "admin") return ar ? "مشرف المنصة" : "Platform Administrator";
    if (role === "guide") return ar ? "مرشد سياحي معتمد" : "Certified Tour Guide";
    return ar ? "سائح ومستكشف" : "Traveler & Explorer";
  };

  const tabs: { 
    id: TabKey; 
    label: string; 
    icon: React.ReactNode; 
    badge?: number; 
    show: boolean 
  }[] = [
    { 
      id: "profile" as const, 
      label: ar ? "ملخص الحساب" : "Account Summary", 
      icon: <User className="w-5 h-5" />,
      show: true 
    },
    { 
      id: "bookings" as const, 
      label: ar ? "الحجوزات والرحلات" : "Bookings & Trips", 
      icon: <CalendarDays className="w-5 h-5" />,
      badge: pendingActionCount > 0 ? pendingActionCount : undefined,
      show: role === "guide" || role === "tourist" 
    },
    { 
      id: "guide" as const, 
      label: ar ? "المرشد والتوفر" : "Guide Profile & Schedule", 
      icon: <Compass className="w-5 h-5" />,
      show: role === "guide" 
    },
    { 
      id: "earnings" as const, 
      label: ar ? "المحفظة والأرباح" : "Wallet & Earnings", 
      icon: <Wallet className="w-5 h-5" />,
      show: role === "guide" 
    },
    { 
      id: "admin" as const, 
      label: ar ? "لوحة الإدارة" : "Administration", 
      icon: <ShieldCheck className="w-5 h-5" />,
      show: role === "admin" 
    }
  ].filter(t => t.show);

  const initial = (userName || "N").charAt(0).toUpperCase();

  return (
    <div className="account-container">
      {/* Luxury User Header Banner */}
      <section className="account-hero-banner" aria-label={ar ? "معلومات الحساب" : "Account Info"}>
        <div className="account-hero-user">
          <div className="account-avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="account-hero-details">
            <h1>
              {userName || (ar ? "حساب نديم" : "Nadeem Account")}
              <span className="badge-status badge-status-completed" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                <Sparkles className="w-3.5 h-3.5" />
                {getRoleLabel()}
              </span>
            </h1>
            {userEmail && <p className="account-hero-email">{userEmail}</p>}
          </div>
        </div>

        <div className="account-hero-stats">
          {guideCity && (
            <div className="account-stat-pill">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{guideCity}</span>
            </div>
          )}
          {confirmedCount > 0 && (
            <div className="account-stat-pill">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>{ar ? "رحلات مؤكدة:" : "Confirmed Tours:"} <span className="num">{confirmedCount}</span></span>
            </div>
          )}
          {typeof availableEarnings === "number" && (
            <div className="account-stat-pill">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>{ar ? "الرصيد المتاح:" : "Available:"} <span className="num">{availableEarnings} {ar ? "ر.س" : "SAR"}</span></span>
            </div>
          )}
        </div>
      </section>

      {/* Main Account Tabs & Content */}
      <div className="account-layout">
        <aside className="account-sidebar" aria-label={ar ? "أقسام الحساب" : "Account Sections"}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 8px 12px 8px", color: "var(--muted)" }} className="hide-on-mobile">
            {ar ? "بوابة الحساب" : "Account Portal"}
          </h2>
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
                <div className="tab-label-group">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="tab-badge" title={ar ? "إجراءات تتطلب المراجعة" : "Action items"}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <section className="account-content fade-in" role="tabpanel">
          {activeTab === "profile" && profileContent}
          {activeTab === "bookings" && bookingsContent}
          {activeTab === "guide" && guideContent}
          {activeTab === "earnings" && earningsContent}
          {activeTab === "admin" && adminContent}
        </section>
      </div>
    </div>
  );
}
