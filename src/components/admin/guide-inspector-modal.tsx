"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { type GuideProfile } from "@/components/auth-forms";
import { getGuideDocumentSignedUrl, adminReviewGuide } from "@/lib/admin/actions";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  FileText, 
  ExternalLink, 
  Eye, 
  ShieldCheck, 
  Award,
  Loader2,
  GraduationCap,
  User
} from "lucide-react";
import Image from "next/image";
import { UserAvatar } from "@/components/user-avatar";

type ReviewedGuide = GuideProfile & { profiles: { display_name: string; avatar_url?: string | null } | null };

interface GuideInspectorModalProps {
  guide: ReviewedGuide;
  locale: Locale;
  onClose: () => void;
  onActionComplete: () => void;
}

export function GuideInspectorModal({
  guide,
  locale,
  onClose,
  onActionComplete
}: GuideInspectorModalProps) {
  const isAr = locale === "ar";
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const presetReasons = isAr ? [
    "صورة رخصة الإرشاد السياحي غير واضحة أو غير مكتملة.",
    "رخصة الإرشاد السياحي منتهية الصلاحية، يُرجى تجديدها.",
    "الاسم المسجل لا يطابق الاسم المذكور في وثيقة الهوية.",
    "صورة الهوية الوطنية أو جواز السفر غير واضحة.",
    "نبذة المرشد مختصرة جداً، نأمل تفصيل الخبرات ومناطق الإرشاد."
  ] : [
    "Tourism guide license image is blurry or incomplete.",
    "Tourism guide license has expired. Please renew.",
    "Submitted name does not match official ID document.",
    "National ID or passport scan is unreadable.",
    "Bio is too short. Please provide more details on tour experiences."
  ];

  const handleFetchDocument = async (fieldKey: string, filePath?: string) => {
    if (!filePath) return;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      window.open(filePath, "_blank");
      return;
    }
    if (docUrls[fieldKey]) {
      // Already fetched, open directly
      window.open(docUrls[fieldKey], "_blank");
      return;
    }

    setLoadingDoc(fieldKey);
    setDocErrors(prev => ({ ...prev, [fieldKey]: "" }));

    try {
      const res = await getGuideDocumentSignedUrl(filePath, locale);
      if (res.url) {
        setDocUrls(prev => ({ ...prev, [fieldKey]: res.url! }));
        window.open(res.url, "_blank");
      } else {
        setDocErrors(prev => ({ ...prev, [fieldKey]: res.error || (isAr ? "تعذر فتح المستند" : "Could not open file") }));
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Error";
      setDocErrors(prev => ({ ...prev, [fieldKey]: errorMsg }));
    } finally {
      setLoadingDoc(null);
    }
  };

  const handleDecisionSubmit = async (selectedDecision: "approved" | "rejected" | "suspended") => {
    const finalReason = reason.trim() || (selectedDecision === "approved" 
      ? (isAr ? "تم اعتماد الطلب بعد التحقق من صحة الوثائق والتراخيص." : "Approved after verifying official credentials.")
      : "");

    if ((selectedDecision === "rejected" || selectedDecision === "suspended") && !finalReason) {
      setFeedbackError(isAr ? "يرجى تحديد أو كتابة سبب الرفض/التعليق لتوضيحه للمرشد." : "Please provide a reason.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackError(null);

    try {
      await adminReviewGuide(guide.user_id, selectedDecision, finalReason, locale);
      onActionComplete();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to record decision";
      setFeedbackError(errorMsg);
      setIsSubmitting(false);
    }
  };

  const avatarUrl = guide.personal_photo_url || guide.avatar_url || guide.profiles?.avatar_url;
  const langCertPath = typeof guide.language_certificates === "string"
    ? guide.language_certificates
    : (guide.language_certificates as { url?: string; path?: string } | null | undefined)?.url ||
      (guide.language_certificates as { url?: string; path?: string } | null | undefined)?.path;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="inspector-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="inspector-modal-header">
          <div className="flex items-center gap-3">
            <UserAvatar src={avatarUrl} name={guide.profiles?.display_name || "G"} size={48} role="guide" />

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold m-0">{guide.profiles?.display_name || (isAr ? "مرشد" : "Guide")}</h3>
                <span className={`status-pill ${guide.status}`}>
                  {guide.status === "approved" && (isAr ? "معتمد" : "Approved")}
                  {guide.status === "pending_review" && (isAr ? "بانتظار التدقيق" : "Pending Review")}
                  {guide.status === "rejected" && (isAr ? "مرفوض" : "Rejected")}
                  {guide.status === "suspended" && (isAr ? "معلّق" : "Suspended")}
                  {guide.status === "draft" && (isAr ? "مسودة" : "Draft")}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0 mt-1">
                ID: <span className="font-mono">{guide.user_id}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--color-text)] hover:bg-[var(--border)] transition"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="inspector-modal-body">
          {/* Section 1: Official Identity & Match Verification */}
          <div className="doc-preview-card">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold flex items-center gap-2 m-0 text-[var(--color-primary)]">
                <ShieldCheck size={18} />
                <span>{isAr ? "مطابقة الهوية والبيانات الشخصية" : "Identity & Verification Details"}</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm">
              <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "الاسم الأول والأخير" : "First & Last Name"}</span>
                <span className="font-semibold">{guide.first_name || "—"} {guide.last_name || ""}</span>
              </div>
              <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "الاسم الكامل (مطابق للهوية العربية)" : "Full Name (Arabic)"}</span>
                <span className="font-semibold">{guide.full_name_ar || "—"}</span>
              </div>
              <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "الاسم الكامل (مطابق للجواز / الإنجليزية)" : "Full Name (English)"}</span>
                <span className="font-semibold font-sans">{guide.full_name_en || "—"}</span>
              </div>
              <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
                <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "المدينة ومناطق الخدمة" : "City & Service Areas"}</span>
                <span className="font-semibold">{guide.city || "—"} ({guide.service_areas?.join("، ") || "—"})</span>
              </div>
            </div>
          </div>

          {/* Section 2: Official Documents Inspection (With Secure Signed URL Viewer) */}
          <div className="doc-preview-card">
            <h4 className="text-base font-bold flex items-center gap-2 m-0 text-[var(--color-primary)]">
              <FileText size={18} />
              <span>{isAr ? "الوثائق والتراخيص الرسمية (معاينة مشفرة وآمنة)" : "Official Documents (Encrypted Preview)"}</span>
            </h4>
            <p className="text-xs text-[var(--muted)] m-0">
              {isAr 
                ? "يتم توليد رابط معاينة مشفر مؤقت (صالح لساعة واحدة) لفحص المستندات الرسمية لضمان الخصوصية والأمان."
                : "A temporary signed URL is generated for document inspection to protect guide privacy."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Tour Guide License */}
              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)] flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm m-0 flex items-center gap-1.5">
                      <Award size={16} className="text-[#b45309]" />
                      {isAr ? "رخصة الإرشاد السياحي (وزارة السياحة)" : "Official Tour Guide License"}
                    </h5>
                    <span className="text-xs text-[var(--muted)] mt-1 block">
                      {guide.official_license_url ? (isAr ? "ملف مرفوع ومتاح" : "Document attached") : (isAr ? "غير مرفق" : "Missing")}
                    </span>
                  </div>
                  {guide.official_license_url ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> {isAr ? "مرفوع" : "Uploaded"}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full"><XCircle size={12} /> {isAr ? "مفقود" : "Missing"}</span>
                  )}
                </div>

                {guide.official_license_url && (
                  <button
                    onClick={() => handleFetchDocument("license", guide.official_license_url)}
                    disabled={loadingDoc === "license"}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] hover:bg-[var(--border)] transition"
                  >
                    {loadingDoc === "license" ? (
                      <><Loader2 size={14} className="animate-spin" /> {isAr ? "جارٍ تجهيز الرابط..." : "Generating link..."}</>
                    ) : (
                      <><Eye size={14} /> {isAr ? "معاينة / فتح رخصة السياحة" : "Inspect License File"} <ExternalLink size={12} /></>
                    )}
                  </button>
                )}
                {docErrors["license"] && <p className="text-xs text-red-600 m-0">{docErrors["license"]}</p>}
              </div>

              {/* National ID / Passport */}
              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)] flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm m-0 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-[var(--color-primary)]" />
                      {isAr ? "الهوية الوطنية / الإقامة / الجواز" : "National ID / Passport"}
                    </h5>
                    <span className="text-xs text-[var(--muted)] mt-1 block">
                      {guide.national_id_url ? (isAr ? "ملف مرفوع ومتاح" : "Document attached") : (isAr ? "غير مرفق" : "Missing")}
                    </span>
                  </div>
                  {guide.national_id_url ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> {isAr ? "مرفوع" : "Uploaded"}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full"><XCircle size={12} /> {isAr ? "مفقود" : "Missing"}</span>
                  )}
                </div>

                {guide.national_id_url && (
                  <button
                    onClick={() => handleFetchDocument("national_id", guide.national_id_url)}
                    disabled={loadingDoc === "national_id"}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] hover:bg-[var(--border)] transition"
                  >
                    {loadingDoc === "national_id" ? (
                      <><Loader2 size={14} className="animate-spin" /> {isAr ? "جارٍ تجهيز الرابط..." : "Generating link..."}</>
                    ) : (
                      <><Eye size={14} /> {isAr ? "معاينة / فتح الهوية الوطنية" : "Inspect ID File"} <ExternalLink size={12} /></>
                    )}
                  </button>
                )}
                {docErrors["national_id"] && <p className="text-xs text-red-600 m-0">{docErrors["national_id"]}</p>}
              </div>

              {/* Language Proficiency Certificate */}
              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)] flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm m-0 flex items-center gap-1.5">
                      <GraduationCap size={16} className="text-[var(--color-primary)]" />
                      {isAr ? "شهادة إثبات إتقان اللغة" : "Language Proficiency Certificate"}
                    </h5>
                    <span className="text-xs text-[var(--muted)] mt-1 block">
                      {langCertPath ? (isAr ? "ملف مرفوع ومتاح" : "Document attached") : (isAr ? "غير مرفق (اختياري)" : "Not provided (Optional)")}
                    </span>
                  </div>
                  {langCertPath ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> {isAr ? "مرفوع" : "Uploaded"}</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{isAr ? "غير مدرج" : "None"}</span>
                  )}
                </div>

                {langCertPath && (
                  <button
                    onClick={() => handleFetchDocument("lang_cert", langCertPath)}
                    disabled={loadingDoc === "lang_cert"}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] hover:bg-[var(--border)] transition"
                  >
                    {loadingDoc === "lang_cert" ? (
                      <><Loader2 size={14} className="animate-spin" /> {isAr ? "جارٍ تجهيز الرابط..." : "Generating link..."}</>
                    ) : (
                      <><Eye size={14} /> {isAr ? "معاينة / فتح شهادة اللغة" : "Inspect Certificate"} <ExternalLink size={12} /></>
                    )}
                  </button>
                )}
                {docErrors["lang_cert"] && <p className="text-xs text-red-600 m-0">{docErrors["lang_cert"]}</p>}
              </div>

              {/* Personal Portrait Photo */}
              <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)] flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--background-alt)] flex items-center justify-center flex-shrink-0 relative">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="Profile Portrait"
                          width={40}
                          height={40}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-[var(--muted)]" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm m-0 flex items-center gap-1.5">
                        <User size={16} className="text-[var(--color-primary)]" />
                        {isAr ? "الصورة الشخصية الرسمية (بورتريه)" : "Personal Portrait Photo"}
                      </h5>
                      <span className="text-xs text-[var(--muted)] mt-1 block">
                        {avatarUrl ? (isAr ? "صورة مخصصة مرفوعة" : "Photo uploaded") : (isAr ? "غير محددة" : "None")}
                      </span>
                    </div>
                  </div>
                  {avatarUrl ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> {isAr ? "مرفوع" : "Uploaded"}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full"><AlertOctagon size={12} /> {isAr ? "غير مرفقة" : "Missing"}</span>
                  )}
                </div>

                {avatarUrl && (
                  <button
                    onClick={() => handleFetchDocument("avatar", avatarUrl)}
                    disabled={loadingDoc === "avatar"}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] hover:bg-[var(--border)] transition"
                  >
                    {loadingDoc === "avatar" ? (
                      <><Loader2 size={14} className="animate-spin" /> {isAr ? "جارٍ تجهيز الرابط..." : "Generating link..."}</>
                    ) : (
                      <><Eye size={14} /> {isAr ? "معاينة الصورة بالحجم الكامل" : "View Full Portrait"} <ExternalLink size={12} /></>
                    )}
                  </button>
                )}
                {docErrors["avatar"] && <p className="text-xs text-red-600 m-0">{docErrors["avatar"]}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Profile Bio, Pricing, and Languages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "السعر بالساعة" : "Hourly Rate"}</span>
              <p className="text-xl font-bold text-[var(--color-primary)] m-0">
                {guide.hourly_rate} <span className="text-xs font-normal">SAR</span>
              </p>
            </div>
            <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "الحد الأقصى للمشاركين" : "Max Participants"}</span>
              <p className="text-xl font-bold m-0">{guide.max_participants || 1} {isAr ? "أشخاص" : "persons"}</p>
            </div>
            <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--border)]">
              <span className="text-xs text-[var(--muted)] block mb-1">{isAr ? "اللغات المعتمدة" : "Languages"}</span>
              <p className="text-sm font-semibold m-0">{guide.languages?.join("، ") || "—"}</p>
            </div>
          </div>

          {/* Bio and Inclusions */}
          <div className="p-4 bg-[var(--background-alt)] rounded-xl border border-[var(--border)]">
            <h5 className="font-bold text-sm m-0 mb-2">{isAr ? "نبذة المرشد التعريفية" : "Guide Bio"}</h5>
            <p className="text-sm text-[var(--color-text)] leading-relaxed m-0 whitespace-pre-wrap">
              {guide.bio || (isAr ? "لم تتم إضافة نبذة بعد." : "No bio provided.")}
            </p>
          </div>

          {/* Review Decision Form */}
          <div className="p-5 bg-gradient-to-br from-[var(--background-alt)] to-[var(--color-surface)] rounded-2xl border border-[var(--border)]">
            <h4 className="font-bold text-base m-0 mb-3">{isAr ? "قرار المراجعة الإدارية" : "Review Decision & Actions"}</h4>

            {feedbackError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                {feedbackError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--muted)]">
                {isAr ? "سبب القرار / الملاحظات الموجهة للمرشد:" : "Decision Notes / Feedback for Guide:"}
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                {presetReasons.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(preset)}
                    className="text-xs py-1 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--color-surface)] hover:bg-[var(--background-alt)] text-[var(--color-text)] transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={isAr ? "اكتب توضيحاً للمرشد في حال الرفض أو التعديل، أو ملاحظات الاعتماد..." : "Enter feedback or approval remarks..."}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm outline-none focus:border-[var(--color-primary)] transition"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="inspector-modal-footer">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2.5 px-5 rounded-xl border border-[var(--border)] font-semibold text-sm hover:bg-[var(--background-alt)] transition"
          >
            {isAr ? "إغلاق" : "Cancel"}
          </button>

          <div className="flex items-center gap-3">
            {/* Reject Button */}
            {guide.status !== "rejected" && (
              <button
                type="button"
                onClick={() => handleDecisionSubmit("rejected")}
                disabled={isSubmitting}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-sm transition"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                <span>{isAr ? "رفض الطلب" : "Reject"}</span>
              </button>
            )}

            {/* Suspend Button (If already approved) */}
            {guide.status === "approved" && (
              <button
                type="button"
                onClick={() => handleDecisionSubmit("suspended")}
                disabled={isSubmitting}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-sm transition"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <AlertOctagon size={16} />}
                <span>{isAr ? "تعليق الحساب" : "Suspend"}</span>
              </button>
            )}

            {/* Approve Button */}
            {guide.status !== "approved" && (
              <button
                type="button"
                onClick={() => handleDecisionSubmit("approved")}
                disabled={isSubmitting}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--btn-primary-hover-bg)] text-[var(--color-on-primary)] font-bold text-sm shadow-md transition"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{isAr ? "اعتماد المرشد رسمياً" : "Approve Guide"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
