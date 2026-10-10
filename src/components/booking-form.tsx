"use client";

import type { BookingMessages } from "@/lib/bookings/types";
import { useState, useTransition } from "react";
import { createBooking } from "@/lib/bookings/actions";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, Users, MapPin, CheckCircle2, 
  ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles 
} from "lucide-react";

export function BookingForm({ 
  guideId, 
  hourlyRate, 
  m,
  locale 
}: { 
  guideId: string; 
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

  // Form states
  const [duration, setDuration] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [participants, setParticipants] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState("");

  const total = duration * hourlyRate;
  const today = new Date().toISOString().split("T")[0];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !meetingPoint) {
      setError(m.invalidDate || (isAr ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill all required fields."));
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    const startTimeStr = `${date}T${time}:00+03:00`;
    const formData = new FormData();
    formData.set("start_time", startTimeStr);
    formData.set("guide_id", guideId);
    formData.set("duration_hours", duration.toString());
    formData.set("participants", participants.toString());
    formData.set("meeting_point", meetingPoint);

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
      <div className="dashboard-card text-center" style={{ maxWidth: "600px", margin: "2rem auto", padding: "3rem 2rem" }}>
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
        <p style={{ color: "var(--muted)", maxWidth: "440px", margin: "0 auto 2rem", lineHeight: 1.7, fontSize: "0.95rem" }}>
          {isAr 
            ? "تم إشعار المرشد بطلبك بنجاح. سيقوم المرشد بمراجعة التوفر والموافقة على موعد الجولة. يمكنك متابعة حالة طلبك وتفاصيله من خلال صفحة حسابك."
            : "Your request has been delivered to the guide. The guide will review their schedule and confirm. You can monitor the request status in your account."}
        </p>

        {/* Request Summary Receipt */}
        <div style={{ background: "var(--background-alt)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", textAlign: isAr ? "right" : "left", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "الموعد المقترح:" : "Scheduled Time:"}</span>
            <strong>{date} @ {time}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "المدة وعدد الأفراد:" : "Duration & Guests:"}</span>
            <strong>{duration} {m.hours} • {participants} {isAr ? "أشخاص" : "guests"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--muted)" }}>{isAr ? "نقطة اللقاء:" : "Meeting Point:"}</span>
            <strong style={{ maxWidth: "240px", textAlign: isAr ? "left" : "right" }}>{meetingPoint}</strong>
          </div>
          <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>
            <span>{m.totalPrice}</span>
            <span>{total} ر.س</span>
          </div>
        </div>

        <button 
          onClick={() => router.push(`/${locale}/account`)} 
          className="button button-primary"
          style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "1.05rem" }}
        >
          <span>{isAr ? "الانتقال إلى حجوزاتي في حسابي" : "Go to My Bookings"}</span>
          {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="account-form dashboard-card" style={{ maxWidth: "640px", margin: "0 auto", padding: "2.5rem" }}>
      {/* Steps Stepper Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem" }}>
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
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
                <Calendar size={15} style={{ color: "var(--color-primary)" }} />
                <span>{m.dateLabel} *</span>
              </label>
              <input 
                type="date" 
                value={date} 
                min={today} 
                onChange={e => setDate(e.target.value)} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
                <Clock size={15} style={{ color: "var(--color-primary)" }} />
                <span>{m.startTimeLabel} *</span>
              </label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
                <Clock size={15} style={{ color: "var(--color-primary)" }} />
                <span>{m.durationLabel} ({m.hours}) *</span>
              </label>
              <input 
                type="number" 
                min="1" 
                max="12" 
                value={duration} 
                onChange={e => setDuration(parseInt(e.target.value) || 1)} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
                <Users size={15} style={{ color: "var(--color-primary)" }} />
                <span>{m.participantsLabel} *</span>
              </label>
              <input 
                type="number" 
                min="1" 
                value={participants} 
                onChange={e => setParticipants(parseInt(e.target.value) || 1)} 
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
              <MapPin size={15} style={{ color: "var(--color-primary)" }} />
              <span>{m.meetingPointLabel} *</span>
            </label>
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

          {/* Real-time estimate banner */}
          <div style={{ background: "var(--background-alt)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
              {isAr ? "التكلفة التقديرية للجولة:" : "Estimated Total:"}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <strong style={{ fontSize: "1.4rem", color: "var(--color-primary)" }}>{total}</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>ر.س</span>
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
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.dateLabel}</span>
              <strong>{date} @ {time}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--muted)" }}>{m.meetingPointLabel}</span>
              <strong style={{ maxWidth: "250px", textAlign: isAr ? "left" : "right" }}>{meetingPoint}</strong>
            </div>
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
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginInlineStart: "4px" }}>ر.س</span>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(14, 53, 38, 0.05)", border: "1px solid rgba(14, 53, 38, 0.15)", borderRadius: "12px", padding: "1rem", display: "flex", gap: "10px", alignItems: "start" }}>
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
