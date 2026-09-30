"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { establishRecoverySession } from "@/lib/auth/recovery";
import type { Locale } from "@/lib/i18n";

export function RecoverySession({ locale, url, publicKey }: { locale: Locale; url: string; publicKey: string }) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fragment = window.location.hash;
    // Remove bearer credentials immediately, before network requests or navigation.
    window.history.replaceState(null, "", window.location.pathname);
    const client = createBrowserClient(url, publicKey, {
      isSingleton: false,
      auth: { detectSessionInUrl: false, autoRefreshToken: false },
    });
    void establishRecoverySession(client.auth, fragment).then((valid) => {
      // A full navigation makes the protected server page read the new cookies.
      window.location.replace(valid ? `/${locale}/update-password` : `/${locale}/forgot-password?notice=expired`);
    }).catch(() => {
      window.location.replace(`/${locale}/forgot-password?notice=expired`);
    });
  }, [locale, url, publicKey]);
  return <p role="status">{locale === "ar" ? "جارٍ التحقق من رابط الاستعادة…" : "Verifying your recovery link…"}</p>;
}
