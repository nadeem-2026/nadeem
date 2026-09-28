"use client";

import { useActionState } from "react";
import { authenticate, saveGuide, reviewGuide, type AuthIntent, type FormState } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";

function Feedback({ state, locale }: { state: FormState; locale: Locale }) {
  const m = authMessages(locale);
  return <>{state.error && <p role="alert" className="form-error">{m[state.error]}</p>}{state.success && <p role="status" className="form-success">{m[state.success]}</p>}</>;
}

export function AuthForm({ locale, intent, configured }: { locale: Locale; intent: AuthIntent; configured: boolean }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(authenticate.bind(null, locale, intent), {});
  return <form action={action} className="account-form">
    {!configured && <p role="status">{m.unavailable}</p>}
    <fieldset disabled={pending || !configured}>
      {intent === "signup" && <><label>{m.name}<input name="name" autoComplete="name" required maxLength={120} /></label><label>{m.role}<select name="role" required><option value="tourist">{m.tourist}</option><option value="guide">{m.guide}</option></select></label></>}
      {intent !== "update" && <label>{m.email}<input name="email" type="email" dir="ltr" autoComplete="email" maxLength={254} required /></label>}
      {intent !== "forgot" && <label>{m.password}<input name="password" type="password" dir="ltr" autoComplete={intent === "login" ? "current-password" : "new-password"} minLength={intent === "login" ? 1 : 12} maxLength={128} required aria-describedby="password-hint" /><small id="password-hint">{intent !== "login" && m.passwordHint}</small></label>}
      <button className="button button-primary" type="submit">{pending ? m.busy : m[intent]}</button>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>;
}

export type GuideProfile = { user_id: string; city: string; bio: string; status: "draft" | "pending_review" | "approved" | "rejected" | "suspended"; review_reason: string | null };
export function GuideForm({ locale, name, guide }: { locale: Locale; name: string; guide: GuideProfile }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(saveGuide.bind(null, locale), {});
  const locked = !["draft", "rejected"].includes(guide.status);
  return <form action={action} className="account-form">
    <p>{m.status}: <strong>{guide.status === "suspended" ? m.guideSuspended : m[guide.status]}</strong></p>
    {guide.review_reason && <p>{m.reason}: {guide.review_reason}</p>}
    {locked && <p>{m.locked}</p>}
    <fieldset disabled={pending || locked}>
      <label>{m.name}<input name="name" defaultValue={name} maxLength={120} required /></label>
      <label>{m.city}<input name="city" defaultValue={guide.city} maxLength={120} required /></label>
      <label>{m.bio}<textarea name="bio" defaultValue={guide.bio} rows={6} maxLength={2000} required /></label>
      <div className="hero-actions"><button className="button" type="submit" name="intent" value="save">{m.save}</button><button className="button button-primary" type="submit" name="intent" value="submit">{m.send}</button></div>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>;
}

export function ReviewForm({ locale, guide }: { locale: Locale; guide: GuideProfile }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(reviewGuide.bind(null, locale), {});
  return <form action={action} className="account-form">
    <input type="hidden" name="guide_id" value={guide.user_id} />
    <fieldset disabled={pending}>
      <label>{m.reason}<textarea name="reason" maxLength={1000} required rows={3} /></label>
      <div className="hero-actions">
        {["pending_review", "suspended"].includes(guide.status) && <button className="button button-primary" name="decision" value="approved">{m.approve}</button>}
        {guide.status === "pending_review" && <button className="button" name="decision" value="rejected">{m.reject}</button>}
        {guide.status === "approved" && <button className="button" name="decision" value="suspended">{m.suspend}</button>}
      </div>
    </fieldset><Feedback state={state} locale={locale} />
  </form>;
}
