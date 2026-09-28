"use client";

import { useParams } from "next/navigation";
import { getMessages } from "@/content/messages";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const m = getMessages(isLocale(locale) ? locale : defaultLocale);
  return <main id="main-content" className="container feedback-page" tabIndex={-1}>
    <h1>{m.errorTitle}</h1><p role="alert">{m.errorText}</p><button type="button" className="button button-primary" onClick={reset}>{m.retry}</button>
  </main>;
}
