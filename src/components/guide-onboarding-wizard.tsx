"use client";

import { useActionState, useState } from "react";
import { saveGuide } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";
import { GuideFileUpload } from "./guide-file-upload";
import { type GuideProfile } from "./auth-forms";
import Link from "next/link";
import { 
  User, 
  Camera, 
  FileCheck, 
  Languages as LanguagesIcon, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Edit3,
  ExternalLink,
  Lightbulb
} from "lucide-react";

interface GuideOnboardingWizardProps {
  locale: Locale;
  name: string;
  guide: GuideProfile;
}

export function GuideOnboardingWizard({ locale, name, guide }: GuideOnboardingWizardProps) {
  const m = authMessages(locale);
  const isAr = locale === "ar";
  const [state, action, pending] = useActionState(saveGuide.bind(null, locale), {});

  // Stepper state
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(guide.status === "draft" || guide.status === "rejected");

  // Interactive form helper states
  const [selectedCity, setSelectedCity] = useState(guide.city || "الرياض");
  const [hourlyRate, setHourlyRate] = useState(guide.hourly_rate || 150);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    guide.languages && guide.languages.length > 0 ? guide.languages : ["العربية"]
  );
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>(
    guide.inclusions && guide.inclusions.length > 0 ? guide.inclusions : [isAr ? "ضيافة سعودية" : "Saudi hospitality", isAr ? "مياه ومشروبات" : "Water & beverages"]
  );

  const saudiCities = isAr ? [
    "الرياض", "العلا", "جدة", "أبها", "الدمام", "مكة المكرمة", "المدينة المنورة", "الطائف", "حائل", "تبوك", "جازان"
  ] : [
    "Riyadh", "AlUla", "Jeddah", "Abha", "Dammam", "Makkah", "Madinah", "Taif", "Hail", "Tabuk", "Jazan"
  ];

  const popularLanguages = isAr ? [
    "العربية", "الإنجليزية", "الفرنسية", "الإسبانية", "الألمانية", "الصينية", "الروسية", "الأوردو"
  ] : [
    "Arabic", "English", "French", "Spanish", "German", "Chinese", "Russian", "Urdu"
  ];

  const popularInclusions = isAr ? [
    "ضيافة سعودية (قهوة وتمر)", "مياه ومرطبات", "تذاكر الدخول للمواقع", "سيارة تنقل خاصة", "تصوير تذكاري", "شرح وتوثيق تاريخي"
  ] : [
    "Saudi Hospitality (Coffee & Dates)", "Bottled Water & Refreshments", "Site Entrance Tickets", "Private Transport", "Photos & Souvenirs", "Historical Storytelling"
  ];

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleInclusion = (inc: string) => {
    setSelectedInclusions(prev => 
      prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
    );
  };

  const stepsMeta = [
    { num: 1, title: isAr ? "البيانات الشخصية" : "Personal Info", desc: isAr ? "الهوية ومطابقة الاسم" : "Identity & Names", icon: User },
    { num: 2, title: isAr ? "الصورة الشخصية" : "Profile Photo", desc: isAr ? "صورتك المهنية" : "Professional Portrait", icon: Camera },
    { num: 3, title: isAr ? "الوثائق والتراخيص" : "Credentials", desc: isAr ? "رخصة السياحة والهوية" : "Tourism License & ID", icon: FileCheck },
    { num: 4, title: isAr ? "اللغات والخبرة" : "Languages", desc: isAr ? "اللغات والشهادات" : "Languages & Skills", icon: LanguagesIcon },
    { num: 5, title: isAr ? "التسعير والنبذة" : "Pricing & Bio", desc: isAr ? "الأسعار ومشمولات الجولة" : "Rates & Inclusions", icon: Sparkles },
  ];

  // If guide is in pending_review or approved and not explicitly editing, show the status hub!
  if (!isEditing && guide.status === "pending_review") {
    return (
      <div className="status-hub-card">
        <div className="status-hub-badge-wrap">
          <Clock size={40} className="animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          {isAr ? "طلبك قيد المراجعة والتدقيق الرسمي" : "Your Application is Under Review"}
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
          {isAr 
            ? "شكراً لانضمامك إلى نديم! يقوم فريق الجودة والاعتماد بمطابقة وثائقك ورخصة الإرشاد السياحي الصادرة عن وزارة السياحة."
            : "Thank you for joining Nadeem! Our verification team is currently verifying your credentials and tourism license."}
        </p>

        {/* Verification Timeline */}
        <div className="status-timeline">
          <div className="timeline-step done">
            <div className="timeline-icon">
              <Check size={18} />
            </div>
            <div className="timeline-content">
              <h4>{isAr ? "1. استلام الطلب والبيانات الشخصية" : "1. Application Received"}</h4>
              <p>{isAr ? "تم تسجيل بياناتك ورفع المستندات بنجاح." : "Personal info and documents uploaded."}</p>
            </div>
          </div>

          <div className="timeline-step current">
            <div className="timeline-icon">
              <Clock size={18} />
            </div>
            <div className="timeline-content">
              <h4>{isAr ? "2. مطابقة رخصة الإرشاد السياحي والهوية" : "2. Document & License Verification"}</h4>
              <p>{isAr ? "جاري الفحص الأمني والمهني من قبل إدارة المنصة." : "Official verification currently in progress."}</p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="timeline-icon">
              <Sparkles size={18} />
            </div>
            <div className="timeline-content">
              <h4>{isAr ? "3. اعتماد الملف وبدء استقبال الحجوزات" : "3. Approval & Go Live"}</h4>
              <p>{isAr ? "سيظهر ملفك في دليل المرشدين السياحيين وتتمكن من استقبال السياح." : "Your profile will be public for tourists to book tours."}</p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] max-w-lg mx-auto text-start mb-6">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-[var(--color-primary)]">
            <ShieldCheck size={18} />
            <span>{isAr ? "ملخص البيانات المرسلة للاعتماد:" : "Submitted Profile Summary:"}</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "الاسم العربي:" : "Arabic Name:"}</span>
              <span className="font-semibold">{guide.full_name_ar || name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "المدينة الأساسية:" : "Primary City:"}</span>
              <span className="font-semibold">{guide.city || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "السعر بالساعة:" : "Hourly Rate:"}</span>
              <span className="font-semibold">{guide.hourly_rate} SAR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "رخصة الإرشاد السياحي:" : "Tourism License:"}</span>
              <span className="text-emerald-700 font-semibold">{guide.official_license_url ? (isAr ? "مرفقة ومؤمنة ✓" : "Attached ✓") : "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--muted)]">{isAr ? "الهوية الوطنية:" : "National ID:"}</span>
              <span className="text-emerald-700 font-semibold">{guide.national_id_url ? (isAr ? "مرفقة ومؤمنة ✓" : "Attached ✓") : "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsEditing(true)}
            className="button"
          >
            <Edit3 size={16} />
            <span>{isAr ? "تعديل البيانات وإعادة الإرسال" : "Edit Application"}</span>
          </button>
          <Link href={`/${locale}`} className="button button-primary">
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // If approved
  if (!isEditing && guide.status === "approved") {
    return (
      <div className="status-hub-card">
        <div className="status-hub-badge-wrap approved">
          <Check size={40} />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          {isAr ? "تهانينا! حسابك معتمد رسمياً في نديم 🎉" : "Congratulations! Your Profile is Approved 🎉"}
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed mb-6">
          {isAr 
            ? "أصبحت الآن مرشداً سياحياً معتمداً في منصة نديم. ملفك متاح للزوار والسياح لحجز جولات أصيلة وتجارب لا تُنسى."
            : "You are now an officially certified tour guide on Nadeem. Travelers from all over the world can book your tours."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/guides/${guide.user_id}`} className="button button-primary">
            <ExternalLink size={16} />
            <span>{isAr ? "عرض ملفك كما يراه السياح" : "View Public Profile"}</span>
          </Link>
          <button onClick={() => setIsEditing(true)} className="button">
            <Edit3 size={16} />
            <span>{isAr ? "تحديث بيانات الملف" : "Update Profile"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Wizard Stepper
  return (
    <div className="wizard-card">
      {/* Rejection Alert if applicable */}
      {guide.status === "rejected" && guide.review_reason && (
        <div className="p-4 mb-8 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h4 className="font-bold text-red-900 m-0 mb-1">{isAr ? "ملاحظات فريق الاعتماد على طلبك:" : "Feedback from Review Team:"}</h4>
            <p className="m-0 leading-relaxed">{guide.review_reason}</p>
            <span className="text-xs text-red-700 mt-2 block font-medium">
              {isAr ? "يُرجى تصحيح الملاحظات المذكورة وإعادة إرسال الملف للمراجعة." : "Please correct these points and re-submit your profile."}
            </span>
          </div>
        </div>
      )}

      {/* Stepper Header */}
      <div className="wizard-stepper-header">
        <div className="wizard-progress-track">
          <div 
            className="wizard-progress-bar"
            style={{ width: `${((step - 1) / (stepsMeta.length - 1)) * 100}%` }}
          />
        </div>

        <ul className="wizard-steps-list">
          {stepsMeta.map((s) => {
            const isPassed = step > s.num;
            const isCurrent = step === s.num;

            return (
              <li key={s.num}>
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`wizard-step-node ${isCurrent ? "active" : ""} ${isPassed ? "completed" : ""}`}
                >
                  <div className="wizard-node-circle">
                    {isPassed ? <Check size={18} /> : s.num}
                  </div>
                  <span className="wizard-node-label">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <form action={action} className="space-y-8">
        {/* Step 1: Identity & Personal Information */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "1. البيانات الشخصية ومطابقة الهوية" : "1. Personal Information & Identity"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr ? "احرص على تطابق الأسماء مع وثائقك الرسمية لسرعة الاعتماد." : "Ensure your names match official identification documents."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1.5">{isAr ? "الاسم الأول" : "First Name"} *</label>
                <input 
                  name="first_name" 
                  defaultValue={guide.first_name || ""} 
                  placeholder={isAr ? "مثال: عبد الله" : "e.g., Abdullah"}
                  required 
                  maxLength={50}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5">{isAr ? "اسم العائلة" : "Last Name"} *</label>
                <input 
                  name="last_name" 
                  defaultValue={guide.last_name || ""} 
                  placeholder={isAr ? "مثال: الغامدي" : "e.g., Alghamdi"}
                  required 
                  maxLength={50}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">{isAr ? "الاسم الكامل (مطابق للهوية باللغة العربية)" : "Full Name (Arabic)"} *</label>
              <input 
                name="full_name_ar" 
                defaultValue={guide.full_name_ar || name} 
                placeholder={isAr ? "الاسم الثلاثي أو الرباعي كما في الهوية الوطنية" : "Full name in Arabic"}
                required 
                maxLength={120}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">{isAr ? "الاسم الكامل (مطابق لجواز السفر بالإنجليزية)" : "Full Name (English)"} *</label>
              <input 
                name="full_name_en" 
                defaultValue={guide.full_name_en || ""} 
                placeholder="Full name as written on passport / official license"
                dir="ltr"
                required 
                maxLength={120}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] font-sans"
              />
            </div>

            {/* City Selector */}
            <div>
              <label className="text-xs font-bold block mb-2">{isAr ? "المدينة الأساسية للإرشاد" : "Primary City"} *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {saudiCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCity(c)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition ${selectedCity === c ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--border)] hover:bg-[var(--background-alt)]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input 
                name="city" 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder={isAr ? "أو اكتب مدينتك هنا..." : "Or type city name..."}
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">{isAr ? "مناطق وأحياء الخدمة (مفصولة بفاصلة)" : "Service Areas"} *</label>
              <input 
                name="service_areas" 
                defaultValue={(guide.service_areas || []).join(", ")} 
                placeholder={isAr ? "مثال: الدرعية، البجيري، وادي حنيفة، وسط الرياض" : "e.g., Diriyah, Bujairi Terrace, Historic Center"}
                required 
                maxLength={200}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">{isAr ? "تفاصيل العنوان الوطني / المدينة والحي" : "National Address"} *</label>
              <textarea 
                name="address_details" 
                defaultValue={typeof guide.address_details === "string" ? guide.address_details : JSON.stringify(guide.address_details || {})}
                rows={2}
                placeholder={isAr ? "المدينة، الحي، اسم الشارع، الرمز البريدي" : "City, District, Street name, Postal code"}
                required 
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            <input type="hidden" name="name" value={name} />
          </div>
        )}

        {/* Step 2: Professional Profile Photo */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "2. الصورة الشخصية المهنية" : "2. Professional Profile Photo"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr 
                  ? "صورتك هي أول انطباع يراه السائح! اختر صورة رسمية واضحة تُمثّل الضيافة السعودية بكبرياء وأناقة."
                  : "Your photo is your first impression. Choose a high-quality, welcoming portrait."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] space-y-4">
              <GuideFileUpload 
                name="personal_photo_url" 
                label={isAr ? "الصورة الشخصية (مطلوبة للظهور في الدليل)" : "Profile Portrait"}
                defaultValue={guide.personal_photo_url || guide.avatar_url}
                acceptedTypes="image/jpeg, image/png, image/webp"
                hint={isAr ? "أبعاد مفضلة: مربعة، دقة واضحة" : "Preferred: Square, clear lighting"}
              />

              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] text-xs text-[var(--muted)] space-y-1">
                <span className="font-bold text-[var(--color-text)] flex items-center gap-1.5 mb-1">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>{isAr ? "إرشادات الصورة المعتمدة:" : "Photo guidelines:"}</span>
                </span>
                <p className="m-0">• {isAr ? "وجه مبتسم وواضح في منتصف الإطار وبإضاءة جيدة." : "Clear face, centered, good lighting."}</p>
                <p className="m-0">• {isAr ? "الزي الوطني السعودي الرسمي أو زي مهني لائق." : "Traditional Saudi attire or professional outfit."}</p>
                <p className="m-0">• {isAr ? "تجنب النظارات الشمسية أو الفلاتر القوية." : "Avoid dark sunglasses or heavy filters."}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Official Verification Documents */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "3. الوثائق والتراخيص الرسمية" : "3. Official Licensing & Identification"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr 
                  ? "تلتزم منصة نديم باللوائح المعتمدة لوزارة السياحة في المملكة العربية السعودية لضمان أعلى معايير الجودة والأمان."
                  : "Nadeem adheres strictly to Ministry of Tourism regulations in Saudi Arabia."}
              </p>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0" />
              <div>
                <span className="font-bold block">{isAr ? "خصوصيتك وأمان وثائقك أولوية قصوى:" : "Your privacy is encrypted and secured:"}</span>
                <span>{isAr ? "جميع الملفات المرفوعة مشفرة في مخزن سحابي خاص ولا تظهر في حسابك العام أو لأي سائح." : "All uploaded documents are encrypted in private storage and never shown publicly."}</span>
              </div>
            </div>

            <div className="space-y-6">
              <GuideFileUpload 
                name="official_license_url" 
                label={isAr ? "رخصة الإرشاد السياحي (الصادرة عن وزارة السياحة)" : "Official Tour Guide License (Ministry of Tourism)"}
                required
                defaultValue={guide.official_license_url}
                acceptedTypes="image/jpeg, image/png, application/pdf"
                hint={isAr ? "صورة واضحة للرخصة سارية المفعول" : "Clear scan of valid license"}
              />

              <GuideFileUpload 
                name="national_id_url" 
                label={isAr ? "الهوية الوطنية / الإقامة / جواز السفر" : "National ID / Iqama / Passport"}
                required
                defaultValue={guide.national_id_url}
                acceptedTypes="image/jpeg, image/png, application/pdf"
                hint={isAr ? "صورة الوثيقة الرسمية للمطابقة" : "Official identity document"}
              />
            </div>
          </div>
        )}

        {/* Step 4: Languages & Credentials */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "4. اللغات والشهادات المعتمدة" : "4. Languages & Certifications"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr ? "حدد اللغات التي تتحدثها بطلاقة لتمكين السياح الأجانب والمحليين من العثور عليك بسهولة." : "Select the languages you speak fluently to match with global travelers."}
              </p>
            </div>

            {/* Language Selection Chips */}
            <div>
              <label className="text-xs font-bold block mb-2">{isAr ? "اختر اللغات التي تتقنها:" : "Languages Spoken:"} *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {popularLanguages.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${isSelected ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--border)] hover:bg-[var(--background-alt)]"}`}
                    >
                      {isSelected && <Check size={13} />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
              <input 
                name="languages" 
                value={selectedLanguages.join(", ")}
                onChange={(e) => setSelectedLanguages(e.target.value.split(",").map(s => s.trim()))}
                required
                placeholder={isAr ? "أو أضف لغات أخرى مفصولة بفاصلة..." : "Or type other languages..."}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            {/* Language Certificates Upload */}
            <div className="pt-2">
              <GuideFileUpload 
                name="language_certificates" 
                label={isAr ? "شهادات إتقان اللغات (اختياري / يُوصى به)" : "Language Proficiency Certificates (Optional)"}
                defaultValue={typeof guide.language_certificates === 'string' ? guide.language_certificates : (guide.language_certificates as { url?: string } | null | undefined)?.url}
                acceptedTypes="image/jpeg, image/png, application/pdf"
                hint={isAr ? "مثل: IELTS, TOEFL, DELE أو شهادات جامعية" : "e.g., IELTS, TOEFL, DELE or diploma"}
              />
            </div>
          </div>
        )}

        {/* Step 5: Bio, Pricing & Inclusions */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "5. النبذة التعريفية، الخدمات والتسعير" : "5. Bio, Services & Pricing"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr ? "شارك قصتك وشغفك ببلادك وحدد أسعارك وسعة المجموعة للجولة." : "Share your story and set your tour rates and inclusions."}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">{isAr ? "نبذة عنك وعن جولتك السياحية" : "Bio & Local Story"} *</label>
              <textarea 
                name="bio" 
                defaultValue={guide.bio || ""} 
                rows={5}
                required
                maxLength={2000}
                placeholder={isAr ? "تحدث عن مسقط رأسك، شغفك بالتاريخ أو الطبيعة، أسلوبك في الإرشاد، وما الذي يجعل تجربتك مميزة عن غيرها..." : "Tell travelers about yourself, your passion for local culture, and what makes your tours unique..."}
                className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] leading-relaxed text-sm"
              />
              <span className="text-[11px] text-[var(--muted)] block mt-1">
                {isAr ? "يُنصح بكتابة نبذة مفصلة لا تقل عن 50 كلمة لبناء الثقة." : "Recommended length: 50+ words."}
              </span>
            </div>

            {/* Pricing Card with Commission Preview */}
            <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="text-xs font-bold block mb-1.5">
                    {isAr ? "السعر بالساعة (بالريال السعودي)" : "Hourly Rate (SAR)"} *
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      name="hourly_rate"
                      min="50"
                      step="10"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] font-bold text-lg"
                    />
                    <span className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">
                      SAR / hr
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] space-y-1.5 text-xs">
                  <span className="font-bold text-[var(--color-text)] block">
                    {isAr ? "حاسبة صافي الأرباح المقدرة:" : "Earnings Breakdown:"}
                  </span>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>{isAr ? "سعر الجولة للسائح:" : "Tourist pays:"}</span>
                    <span className="font-semibold">{hourlyRate} SAR</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>{isAr ? "رسوم منصة نديم (15%):" : "Platform fee (15%):"}</span>
                    <span>{(hourlyRate * 0.15).toFixed(1)} SAR</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[var(--border)] text-[var(--color-primary)] font-bold text-sm">
                    <span>{isAr ? "صافي دخلك لكل ساعة:" : "Your net payout:"}</span>
                    <span>{(hourlyRate * 0.85).toFixed(1)} SAR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Max Participants */}
            <div>
              <label className="text-xs font-bold block mb-1.5">
                {isAr ? "الحد الأقصى للمشاركين في الجولة الواحدة" : "Max Participants Per Tour"} *
              </label>
              <input 
                type="number"
                name="max_participants"
                min="1"
                max="50"
                defaultValue={guide.max_participants || 4}
                required
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>

            {/* Inclusions Chips */}
            <div>
              <label className="text-xs font-bold block mb-2">
                {isAr ? "مشمولات الخدمة والضيافة:" : "Tour Inclusions:"} *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {popularInclusions.map((inc) => {
                  const isSelected = selectedInclusions.includes(inc);
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => toggleInclusion(inc)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${isSelected ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--border)] hover:bg-[var(--background-alt)]"}`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{inc}</span>
                    </button>
                  );
                })}
              </div>
              <input 
                name="inclusions" 
                value={selectedInclusions.join(", ")}
                onChange={(e) => setSelectedInclusions(e.target.value.split(",").map(s => s.trim()))}
                required
                placeholder={isAr ? "أو اكتب مشمولات أخرى..." : "Or type other inclusions..."}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)]"
              />
            </div>
          </div>
        )}

        {/* Form Action Controls & Stepper Navigation */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={pending}
              className="button"
            >
              <ArrowRight size={16} className={isAr ? "" : "rotate-180"} />
              <span>{isAr ? "السابق" : "Previous"}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {/* Save Draft Option */}
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending}
              className="button"
            >
              {isAr ? "حفظ كمسودة" : "Save Draft"}
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="button button-primary"
              >
                <span>{isAr ? "التالي" : "Next"}</span>
                <ArrowLeft size={16} className={isAr ? "" : "rotate-180"} />
              </button>
            ) : (
              <button
                type="submit"
                name="intent"
                value="submit"
                disabled={pending}
                className="button button-primary shadow-lg"
              >
                <Check size={18} />
                <span>{isAr ? "إرسال الملف للاعتماد الرسمي" : "Submit for Official Review"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {state.error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {m[state.error] || state.error}
          </div>
        )}
        {state.success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
            {m[state.success] || state.success}
          </div>
        )}
      </form>
    </div>
  );
}
