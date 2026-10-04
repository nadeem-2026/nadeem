"use client";
import { useState, useTransition } from "react";
import { simulatePayment } from "@/lib/payments/actions";
import { demoMessages, type DemoOutcome } from "@/lib/payments/demo";

export function DemoPayment({ bookingId, locale, refund = false }: { bookingId: string; locale: string; refund?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const m = demoMessages[locale === "ar" ? "ar" : "en"];
  const outcomes: DemoOutcome[] = refund ? ["refunded"] : ["success", "failed", "cancelled"];
  function submit(outcome: DemoOutcome) {
    startTransition(async () => {
      try { setMessage((await simulatePayment(bookingId, outcome, locale)).message); }
      catch { setMessage(m.error); }
    });
  }
  return <section aria-label={m.title} style={{ width: "100%" }}>
    <p>{m.notice}</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
      {outcomes.map(outcome => <button className="button" key={outcome} disabled={pending} onClick={() => submit(outcome)}>{m[outcome]}</button>)}
    </div>
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
