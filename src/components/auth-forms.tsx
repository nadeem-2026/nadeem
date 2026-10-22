"use client";

import { useActionState, useState, useTransition } from "react";
import { authenticate, signInWithGoogle, reviewGuide, saveAvailability, addException, deleteException, type AuthIntent, type FormState } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";
import { GuideOnboardingWizard } from "./guide-onboarding-wizard";
import { Clock, Calendar, Plus, Trash2, CalendarX2, Check, Sparkles, Compass, Eye, EyeOff } from "lucide-react";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function Feedback({ state, locale }: { state: FormState; locale: Locale }) {
  const m = authMessages(locale);
  return <>{state.error && <p role="alert" className="form-error">{m[state.error]}</p>}{state.success && <p role="status" className="form-success">{m[state.success]}</p>}</>;
}

export function AuthForm({ locale, intent, configured }: { locale: Locale; intent: AuthIntent; configured: boolean }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(authenticate.bind(null, locale, intent), {});
  const [selectedRole, setSelectedRole] = useState<"tourist" | "guide">("tourist");
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const isAr = locale === "ar";

  const handleGoogleClick = () => {
    startGoogleTransition(async () => {
      await signInWithGoogle(locale, intent === "signup" ? "signup" : "login", intent === "signup" ? selectedRole : "tourist");
    });
  };

  return <form action={action} className="account-form">
    {!configured && <p role="status">{m.unavailable}</p>}
    <fieldset disabled={pending || isGooglePending || !configured}>
      {intent === "signup" && (
        <>
          <div className="space-y-2 mb-2">
            <span className="text-xs font-bold block text-[var(--color-text)]">{m.role}</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("tourist")}
                className={`p-3 rounded-xl border text-start transition flex flex-col gap-1 cursor-pointer ${selectedRole === "tourist" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" : "bg-[var(--color-surface)] border-[var(--border)] text-[var(--color-text)] hover:bg-[var(--background-alt)]"}`}
              >
                <span className="font-bold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> {m.tourist}</span>
                <span className={`text-[11px] leading-tight ${selectedRole === "tourist" ? "opacity-85" : "text-[var(--muted)]"}`}>
                  {isAr ? "استكشف المملكة واحجز جولات مع مرشدين" : "Explore Saudi and book unique tours"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("guide")}
                className={`p-3 rounded-xl border text-start transition flex flex-col gap-1 cursor-pointer ${selectedRole === "guide" ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" : "bg-[var(--color-surface)] border-[var(--border)] text-[var(--color-text)] hover:bg-[var(--background-alt)]"}`}
              >
                <span className="font-bold text-sm flex items-center gap-1.5"><Compass className="w-4 h-4 text-emerald-400" /> {m.guide}</span>
                <span className={`text-[11px] leading-tight ${selectedRole === "guide" ? "opacity-85" : "text-[var(--muted)]"}`}>
                  {isAr ? "قدّم تجارب سياحية وحقق عوائد مميزة" : "Host authentic tours and earn income"}
                </span>
              </button>
            </div>
            <input type="hidden" name="role" value={selectedRole} />
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={pending || isGooglePending || !configured}
            className="google-auth-button"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGooglePending ? m.busy : m.signUpWithGoogle}</span>
          </button>

          <div className="auth-divider" role="separator" aria-label={m.orDivider}>
            <span className="auth-divider-line" />
            <span className="auth-divider-text">{m.orDivider}</span>
            <span className="auth-divider-line" />
          </div>

          <div className="auth-names-row">
            <label>{m.first_name}<input name="first_name" autoComplete="given-name" required maxLength={60} /></label>
            <label>{m.last_name}<input name="last_name" autoComplete="family-name" required maxLength={60} /></label>
          </div>
        </>
      )}

      {intent === "login" && (
        <>
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={pending || isGooglePending || !configured}
            className="google-auth-button"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGooglePending ? m.busy : m.continueWithGoogle}</span>
          </button>

          <div className="auth-divider" role="separator" aria-label={m.orDivider}>
            <span className="auth-divider-line" />
            <span className="auth-divider-text">{m.orDivider}</span>
            <span className="auth-divider-line" />
          </div>
        </>
      )}

      {intent !== "update" && <label>{m.email}<input name="email" type="email" dir="ltr" autoComplete="email" maxLength={254} required /></label>}
      {intent !== "forgot" && (
        <label>
          {m.password}
          <div className="password-input-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoComplete={intent === "login" ? "current-password" : "new-password"}
              minLength={intent === "login" ? 1 : 12}
              maxLength={128}
              required
              aria-describedby="password-hint"
              className="password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle-btn"
              aria-label={isAr ? (showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور") : (showPassword ? "Hide password" : "Show password")}
              title={isAr ? (showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور") : (showPassword ? "Hide password" : "Show password")}
            >
              {showPassword ? <Eye className="w-5 h-5" aria-hidden="true" /> : <EyeOff className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
          <small id="password-hint">{intent !== "login" && m.passwordHint}</small>
        </label>
      )}
      <button className="button button-primary" type="submit">{pending ? m.busy : m[intent]}</button>
    </fieldset>
    <Feedback state={state} locale={locale} />
  </form>;
}

export type GuideProfile = { user_id: string; city: string; bio: string; languages: string[]; service_areas: string[]; hourly_rate: number; max_participants: number; inclusions: string[]; status: "draft" | "pending_review" | "approved" | "rejected" | "suspended"; review_reason: string | null; first_name?: string; last_name?: string; full_name_ar?: string; full_name_en?: string; address_details?: unknown; national_id_url?: string; official_license_url?: string; language_certificates?: unknown; personal_photo_url?: string; avatar_url?: string; };

export function GuideForm({ locale, name, guide }: { locale: Locale; name: string; guide: GuideProfile }) {
  return <GuideOnboardingWizard locale={locale} name={name} guide={guide} />;
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
  const isAr = locale === "ar";

  // Track active state per day for live visual feedback
  const [activeDays, setActiveDays] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    days.forEach(d => {
      initial[d] = !!availability.find(a => a.day_of_week === d);
    });
    return initial;
  });

  const toggleDay = (day: number) => {
    setActiveDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <form action={action} className="account-form">
      <fieldset disabled={pending}>
        <p style={{ margin: "0 0 16px 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          {isAr 
            ? "حدد الأيام وساعات العمل المتاحة لتلقي طلبات الحجز من السائحين. سيتم تطبيق هذه المواعيد أسبوعياً." 
            : "Select available weekdays and working hours for booking requests. This schedule repeats weekly."}
        </p>

        <div className="availability-schedule-grid">
          {days.map(day => {
            const current = availability.find(a => a.day_of_week === day);
            const isActive = !!activeDays[day];
            const dayName = m[`day${day}` as "day0" | "day1" | "day2" | "day3" | "day4" | "day5" | "day6"];

            return (
              <div 
                key={day} 
                className={`availability-day-card ${isActive ? "active" : ""}`}
              >
                <label className="day-switch-control">
                  <input 
                    type="checkbox" 
                    name={`day_${day}_active`} 
                    checked={isActive}
                    onChange={() => toggleDay(day)}
                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--color-primary)" }}
                  />
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: isActive ? "var(--color-primary)" : "var(--muted)" }}>
                    {dayName}
                  </span>
                </label>

                {isActive ? (
                  <div className="day-time-inputs">
                    <div className="day-time-input-group">
                      <Clock className="w-4 h-4 text-emerald-800" />
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{m.startTime}</span>
                      <input 
                        type="time" 
                        name={`day_${day}_start`} 
                        defaultValue={current?.start_time?.slice(0, 5) || "09:00"} 
                        required 
                      />
                    </div>

                    <span style={{ color: "var(--muted)", fontWeight: 700 }}>—</span>

                    <div className="day-time-input-group">
                      <Clock className="w-4 h-4 text-emerald-800" />
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{m.endTime}</span>
                      <input 
                        type="time" 
                        name={`day_${day}_end`} 
                        defaultValue={current?.end_time?.slice(0, 5) || "17:00"} 
                        required 
                      />
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", padding: "6px 12px" }}>
                    {m.unavailableDay || (isAr ? "غير متاح" : "Unavailable")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "24px" }}>
          <button className="button button-primary" type="submit" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Check className="w-4 h-4" />
            {pending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (m.updateAvailability || (isAr ? "حفظ أوقات التوفر الأسبوعية" : "Save Weekly Schedule"))}
          </button>
        </div>
      </fieldset>
      <Feedback state={state} locale={locale} />
    </form>
  );
}

export type AvailabilityException = { id: string; exception_date: string; is_available: boolean; start_time: string | null; end_time: string | null };
export function ExceptionsForm({ locale, exceptions }: { locale: Locale; exceptions: AvailabilityException[] }) {
  const m = authMessages(locale);
  const [state, action, pending] = useActionState(addException.bind(null, locale), {});
  const [isAvailableCheck, setIsAvailableCheck] = useState(false);
  const isAr = locale === "ar";
  
  return (
    <div className="exceptions-section">
      <p style={{ margin: "0 0 20px 0", color: "var(--muted)", fontSize: "0.9rem" }}>
        {isAr 
          ? "أضف تواريخ معينة لعطلاتك أو لتعديل ساعات العمل في أيام محددة خارج الجدول الأسبوعي الاعتيادي." 
          : "Add specific dates for holidays or custom hours outside your regular weekly schedule."}
      </p>

      {/* Existing Exceptions List */}
      {exceptions.length === 0 ? (
        <div style={{ padding: "24px", background: "var(--background-alt)", borderRadius: "12px", textAlign: "center", color: "var(--muted)", marginBottom: "24px" }}>
          <CalendarX2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p style={{ margin: 0, fontWeight: 600 }}>{m.noExceptions || (isAr ? "لا توجد استثناءات مضافة." : "No exceptions added.")}</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          {exceptions.map(ex => (
            <li 
              key={ex.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "16px 20px", 
                background: "var(--color-surface)", 
                border: "1px solid var(--border)", 
                borderRadius: "12px",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Calendar className="w-5 h-5 text-emerald-800" />
                <div>
                  <strong style={{ fontSize: "1rem", color: "var(--color-text)", display: "block" }}>
                    {ex.exception_date}
                  </strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {ex.is_available 
                      ? `${m.available}: ${ex.start_time?.slice(0, 5)} — ${ex.end_time?.slice(0, 5)}` 
                      : (m.unavailableDay || (isAr ? "يوم عطلة (غير متاح)" : "Day off (Unavailable)"))}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {ex.is_available ? (
                  <span className="badge-status badge-status-confirmed" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                    {m.available}
                  </span>
                ) : (
                  <span className="badge-status badge-status-cancelled" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                    {isAr ? "عطلة" : "Off"}
                  </span>
                )}

                <form action={deleteException.bind(null, locale, ex.id)}>
                  <button 
                    type="submit" 
                    className="button" 
                    style={{ 
                      padding: "6px 12px", 
                      color: "var(--error, #dc2626)", 
                      borderColor: "rgba(220, 38, 38, 0.2)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.85rem"
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {m.delete}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add New Exception Form */}
      <div style={{ background: "var(--background-alt)", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px" }}>
        <h4 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus className="w-4 h-4 text-emerald-800" />
          {m.addException || (isAr ? "إضافة استثناء جديد" : "Add New Exception")}
        </h4>

        <form action={action} className="account-form" style={{ padding: 0, border: "none", background: "transparent", boxShadow: "none" }}>
          <fieldset disabled={pending} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label>
              {m.exceptionDate}
              <input type="date" name="exception_date" required style={{ background: "var(--color-surface)" }} />
            </label>

            <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                name="is_available" 
                id="exception_is_available"
                checked={isAvailableCheck}
                onChange={(e) => setIsAvailableCheck(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
              /> 
              <span style={{ fontWeight: 600 }}>{m.isAvailable} ({isAr ? "حدد هذا الخيار إذا كنت ترغب بالعمل بساعات مخصصة بدلاً من اعتباره عطلة" : "Check if available with custom hours instead of a day off"})</span>
            </label>

            {isAvailableCheck && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  {m.startTime}
                  <input type="time" name="start_time" defaultValue="09:00" style={{ background: "var(--color-surface)" }} />
                </label>
                <label>
                  {m.endTime}
                  <input type="time" name="end_time" defaultValue="17:00" style={{ background: "var(--color-surface)" }} />
                </label>
              </div>
            )}

            <div>
              <button className="button button-primary" type="submit" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Plus className="w-4 h-4" />
                {pending ? (isAr ? "جارٍ الإضافة..." : "Adding...") : (m.addException || (isAr ? "إضافة الاستثناء" : "Add Exception"))}
              </button>
            </div>
          </fieldset>
          <Feedback state={state} locale={locale} />
        </form>
      </div>
    </div>
  );
}
