"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldCheck, 
  Menu,
  X,
  Building2
} from "lucide-react";

import { useState } from "react";

interface AdminShellProps {
  locale: Locale;
  children: React.ReactNode;
  pendingGuidesCount?: number;
  unresolvedComplaintsCount?: number;
  adminName?: string;
}

export function AdminShell({
  locale,
  children,
  pendingGuidesCount = 0,
  unresolvedComplaintsCount = 0,
  adminName = "المشرف"
}: AdminShellProps) {
  const isAr = locale === "ar";
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      title: isAr ? "نظرة عامة" : "Overview",
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      exact: true,
      count: undefined,
      alert: false
    },
    {
      title: isAr ? "إدارة وتدقيق المرشدين" : "Guides Queue",
      href: `/${locale}/admin/guides`,
      icon: Users,
      exact: false,
      count: pendingGuidesCount > 0 ? pendingGuidesCount : undefined,
      alert: pendingGuidesCount > 0
    },
    {
      title: isAr ? "الشكاوى والنزاعات" : "Complaints",
      href: `/${locale}/admin/complaints`,
      icon: AlertTriangle,
      exact: false,
      count: unresolvedComplaintsCount > 0 ? unresolvedComplaintsCount : undefined,
      alert: unresolvedComplaintsCount > 0
    }
  ];

  const getPageTitle = () => {
    if (pathname.includes("/admin/guides")) {
      return isAr ? "إدارة وتدقيق المرشدين السياحيين" : "Tour Guides Verification";
    }
    if (pathname.includes("/admin/complaints")) {
      return isAr ? "إدارة الشكاوى وحل النزاعات" : "Complaints & Dispute Resolution";
    }
    return isAr ? "لوحة القيادة والمؤشرات" : "Executive Overview";
  };

  return (
    <div className="admin-layout-root">
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--color-surface)] border-b border-[var(--border)] w-full sticky top-[118px] z-20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-[var(--color-primary)] w-5 h-5" />
          <span className="font-bold text-sm">{isAr ? "لوحة الإدارة" : "Admin Panel"}</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-[var(--border)] text-[var(--color-text)]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="admin-sidebar-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={22} className="text-[var(--nadeem-sand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold m-0 leading-tight">{isAr ? "إدارة نديم" : "Nadeem Admin"}</h2>
              <span className="text-xs text-[var(--muted)]">{isAr ? "مركز التحكم الموحد" : "Control Center"}</span>
            </div>
          </div>
          <span className="admin-sidebar-badge">v2.0</span>
        </div>

        <nav className="admin-nav-group flex-1">
          <span className="admin-nav-label">{isAr ? "القائمة الرئيسية" : "Main Navigation"}</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} className="admin-nav-icon flex-shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.count !== undefined && (
                  <span className={`admin-nav-count ${item.alert ? "alert" : ""}`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6">
            <span className="admin-nav-label">{isAr ? "روابط سريعة" : "Platform"}</span>
            <Link 
              href={`/${locale}`}
              className="admin-nav-item"
            >
              <ArrowUpRight size={18} className="flex-shrink-0 text-[var(--muted)]" />
              <span>{isAr ? "الواجهة العامة للموقع" : "Visit Public Website"}</span>
            </Link>
            <Link 
              href={`/${locale}/guides`}
              className="admin-nav-item"
            >
              <Building2 size={18} className="flex-shrink-0 text-[var(--muted)]" />
              <span>{isAr ? "دليل المرشدين السياحيين" : "Public Guides Directory"}</span>
            </Link>
          </div>
        </nav>

        {/* Admin User Footer Card */}
        <div className="mt-auto pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background-alt)]">
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {adminName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate m-0 leading-tight">{adminName}</p>
              <span className="text-[11px] text-[var(--color-primary)] font-medium">
                {isAr ? "مشرف معتمد" : "Verified Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <main className="admin-main-container">
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumbs">
              <Link href={`/${locale}/admin`}>{isAr ? "لوحة الإدارة" : "Admin"}</Link>
              <span>/</span>
              <span className="text-[var(--color-text)] font-medium">{getPageTitle()}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-0 text-[var(--color-text)]">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="admin-status-pill">
              <span className="admin-status-dot"></span>
              <span>{isAr ? "حالة النظام: نشط" : "System: Operational"}</span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
