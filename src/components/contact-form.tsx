"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function ContactForm({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "booking",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-[var(--color-primary)]">
          {isAr ? "تم استلام رسالتك بنجاح!" : "Message Received!"}
        </h3>
        <p className="text-[var(--muted)] text-sm max-w-md mx-auto leading-relaxed">
          {isAr 
            ? "شكراً لتواصلك مع نديم. سيقوم أحد ممثلي خدمة العملاء بالرد عليك عبر البريد الإلكتروني في أقرب وقت ممكن."
            : "Thank you for reaching out to Nadeem. A team member will respond to your email as soon as possible."}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", phone: "", topic: "booking", message: "" });
          }}
          className="button button-primary text-sm px-6 py-2.5 mt-2"
        >
          {isAr ? "إرسال رسالة أخرى" : "Send Another Message"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            {isAr ? "الاسم الكامل" : "Full Name"} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={isAr ? "مثال: عبد الله السالم" : "e.g. John Doe"}
            className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            {isAr ? "البريد الإلكتروني" : "Email Address"} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            {isAr ? "رقم الجوال (اختياري)" : "Phone Number (Optional)"}
          </label>
          <input
            type="tel"
            dir="ltr"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+966 5X XXX XXXX"
            className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition text-start"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            {isAr ? "موضوع الاستفسار" : "Topic"} *
          </label>
          <select
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition cursor-pointer"
          >
            <option value="booking">{isAr ? "حجز جولة سياحية" : "Tour Booking"}</option>
            <option value="guide">{isAr ? "انضمام كمرشد سياحي" : "Become a Guide"}</option>
            <option value="support">{isAr ? "دعم فني واستفسارات" : "Technical Support"}</option>
            <option value="suggestion">{isAr ? "ملاحظة أو اقتراح" : "Feedback / Suggestion"}</option>
            <option value="other">{isAr ? "أخرى" : "Other"}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
          {isAr ? "نص الرسالة" : "Your Message"} *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={isAr ? "اكتب تفاصيل استفسارك أو طلبك هنا..." : "Write your message or inquiry details here..."}
          className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-primary)] transition resize-vertical"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="button button-primary w-full justify-center text-base font-semibold py-3.5 shadow-md"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>{isAr ? "جارٍ الإرسال..." : "Sending..."}</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>{isAr ? "إرسال الرسالة" : "Send Message"}</span>
          </>
        )}
      </button>
    </form>
  );
}
