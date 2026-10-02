"use client";

import { useActionState } from "react";
import { authenticate, saveGuide, reviewGuide, saveAvailability, addException, deleteException, type AuthIntent, type FormState } from "@/lib/auth/actions";
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

export type GuideProfile = { user_id: string; city: string; bio: string; languages: string[]; service_areas: string[]; hourly_rate: number; max_participants: number; inclusions: string[]; status: "draft" | "pending_review" | "approved" | "rejected" | "suspended"; review_reason: string | null };
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
      <label>{m.languages}<input name="languages" defaultValue={(guide.languages || []).join(", ")} maxLength={200} required /></label>
      <label>{m.service_areas}<input name="service_areas" defaultValue={(guide.service_areas || []).join(", ")} maxLength={200} required /></label>
      <label>{m.hourly_rate}<input name="hourly_rate" type="number" step="0.01" min="0" defaultValue={guide.hourly_rate || 0} required /></label>
      <label>{m.max_participants}<input name="max_participants" type="number" min="1" defaultValue={guide.max_participants || 1} required /></label>
      <label>{m.inclusions}<input name="inclusions" defaultValue={(guide.inclusions || []).join(", ")} maxLength={500} required /></label>
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

export type DayAvailability = { day_of_week: number; start_time: string; end_time: string };
export function AvailabilityForm({ locale, availability }: { locale: Locale; availability: DayAvailability[] }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(saveAvailability.bind(null, locale), {});
  const days = [0, 1, 2, 3, 4, 5, 6];

  return <form action={action} className="account-form">
    <fieldset disabled={pending}>
      <div className="availability-grid" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {days.map(day => {
          const current = availability.find(a => a.day_of_week === day);
          return <div key={day} className="availability-row" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label className="checkbox-label" style={{ minWidth: "120px", display: "flex", gap: "0.5rem" }}>
              <input type="checkbox" name={`day_${day}_active`} defaultChecked={!!current} />
              {(m as any)[`day${day}`]}
            </label>
            <input type="time" name={`day_${day}_start`} defaultValue={current?.start_time?.slice(0,5) || "09:00"} required />
            <span>{m.endTime}</span>
            <input type="time" name={`day_${day}_end`} defaultValue={current?.end_time?.slice(0,5) || "17:00"} required />
          </div>;
        })}
      </div>
      <div className="hero-actions" style={{ marginTop: "2rem" }}>
        <button className="button button-primary" type="submit">{m.updateAvailability}</button>
      </div>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>;
}

export type AvailabilityException = { id: string; exception_date: string; is_available: boolean; start_time: string | null; end_time: string | null };
export function ExceptionsForm({ locale, exceptions }: { locale: Locale; exceptions: AvailabilityException[] }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(addException.bind(null, locale), {});
  
  return <div className="exceptions-section">
    {exceptions.length === 0 ? <p>{m.noExceptions}</p> : (
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {exceptions.map(ex => (
          <li key={ex.id} style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "8px" }}>
            <span style={{ fontWeight: "bold" }}>{ex.exception_date}</span>
            <span style={{ flex: 1 }}>{ex.is_available ? `${m.available}: ${ex.start_time?.slice(0,5)} - ${ex.end_time?.slice(0,5)}` : m.unavailableDay}</span>
            <form action={deleteException.bind(null, locale, ex.id)}>
              <button type="submit" className="button button-danger" style={{ padding: "0.25rem 0.5rem" }}>{m.delete}</button>
            </form>
          </li>
        ))}
      </ul>
    )}
    <form action={action} className="account-form" style={{ padding: "1.5rem", border: "1px solid var(--border-color, #e5e5e5)", borderRadius: "8px" }}>
      <h4>{m.addException}</h4>
      <fieldset disabled={pending} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
        <label>{m.exceptionDate}<input type="date" name="exception_date" required /></label>
        <label className="checkbox-label" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" name="is_available" id="exception_is_available" /> {m.isAvailable}
        </label>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label style={{ flex: 1 }}>{m.startTime}<input type="time" name="start_time" /></label>
          <label style={{ flex: 1 }}>{m.endTime}<input type="time" name="end_time" /></label>
        </div>
        <button className="button button-primary" type="submit">{m.addException}</button>
      </fieldset>
      <Feedback state={state} locale={locale} />
    </form>
  </div>;
}
