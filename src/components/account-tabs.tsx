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
import { UserAvatar } from "./user-avatar";

interface AccountTabsProps {
  locale: Locale;
  role: "guide" | "tourist" | "admin";
  guideStatus?: "draft" | "pending_review" | "approved" | "rejected" | "suspended" | null;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
  guideCity?: string;
  pendingActionCount?: number;
  confirmedCount?: number;
  availableEarnings?: number;
  profileContent: React.ReactNode;
  touristProfileContent?: React.ReactNode;
  bookingsContent?: React.ReactNode;
  guideContent?: React.ReactNode;
  earningsContent?: React.ReactNode;
  adminContent?: React.ReactNode;
}

export function AccountTabs({
  locale,
  role,
  guideStatus,
  userName,
  userEmail,
  avatarUrl,
  guideCity,
  pendingActionCount = 0,
  confirmedCount = 0,
  availableEarnings,
  profileContent,
  touristProfileContent,
  bookingsContent,
  guideContent,
  earningsContent,
  adminContent
}: AccountTabsProps) {
  const ar = locale === "ar";
  type TabKey = "profile" | "touristProfile" | "bookings" | "guide" | "earnings" | "admin";
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const getRoleBadge = () => {
    if (role === "admin") {
      return {
        label: ar ? "مشرف المنصة" : "Platform Administrator",
        className: "badge-status badge-status-completed"
      };
    }
    if (role === "guide") {
      switch (guideStatus) {
        case "approved":
          return {
            label: ar ? "مرشد سياحي معتمد" : "Certified Tour Guide",
            className: "badge-status badge-status-completed"
          };
        case "pending_review":
          return {
            label: ar ? "مرشد (بانتظار الاعتماد)" : "Guide (Under Review)",
            className: "badge-status badge-status-pending"
          };
        case "rejected":
          return {
            label: ar ? "مرشد (يتطلب تعديل)" : "Guide (Action Required)",
            className: "badge-status badge-status-cancelled"
          };
        case "suspended":
          return {
            label: ar ? "مرشد (حساب معلّق)" : "Guide (Suspended)",
            className: "badge-status badge-status-cancelled"
          };
        default:
          return {
            label: ar ? "مرشد (قيد استكمال الملف)" : "Guide (Drafting Profile)",
            className: "badge-status"
          };
      }
    }
    return {
      label: ar ? "سائح ومستكشف" : "Traveler & Explorer",
      className: "badge-status badge-status-completed"
    };
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
      id: "touristProfile" as const, 
      label: ar ? "الملف السياحي" : "Traveler Profile", 
      icon: <Sparkles className="w-5 h-5" />,
      show: role === "tourist" 
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
  const roleBadge = getRoleBadge();

  return (
    <div className="account-container">
      {/* Luxury User Header Banner */}
      <section className="account-hero-banner" aria-label={ar ? "معلومات الحساب" : "Account Info"}>
        <div className="account-hero-user">
          <UserAvatar
            src={avatarUrl}
            name={userName || (ar ? "حساب نديم" : "Nadeem Account")}
            size={68}
            role={role}
          />
          <div className="account-hero-details">
            <h1>
              {userName || (ar ? "حساب نديم" : "Nadeem Account")}
              <span className={roleBadge.className} style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                <Sparkles className="w-3.5 h-3.5" />
                {roleBadge.label}
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
          {activeTab === "touristProfile" && touristProfileContent}
          {activeTab === "bookings" && bookingsContent}
          {activeTab === "guide" && guideContent}
          {activeTab === "earnings" && earningsContent}
          {activeTab === "admin" && adminContent}
        </section>
      </div>
    </div>
  );
}
