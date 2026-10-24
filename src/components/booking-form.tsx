"use client";

import type { BookingMessages } from "@/lib/bookings/types";
import type { PublicGuide } from "@/lib/guides/public";
import { useState, useTransition, useMemo } from "react";
import { createBooking } from "@/lib/bookings/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, Clock, Users, MapPin, CheckCircle2, 
  ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles,
  Languages, MessageSquare, Compass, Check
} from "lucide-react";

export function BookingForm({ 
  guide,
  guideId, 
  hourlyRate, 
  m,
  locale 
}: { 
  guide?: PublicGuide;
  guideId?: string; 
  hourlyRate: number; 
  m: BookingMessages;
  locale: string;
}) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Step state: 1 = Details, 2 = Review
  const [step, setStep] = useState<1 | 2>(1);

  const effectiveGuideId = guide?.id || guideId || "";
  const maxParticipants = guide?.max_participants || 10;
  const serviceAreas = guide?.service_areas || [];
  const inclusions = guide?.inclusions || [];

  // Minimum booking date: 24 hours ahead (enforcing minimum notice)
  const minBookingDate = useMemo(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  // Form states
  const [duration, setDuration] = useState(2);
  const [date, setDate] = useState(minBookingDate);
  const [time, setTime] = useState("10:00");
  const [participants, setParticipants] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const total = duration * hourlyRate;

  // Format start and end time previews
  const getEndTimeString = (timeStr: string, durationHours: number) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    const endHours = (hours + durationHours) % 24;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const period = endHours >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
    const displayHours = endHours % 12 || 12;
    return `${displayHours}:${pad(minutes)} ${period}`;
  };

  const getStartTimeFormatted = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    const period = hours >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
    const displayHours = hours % 12 || 12;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${displayHours}:${pad(minutes)} ${period}`;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !meetingPoint.trim()) {
      setError(m.invalidDate || (isAr ? "يرجى تعبئة جميع الحقول المطلوبة بما في ذلك نقطة اللقاء." : "Please fill all required fields."));
      return;
    }
    if (participants > maxParticipants) {
      setError(isAr ? `تنبيه: الحد الأقصى للمشاركين لدى هذا المرشد هو ${maxParticipants} أفراد.` : `Max participants for this guide is ${maxParticipants}.`);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    const finalMeetingPoint = specialNotes.trim()
      ? `${meetingPoint.trim()} | ${isAr ? "ملاحظات" : "Notes"}: ${specialNotes.trim()}`
      : meetingPoint.trim();

    const startTimeStr = `${date}T${time}:00+03:00`;
    const formData = new FormData();
    formData.set("start_time", startTimeStr);
    formData.set("guide_id", effectiveGuideId);
    formData.set("duration_hours", duration.toString());
    formData.set("participants", participants.toString());
    formData.set("meeting_point", finalMeetingPoint.slice(0, 480));

    startTransition(async () => {
      const res = await createBooking(formData);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message || m.errorMessage);
        setStep(1);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="dashboard-card text-center" style={{ maxWidth: "640px", margin: "2rem auto", padding: "3rem 2rem" }}>
        <div 
          style={{ 
            width: "72px", 
            height: "72px", 
            borderRadius: "50%", 
            background: "rgba(14, 53, 38, 0.1)", 
            color: "var(--color-primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 1.5rem" 
          }}
        >
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>

        <h2 style={{ fontSize: "1.8rem", color: "var(--foreground)", margin: "0 0 10px", fontWeight: 800 }}>
          {isAr ? "تم إرسال طلب الحجز بنجاح!" : "Booking Request Sent!"}
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
          {isAr 
            ? "تم إشعار المرشد بطلبك بنجاح. سيقوم المرشد بمراجعة التوفر والموافقة على موعد الجولة. يمكنك متابعة حالة طلبك والتواصل عبر المحادثة من صفحة حسابك."
            : "Your request has been delivered to the guide. The guide will review schedule and confirm. You can monitor the request and chat in your account."}
        </p>

        {/* Request Summary Receipt */}
        <div style={{ background: "var(--background-alt)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", textAlign: isAr ? "right" : "left", marginBottom: "2rem" }}>
          {guide && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                {guide.avatar_url ? (
                  <Image src={guide.avatar_url} alt={guide.display_name} width={36} height={36} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  guide.display_name[0]
                )}
              </div>
              <div>
                <strong style={{ fontSize: "0.95rem", display: "block" }}>{guide.display_name}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{guide.city}</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "الموعد المقترح:" : "Scheduled Time:"}</span>
            <strong>{date} ({getStartTimeFormatted(time)} - {getEndTimeString(time, duration)})</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "المدة وعدد الأفراد:" : "Duration & Guests:"}</span>
            <strong>{duration} {m.hours} • {participants} {isAr ? "أشخاص" : "guests"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "نقطة اللقاء:" : "Meeting Point:"}</span>
            <strong style={{ maxWidth: "260px", textAlign: isAr ? "left" : "right" }}>{meetingPoint}</strong>
          </div>
          {specialNotes.trim() && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--muted)" }}>{isAr ? "طلبات خاصة:" : "Special Requests:"}</span>
              <span style={{ maxWidth: "260px", textAlign: isAr ? "left" : "right", color: "var(--muted)" }}>{specialNotes}</span>
            </div>
          )}
          <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>
            <span>{m.totalPrice}</span>
            <span>{total} SAR</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <button 
            onClick={() => router.push(`/${locale}/account`)} 
            className="button button-primary"
            style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "1.05rem" }}
          >
            <span>{isAr ? "الانتقال إلى حجوزاتي في حسابي" : "Go to My Bookings"}</span>
            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
          <Link 
            href={`/${locale}/guides`}
            className="button"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}
          >
            <span>{isAr ? "استعراض المزيد من المرشدين" : "Browse More Guides"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-form dashboard-card" style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 2rem" }}>
      {/* Guide Snapshot Card */}
      {guide && (
        <div style={{ padding: "1.25rem", marginBottom: "2rem", borderRadius: "16px", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                {guide.avatar_url ? (
                  <Image src={guide.avatar_url} alt={guide.display_name} width={56} height={56} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  guide.display_name[0]
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{guide.display_name}</h3>
                  <span style={{ fontSize: "0.75rem", background: "rgba(14, 53, 38, 0.1)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "999px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={12} />
                    <span>{isAr ? "مرشد مرخص" : "Licensed Guide"}</span>
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} style={{ color: "var(--color-primary)" }} />
                  <span>{guide.city}</span>
                  {guide.service_areas?.length > 0 && (
                    <span>• ({guide.service_areas.slice(0, 3).join("، ")})</span>
                  )}
                </p>
                {guide.languages?.length > 0 && (
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Languages size={12} />
                    <span>{guide.languages.join(" • ")}</span>
                  </p>
                )}
              </div>
            </div>

            <div style={{ textAlign: isAr ? "left" : "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{isAr ? "سعر الساعة" : "Rate"}</span>
              <strong style={{ fontSize: "1.4rem", color: "var(--color-primary)" }}>{guide.hourly_rate}</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginInlineStart: "4px" }}>SAR / {isAr ? "ساعة" : "hr"}</span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 500 }}>
                {isAr ? `سعة الجولة: حتى ${maxParticipants} أفراد` : `Capacity: up to ${maxParticipants}`}
              </span>
            </div>
          </div>

          {/* Inclusions tags */}
          {inclusions.length > 0 && (
            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={13} />
                <span>{isAr ? "تشمل الجولة:" : "Includes:"}</span>
              </span>
              {inclusions.map((inc, i) => (
                <span key={i} style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "6px", background: "var(--color-surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  ✓ {inc}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Steps Stepper Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              background: step === 1 ? "var(--color-primary)" : "var(--background-alt)",
              color: step === 1 ? "white" : "var(--muted)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontWeight: 700, 
              fontSize: "0.9rem" 
            }}
          >
            1
          </div>
          <span style={{ fontWeight: step === 1 ? 700 : 500, color: step === 1 ? "var(--foreground)" : "var(--muted)", fontSize: "0.95rem" }}>
            {m.touristDetails}
          </span>
        </div>

        <div style={{ width: "40px", height: "2px", background: "var(--border)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              background: step === 2 ? "var(--color-primary)" : "var(--background-alt)",
              color: step === 2 ? "white" : "var(--muted)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontWeight: 700, 
              fontSize: "0.9rem" 
            }}
          >
            2
          </div>
          <span style={{ fontWeight: step === 2 ? 700 : 500, color: step === 2 ? "var(--foreground)" : "var(--muted)", fontSize: "0.95rem" }}>
            {m.summaryTitle}
          </span>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNextStep} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Date & Time with Live Time Range */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                  <Calendar size={15} style={{ color: "var(--color-primary)" }} />
                  <span>{m.dateLabel} *</span>
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{isAr ? "قبل 24 ساعة كحد أدنى" : "24h notice"}</span>
              </div>
              <input 
                type="date" 
                value={date} 
                min={minBookingDate} 
                onChange={e => {
                  setError(null);
                  setDate(e.target.value);
                }} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                  <Clock size={15} style={{ color: "var(--color-primary)" }} />
                  <span>{m.startTimeLabel} *</span>
                </label>
                {date && time && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600 }}>
                    {getStartTimeFormatted(time)} - {getEndTimeString(time, duration)}
                  </span>
                )}
              </div>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>
          </div>

          {/* Duration & Participants with Stepper buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                  <Clock size={15} style={{ color: "var(--color-primary)" }} />
                  <span>{m.durationLabel} ({m.hours}) *</span>
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{isAr ? "1 إلى 12 ساعة" : "1 to 12 hrs"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-alt)", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max="12" 
                  value={duration} 
                  onChange={e => setDuration(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))} 
                  required 
                  style={{ textAlign: "center", fontWeight: 700 }}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setDuration(Math.min(12, duration + 1))}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-alt)", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                  <Users size={15} style={{ color: "var(--color-primary)" }} />
                  <span>{m.participantsLabel} *</span>
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600 }}>
                  {isAr ? `الحد الأقصى: ${maxParticipants} أفراد` : `Max: ${maxParticipants}`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-alt)", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={maxParticipants}
                  value={participants} 
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    if (val > maxParticipants) {
                      setError(isAr ? `تنبيه: الحد الأقصى للمشاركين لدى هذا المرشد هو ${maxParticipants} أفراد.` : `Max participants for this guide is ${maxParticipants}.`);
                    } else {
                      setError(null);
                    }
                    setParticipants(Math.min(maxParticipants, Math.max(1, val)));
                  }} 
                  required 
                  style={{ textAlign: "center", fontWeight: 700 }}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (participants >= maxParticipants) {
                      setError(isAr ? `لقد وصلت للحد الأقصى المسموح لدى هذا المرشد (${maxParticipants} أفراد).` : `Reached maximum participants allowed (${maxParticipants}).`);
                      return;
                    }
                    setError(null);
                    setParticipants(participants + 1);
                  }}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background-alt)", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Meeting Point with Quick Suggestions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                <MapPin size={15} style={{ color: "var(--color-primary)" }} />
                <span>{m.meetingPointLabel} *</span>
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{meetingPoint.length}/200</span>
            </div>

            {/* Quick tags from guide service areas */}
            {serviceAreas.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  {isAr ? "اقتراحات سريعة لنقاط الالتقاء يفضلها المرشد:" : "Quick suggestions from guide's areas:"}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {serviceAreas.map((area, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMeetingPoint(area)}
                      style={{ 
                        fontSize: "0.8rem", 
                        padding: "5px 12px", 
                        borderRadius: "8px", 
                        border: "1px solid", 
                        borderColor: meetingPoint === area ? "var(--color-primary)" : "var(--border)",
                        background: meetingPoint === area ? "var(--color-primary)" : "var(--background-alt)",
                        color: meetingPoint === area ? "#fff" : "var(--foreground)",
                        cursor: "pointer",
                        fontWeight: meetingPoint === area ? 600 : 400
                      }}
                    >
                      📍 {area}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input 
              type="text" 
              placeholder={m.meetingPointPlaceholder} 
              value={meetingPoint} 
              onChange={e => setMeetingPoint(e.target.value)} 
              required 
              maxLength={200}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
            />
          </div>

          {/* Optional Special Requests */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px" }}>
              <MessageSquare size={15} style={{ color: "var(--color-primary)" }} />
              <span>{isAr ? "ملاحظات أو رغبات خاصة (اختياري)" : "Special Requests or Preferences (Optional)"}</span>
            </label>
            <textarea
              rows={2}
              placeholder={isAr ? "مثال: معنا أطفال / نفضل التركيز على التصوير المعماري / تفضيل سيارة دفع رباعي..." : "e.g. Traveling with kids, interested in photography, hotel pickup..."}
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              maxLength={200}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              style={{ resize: "none" }}
            />
          </div>

          {/* Real-time estimate banner */}
          <div style={{ background: "var(--background-alt)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
                {isAr ? "تفصيل التكلفة التقديرية:" : "Estimated Breakdown:"}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                {duration} {isAr ? "ساعات" : "hours"} × {hourlyRate} SAR
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <strong style={{ fontSize: "1.6rem", color: "var(--color-primary)", fontWeight: 800 }}>{total}</strong>
              <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>SAR</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="button button-primary" 
            style={{ marginTop: "0.5rem", padding: "16px", fontSize: "1.05rem", justifyContent: "center" }}
          >
            <span>{isAr ? "التالي: مراجعة الطلب" : "Next: Review Request"}</span>
            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </form>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <div style={{ background: "var(--background-alt)", padding: "1.75rem", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <h3 style={{ margin: "0 0 1.25rem", color: "var(--color-primary)", fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} />
              <span>{m.summaryTitle}</span>
            </h3>
            
            {guide && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--muted)" }}>{m.guideName}</span>
                <strong>{guide.display_name} ({guide.city})</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.dateLabel}</span>
              <strong>{date} ({getStartTimeFormatted(time)} - {getEndTimeString(time, duration)})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.meetingPointLabel}</span>
              <strong style={{ maxWidth: "260px", textAlign: isAr ? "left" : "right" }}>{meetingPoint}</strong>
            </div>
            {specialNotes.trim() && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--muted)" }}>{isAr ? "طلبات خاصة:" : "Special Requests:"}</span>
                <span style={{ maxWidth: "260px", textAlign: isAr ? "left" : "right", color: "var(--muted)" }}>{specialNotes}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.durationLabel}</span>
              <strong>{duration} {m.hours}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.participantsLabel}</span>
              <strong>{participants} {isAr ? "أفراد" : "participants"}</strong>
            </div>
            
            <div style={{ height: "1px", background: "var(--border)", margin: "16px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{m.totalPrice}</span>
              <div>
                <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)" }}>{total}</span>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginInlineStart: "4px" }}>SAR</span>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(14, 53, 38, 0.05)", border: "1px solid rgba(14, 53, 38, 0.15)", borderRadius: "12px", padding: "1.2rem", display: "flex", gap: "10px", alignItems: "start" }}>
            <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.6, margin: 0 }}>
              {isAr 
                ? "بإرسالك لهذا الطلب، فإنك ترسل طلباً للمرشد لمراجعته والتأكد من التوفر. لن يتم خصم أي مبالغ مالية حتى يوافق المرشد رسمياً على الموعد."
                : "Submitting this request notifies the guide for approval. No charge will be made until the guide explicitly confirms availability."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="button" 
              style={{ flex: 1, justifyContent: "center" }}
              disabled={isPending}
            >
              {isAr ? "تعديل التفاصيل" : "Edit Details"}
            </button>
            <button 
              onClick={handleSubmit} 
              className="button button-primary" 
              disabled={isPending} 
              style={{ flex: 2, justifyContent: "center", padding: "16px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isAr ? "جاري الإرسال..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{m.submitRequest}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
