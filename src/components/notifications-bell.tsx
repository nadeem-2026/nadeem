"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/auth/client";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function NotificationsBell({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    let channel: any;
    
    // Check session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchNotifications(supabase, user.id);
        
        // Listen to changes
        channel = supabase.channel(`public:notifications:user_id=eq.${user.id}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
            setUnreadCount(prev => prev + 1);
          })
          .subscribe();
      }
    });

    // close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (channel) channel.unsubscribe();
    };
  }, []);

  const fetchNotifications = async (supabase: any, userId: string) => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  };

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

  // We always render the bell if we are logged in, but we can't reliably know sync in layout if user is logged in
  // So we render it if they have fetched notifications or unread counts, or just always render a grey bell until loaded.
  // Actually, rendering it if we have unreadCount > 0 or if we've fetched notifications makes sense.
  // We'll show a bell icon.

  return (
    <div className="relative" ref={dropdownRef} style={{ display: 'inline-block', margin: '0 10px', verticalAlign: 'middle' }}>
      <button onClick={() => setOpen(!open)} className="relative p-2" aria-label={locale === "ar" ? "الإشعارات" : "Notifications"} style={{ color: 'var(--foreground)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute" style={{ top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg overflow-hidden z-50" style={{ right: locale === 'ar' ? 'auto' : 0, left: locale === 'ar' ? 0 : 'auto', color: '#333' }}>
          <div className="p-3 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-sm">{locale === "ar" ? "الإشعارات" : "Notifications"}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                {locale === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {locale === "ar" ? "لا توجد إشعارات" : "No notifications"}
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex justify-between gap-2 mb-1">
                    <h4 className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{n.body}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString(locale)}</span>
                    <div className="flex gap-2">
                      {n.link && (
                        <Link 
                          href={n.link}
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                        </Link>
                      )}
                      {!n.is_read && (
                        <button onClick={() => markAsRead(n.id)} className="text-xs text-gray-500 hover:text-gray-700">
                          {locale === "ar" ? "مقروء" : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
