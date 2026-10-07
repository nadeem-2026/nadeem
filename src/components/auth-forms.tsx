"use client";

import { useActionState, useState } from "react";
import { authenticate, saveGuide, reviewGuide, saveAvailability, addException, deleteException, type AuthIntent, type FormState } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";
import { GuideFileUpload } from "./guide-file-upload";

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

export type GuideProfile = { user_id: string; city: string; bio: string; languages: string[]; service_areas: string[]; hourly_rate: number; max_participants: number; inclusions: string[]; status: "draft" | "pending_review" | "approved" | "rejected" | "suspended"; review_reason: string | null; first_name?: string; last_name?: string; full_name_ar?: string; full_name_en?: string; address_details?: any; national_id_url?: string; official_license_url?: string; language_certificates?: any; personal_photo_url?: string; avatar_url?: string; };
export function GuideForm({ locale, name, guide }: { locale: Locale; name: string; guide: GuideProfile }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(saveGuide.bind(null, locale), {});
  const [step, setStep] = useState(1);
  const locked = !["draft", "rejected"].includes(guide.status);

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return <form action={action} className="account-form">
    <p>{m.status}: <strong>{guide.status === "suspended" ? m.guideSuspended : m[guide.status]}</strong></p>
    {guide.review_reason && <p>{m.reason}: {guide.review_reason}</p>}
    {locked && <p>{m.locked}</p>}

    <div className="stepper" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} style={{ 
          width: '30px', height: '30px', borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: step === s ? 'var(--primary-color, #0070f3)' : (step > s ? '#4caf50' : '#ccc'),
          color: '#fff', fontWeight: 'bold'
        }}>{s}</div>
      ))}
    </div>

    <fieldset disabled={pending || locked} style={{ display: step === 1 ? 'block' : 'none' }}>
      <h3>1. {m.personal_info || "البيانات الشخصية"}</h3>
      <label>{m.name}<input name="name" defaultValue={name} maxLength={120} required /></label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label style={{ flex: 1 }}>{m.first_name}<input name="first_name" defaultValue={guide.first_name} maxLength={50} required /></label>
        <label style={{ flex: 1 }}>{m.last_name}<input name="last_name" defaultValue={guide.last_name} maxLength={50} required /></label>
      </div>
      <label>{m.full_name_ar}<input name="full_name_ar" defaultValue={guide.full_name_ar} maxLength={120} required /></label>
      <label>{m.full_name_en}<input name="full_name_en" defaultValue={guide.full_name_en} maxLength={120} required dir="ltr" /></label>
      <label>{m.address_details}<textarea name="address_details" defaultValue={typeof guide.address_details === 'string' ? guide.address_details : JSON.stringify(guide.address_details || {})} rows={3} maxLength={500} required /></label>
      <label>{m.city}<input name="city" defaultValue={guide.city} maxLength={120} required /></label>
    </fieldset>

    <fieldset disabled={pending || locked} style={{ display: step === 2 ? 'block' : 'none' }}>
      <h3>2. {m.personal_photo || "الصورة الشخصية"}</h3>
      <GuideFileUpload name="personal_photo_url" label={m.personal_photo || "Personal Photo"} defaultValue={guide.personal_photo_url || guide.avatar_url} acceptedTypes="image/jpeg, image/png" />
    </fieldset>

    <fieldset disabled={pending || locked} style={{ display: step === 3 ? 'block' : 'none' }}>
      <h3>3. {m.official_docs || "الوثائق الرسمية"}</h3>
      <GuideFileUpload name="national_id_url" label={m.national_id_url} required defaultValue={guide.national_id_url} acceptedTypes="image/jpeg, image/png, application/pdf" />
      <GuideFileUpload name="official_license_url" label={m.official_license_url} required defaultValue={guide.official_license_url} acceptedTypes="image/jpeg, image/png, application/pdf" />
    </fieldset>

    <fieldset disabled={pending || locked} style={{ display: step === 4 ? 'block' : 'none' }}>
      <h3>4. {m.languages_and_certs || "اللغات والشهادات"}</h3>
      <label>{m.languages}<input name="languages" defaultValue={(guide.languages || []).join(", ")} maxLength={200} required /></label>
      <GuideFileUpload name="language_certificates" label={m.language_certificates} defaultValue={typeof guide.language_certificates === 'string' ? guide.language_certificates : guide.language_certificates?.url} acceptedTypes="image/jpeg, image/png, application/pdf" />
    </fieldset>

    <fieldset disabled={pending || locked} style={{ display: step === 5 ? 'block' : 'none' }}>
      <h3>5. {m.bio_and_services || "النبذة والخدمات"}</h3>
      <label>{m.bio}<textarea name="bio" defaultValue={guide.bio} rows={6} maxLength={2000} required /></label>
      <label>{m.service_areas}<input name="service_areas" defaultValue={(guide.service_areas || []).join(", ")} maxLength={200} required /></label>
      <label>{m.hourly_rate}<input name="hourly_rate" type="number" step="0.01" min="0" defaultValue={guide.hourly_rate || 0} required /></label>
      <label>{m.max_participants}<input name="max_participants" type="number" min="1" defaultValue={guide.max_participants || 1} required /></label>
      <label>{m.inclusions}<input name="inclusions" defaultValue={(guide.inclusions || []).join(", ")} maxLength={500} required /></label>
    </fieldset>

    <div className="hero-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
      {step > 1 ? (
        <button type="button" className="button" onClick={prevStep} disabled={pending || locked}>{m.previous || "Previous"}</button>
      ) : <div />}
      
      {step < 5 ? (
        <button type="button" className="button button-primary" onClick={nextStep} disabled={pending || locked}>{m.next || "Next"}</button>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="button" type="submit" name="intent" value="save" disabled={pending || locked}>{m.save}</button>
          <button className="button button-primary" type="submit" name="intent" value="submit" disabled={pending || locked}>{m.send}</button>
        </div>
      )}
    </div>

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
              {m[`day${day}` as "day0" | "day1" | "day2" | "day3" | "day4" | "day5" | "day6"]}
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
