"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/auth/client";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { 
  Bell, 
  BellOff, 
  CheckCheck, 
  Check, 
  X, 
  Calendar, 
  CreditCard, 
  User, 
  Sparkles, 
  Clock, 
  ExternalLink 
} from "lucide-react";

type Notification = { 
  id: string; 
  is_read: boolean; 
  title: string; 
  body: string; 
  link: string | null; 
  created_at: string; 
};

function formatRelativeTime(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    const isAr = locale === "ar";

    if (diffMin < 1) {
      return isAr ? "الآن" : "Just now";
    }
    if (diffMin < 60) {
      return isAr ? `منذ ${diffMin} د` : `${diffMin}m ago`;
    }
    if (diffHours < 24) {
      return isAr ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return isAr ? "أمس" : "Yesterday";
    }
    if (diffDays < 7) {
      return isAr ? `منذ ${diffDays} أيام` : `${diffDays}d ago`;
    }
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function getNotificationCategory(title: string, body: string): "booking" | "payment" | "account" | "general" {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes("حجز") || text.includes("booking") || text.includes("tour") || text.includes("جولة")) {
    return "booking";
  }
  if (text.includes("دفع") || text.includes("payment") || text.includes("فاتورة") || text.includes("paid") || text.includes("سداد")) {
    return "payment";
  }
  if (text.includes("مرشد") || text.includes("guide") || text.includes("حساب") || text.includes("account") || text.includes("بروفايل") || text.includes("profile")) {
    return "account";
  }
  return "general";
}

export function NotificationsBell({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAr = locale === "ar";

  useEffect(() => {
    const supabase = createBrowserClient();
    let channel: RealtimeChannel | undefined;
    let disposed = false;

    async function fetchNotifications(supabaseClient: SupabaseClient, userId: string) {
      const { data } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);
      if (data && !disposed) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    }

    // Check user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !disposed) {
        setIsLoggedIn(true);
        fetchNotifications(supabase, user.id);

        // Listen for new incoming realtime notifications
        channel = supabase.channel(`public:notifications:user_id=eq.${user.id}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
            const notification = payload.new as Notification;
            setNotifications(prev => prev.some(n => n.id === notification.id) ? prev : [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
            const updated = payload.new as Notification;
            setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
            setNotifications(all => {
              setUnreadCount(all.filter(n => !n.is_read).length);
              return all;
            });
          })
          .subscribe();
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      disposed = true;
      if (channel) channel.unsubscribe();
    };
  }, []);

  // Prevent background scroll on mobile devices when bottom sheet is open
  useEffect(() => {
    if (open) {
      if (typeof window !== "undefined" && window.innerWidth <= 640) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const markAsRead = async (id: string) => {
    const supabase = createBrowserClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const supabase = createBrowserClient();
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="notifications-bell-wrap" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setOpen(!open)} 
        className={`notifications-bell-btn ${open ? "is-active" : ""}`}
        aria-label={isAr ? "الإشعارات" : "Notifications"}
        aria-expanded={open}
      >
        <Bell size={19} className="notifications-bell-icon" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notifications-badge" aria-label={`${unreadCount} ${isAr ? "إشعارات جديدة" : "new notifications"}`}>
            <span className="notifications-badge-pulse" aria-hidden="true" />
            <span className="notifications-badge-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop overlay (dismisses popup on desktop & mobile) */}
          <div 
            className="notifications-overlay" 
            onClick={() => setOpen(false)} 
            aria-hidden="true" 
          />

          {/* Notifications Panel (Bottom sheet on mobile, sleek popover on desktop) */}
          <div 
            className="notifications-panel" 
            role="dialog" 
            aria-modal="true" 
            aria-label={isAr ? "مركز الإشعارات" : "Notification Center"}
          >
            {/* Mobile Sheet Handle Bar */}
            <div className="notifications-sheet-handle" aria-hidden="true" />

            {/* Header */}
            <div className="notifications-panel-header">
              <div className="notifications-header-lead">
                <div className="notifications-header-icon">
                  <Bell size={18} aria-hidden="true" />
                </div>
                <h3 className="notifications-header-title">
                  {isAr ? "الإشعارات" : "Notifications"}
                </h3>
                {unreadCount > 0 && (
                  <span className="notifications-header-pill">
                    {unreadCount} {isAr ? "جديد" : "new"}
                  </span>
                )}
              </div>

              <div className="notifications-header-actions">
                {unreadCount > 0 && (
                  <button 
                    type="button"
                    onClick={markAllAsRead} 
                    className="notifications-mark-all-btn"
                    title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
                  >
                    <CheckCheck size={15} aria-hidden="true" />
                    <span>{isAr ? "تحديد كمقروء" : "Mark all read"}</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setOpen(false)} 
                  className="notifications-close-btn"
                  aria-label={isAr ? "إغلاق" : "Close"}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="notifications-panel-body">
              {!isLoggedIn ? (
                /* Guest State */
                <div className="notifications-empty-state">
                  <div className="notifications-empty-icon">
                    <Sparkles size={32} className="text-[var(--color-primary)]" aria-hidden="true" />
                  </div>
                  <h4>{isAr ? "سجّل دخولك لمتابعة الإشعارات" : "Sign in for notifications"}</h4>
                  <p>
                    {isAr 
                      ? "تابع طلبات الحجز المباشرة مع المرشدين وتلقَّ التنبيهات الفورية لحسابك." 
                      : "Stay updated on your booking requests and real-time alerts."}
                  </p>
                  <Link 
                    href={`/${locale}/login`} 
                    onClick={() => setOpen(false)} 
                    className="notifications-cta-btn"
                  >
                    <User size={15} aria-hidden="true" />
                    <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
                  </Link>
                </div>
              ) : notifications.length === 0 ? (
                /* Logged In - Empty State */
                <div className="notifications-empty-state">
                  <div className="notifications-empty-icon">
                    <BellOff size={32} aria-hidden="true" />
                  </div>
                  <h4>{isAr ? "لا توجد إشعارات حالياً" : "All caught up!"}</h4>
                  <p>
                    {isAr 
                      ? "سنخبرك فور وصول أي تنبيه بشأن حجوزاتك أو رسائلك." 
                      : "We'll notify you as soon as there are updates on your bookings or messages."}
                  </p>
                </div>
              ) : (
                /* Notifications List */
                <div className="notifications-list">
                  {notifications.map((n) => {
                    const category = getNotificationCategory(n.title, n.body);
                    return (
                      <div 
                        key={n.id} 
                        className={`notification-item-card ${!n.is_read ? "is-unread" : ""}`}
                      >
                        <div className={`notification-cat-icon ${category}`}>
                          {category === "booking" && <Calendar size={18} aria-hidden="true" />}
                          {category === "payment" && <CreditCard size={18} aria-hidden="true" />}
                          {category === "account" && <User size={18} aria-hidden="true" />}
                          {category === "general" && <Bell size={18} aria-hidden="true" />}
                        </div>

                        <div className="notification-content">
                          <div className="notification-title-row">
                            <h4 className="notification-item-title">{n.title}</h4>
                            {!n.is_read && (
                              <span 
                                className="notification-unread-dot" 
                                title={isAr ? "غير مقروء" : "Unread"} 
                              />
                            )}
                          </div>

                          <p className="notification-item-body">{n.body}</p>

                          <div className="notification-footer-row">
                            <span className="notification-timestamp">
                              <Clock size={12} aria-hidden="true" />
                              <span>{formatRelativeTime(n.created_at, locale)}</span>
                            </span>

                            <div className="notification-actions">
                              {n.link && (
                                <Link 
                                  href={n.link}
                                  onClick={() => {
                                    markAsRead(n.id);
                                    setOpen(false);
                                  }}
                                  className="notifications-item-btn-details"
                                >
                                  <span>{isAr ? "عرض التفاصيل" : "View"}</span>
                                  <ExternalLink size={12} aria-hidden="true" />
                                </Link>
                              )}
                              {!n.is_read && (
                                <button 
                                  type="button"
                                  onClick={() => markAsRead(n.id)} 
                                  className="notifications-item-btn-read"
                                  title={isAr ? "تحديد كمقروء" : "Mark as read"}
                                >
                                  <Check size={12} aria-hidden="true" />
                                  <span>{isAr ? "تمت القراءة" : "Read"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel Footer */}
            {notifications.length > 0 && (
              <div className="notifications-panel-footer">
                <span>
                  {notifications.length} {isAr ? "إشعار" : "notifications"}
                </span>
                {isLoggedIn && (
                  <Link 
                    href={`/${locale}/account`} 
                    onClick={() => setOpen(false)}
                  >
                    <span>{isAr ? "إدارة الحساب" : "My Account"}</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
