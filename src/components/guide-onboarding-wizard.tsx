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
  Lightbulb,
  MapPin,
  Plus,
  X,
  Building2,
  Navigation,
  MessageSquare
} from "lucide-react";

function parseInitialAddress(raw: unknown) {
  if (!raw) return { district: "", street: "", building_number: "", postal_code: "", notes: "" };
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    return {
      district: typeof obj.district === "string" ? obj.district : "",
      street: typeof obj.street === "string" ? obj.street : "",
      building_number: typeof obj.building_number === "string" ? obj.building_number : (typeof obj.building === "string" ? obj.building : ""),
      postal_code: typeof obj.postal_code === "string" ? obj.postal_code : (typeof obj.postal === "string" ? obj.postal : ""),
      notes: typeof obj.notes === "string" ? obj.notes : (typeof obj.raw === "string" ? obj.raw : ""),
    };
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "{}" || trimmed === "null" || !trimmed) {
      return { district: "", street: "", building_number: "", postal_code: "", notes: "" };
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        return parseInitialAddress(parsed);
      }
    } catch {
      return { district: trimmed, street: "", building_number: "", postal_code: "", notes: "" };
    }
  }
  return { district: "", street: "", building_number: "", postal_code: "", notes: "" };
}

const CITY_LANDMARKS: Record<string, { ar: string[]; en: string[] }> = {
  "الرياض": {
    ar: ["الدرعية التاريخية", "مطل البجيري", "وادي حنيفة", "قصر المصمك وسوق الزل", "حي السفارات (DQ)", "بوليفارد رياض سيتي", "حافة العالم", "وسط الرياض والمربع", "حي حطين والعقيق", "وادي نمار"],
    en: ["Historic Diriyah", "Bujairi Terrace", "Wadi Hanifa", "Al-Masmak & Souq Al-Zal", "Diplomatic Quarter (DQ)", "Boulevard City", "Edge of the World", "Historic Murabba", "Al-Aqiq & Hittin", "Wadi Namar"]
  },
  "Riyadh": {
    ar: ["الدرعية التاريخية", "مطل البجيري", "وادي حنيفة", "قصر المصمك وسوق الزل", "حي السفارات (DQ)", "بوليفارد رياض سيتي", "حافة العالم", "وسط الرياض والمربع", "حي حطين والعقيق", "وادي نمار"],
    en: ["Historic Diriyah", "Bujairi Terrace", "Wadi Hanifa", "Al-Masmak & Souq Al-Zal", "Diplomatic Quarter (DQ)", "Boulevard City", "Edge of the World", "Historic Murabba", "Al-Aqiq & Hittin", "Wadi Namar"]
  },
  "جدة": {
    ar: ["جدة التاريخية (البلد)", "الواجهة البحرية وكورنيش جدة", "شرم أبحر", "نافورة الملك فهد", "حي الروضة والحمراء", "سوق الشاطئ وباب مكة", "حي البساتين"],
    en: ["Historic Al-Balad", "Jeddah Waterfront & Corniche", "Obhur Creek", "King Fahd's Fountain", "Al-Rawdah & Al-Hamra", "Al-Shati & Bab Makkah", "Al-Basateen"]
  },
  "Jeddah": {
    ar: ["جدة التاريخية (البلد)", "الواجهة البحرية وكورنيش جدة", "شرم أبحر", "نافورة الملك فهد", "حي الروضة والحمراء", "سوق الشاطئ وباب مكة", "حي البساتين"],
    en: ["Historic Al-Balad", "Jeddah Waterfront & Corniche", "Obhur Creek", "King Fahd's Fountain", "Al-Rawdah & Al-Hamra", "Al-Shati & Bab Makkah", "Al-Basateen"]
  },
  "العلا": {
    ar: ["مدائن صالح (الحجر)", "البلدة القديمة بالعلا", "ديدان وجبل عكمة", "صخرة الفيل", "واحة العلا ومطل حرة عويرض", "قاعة مرايا", "سكة حديد الحجاز"],
    en: ["Hegra (Madain Saleh)", "AlUla Old Town", "Dadan & Jabal Ikmah", "Elephant Rock", "AlUla Oasis & Harrat Viewpoint", "Maraya Hall", "Hejaz Railway"]
  },
  "AlUla": {
    ar: ["مدائن صالح (الحجر)", "البلدة القديمة بالعلا", "ديدان وجبل عكمة", "صخرة الفيل", "واحة العلا ومطل حرة عويرض", "قاعة مرايا", "سكة حديد الحجاز"],
    en: ["Hegra (Madain Saleh)", "AlUla Old Town", "Dadan & Jabal Ikmah", "Elephant Rock", "AlUla Oasis & Harrat Viewpoint", "Maraya Hall", "Hejaz Railway"]
  },
  "مكة المكرمة": {
    ar: ["المنطقة المركزية المحيطة بالحرم", "جبل النور وغار حراء", "غار ثور", "المشاعر المقدسة (منى ومزدلفة)", "حي العزيزية", "متحف برج الساعة"],
    en: ["Central Haram Area", "Jabal Al-Nour & Hira Cave", "Ghar Thawr", "Holy Sites (Mina & Arafat)", "Al-Aziziyah", "Clock Tower Museum"]
  },
  "Makkah": {
    ar: ["المنطقة المركزية المحيطة بالحرم", "جبل النور وغار حراء", "غار ثور", "المشاعر المقدسة (منى ومزدلفة)", "حي العزيزية", "متحف برج الساعة"],
    en: ["Central Haram Area", "Jabal Al-Nour & Hira Cave", "Ghar Thawr", "Holy Sites (Mina & Arafat)", "Al-Aziziyah", "Clock Tower Museum"]
  },
  "المدينة المنورة": {
    ar: ["المنطقة المركزية والمسجد النبوي", "مسجد وممشى قباء", "جبل أحد وميدان الشهداء", "مسجد القبلتين ومساجد الفتح", "حي العوالي وبساتين النخيل", "سكة حديد الحجاز"],
    en: ["Central Prophet's Mosque Area", "Quba Mosque & Walkway", "Mount Uhud & Martyrs Square", "Al-Qiblatayn & Seven Mosques", "Al-Awali & Date Farms", "Hejaz Railway Museum"]
  },
  "Madinah": {
    ar: ["المنطقة المركزية والمسجد النبوي", "مسجد وممشى قباء", "جبل أحد وميدان الشهداء", "مسجد القبلتين ومساجد الفتح", "حي العوالي وبساتين النخيل", "سكة حديد الحجاز"],
    en: ["Central Prophet's Mosque Area", "Quba Mosque & Walkway", "Mount Uhud & Martyrs Square", "Al-Qiblatayn & Seven Mosques", "Al-Awali & Date Farms", "Hejaz Railway Museum"]
  },
  "أبها": {
    ar: ["السودة وجبل تهلل", "قرية رجال ألمع التراثية", "قرية المفتاحة الفنية", "ممشى الضباب وجبل ذرة", "الحبلة ومتنزه السحاب", "أبو خيال وسد أبها"],
    en: ["Al-Soudah & Mount Tahalal", "Rijal Almaa Heritage Village", "Al-Muftaha Art Village", "Fog Walkway & Green Mountain", "Al-Habala & Al-Sahab", "Abu Kheyal Park"]
  },
  "Abha": {
    ar: ["السودة وجبل تهلل", "قرية رجال ألمع التراثية", "قرية المفتاحة الفنية", "ممشى الضباب وجبل ذرة", "الحبلة ومتنزه السحاب", "أبو خيال وسد أبها"],
    en: ["Al-Soudah & Mount Tahalal", "Rijal Almaa Heritage Village", "Al-Muftaha Art Village", "Fog Walkway & Green Mountain", "Al-Habala & Al-Sahab", "Abu Kheyal Park"]
  },
  "الطائف": {
    ar: ["الهدا وجبل الهدا", "الشفا ومرتفعات الشفا", "حديقة وقصر الردف", "قصر شبرا التاريخي", "مزارع ومصانع الورد الطائفي", "سوق عكاظ التاريخي"],
    en: ["Al-Hada", "Al-Shafa Heights", "Al-Rudaf Park", "Shubra Palace", "Taif Rose Farms", "Historic Souq Okaz"]
  },
  "Taif": {
    ar: ["الهدا وجبل الهدا", "الشفا ومرتفعات الشفا", "حديقة وقصر الردف", "قصر شبرا التاريخي", "مزارع ومصانع الورد الطائفي", "سوق عكاظ التاريخي"],
    en: ["Al-Hada", "Al-Shafa Heights", "Al-Rudaf Park", "Shubra Palace", "Taif Rose Farms", "Historic Souq Okaz"]
  },
  "الدمام": {
    ar: ["كورنيش الخبر والواجهة البحرية", "مركز الملك عبدالعزيز الثقافي (إثراء)", "جزيرة المرجان بالدمام", "شاطئ نصف القمر", "القرية التراثية الشعبية", "واجهة الدمام البحرية"],
    en: ["Khobar Corniche & Waterfront", "Ithra Cultural Center (Dhahran)", "Murjan Island", "Half Moon Bay", "Heritage Village", "Dammam Seafront"]
  },
  "Dammam": {
    ar: ["كورنيش الخبر والواجهة البحرية", "مركز الملك عبدالعزيز الثقافي (إثراء)", "جزيرة المرجان بالدمام", "شاطئ نصف القمر", "القرية التراثية الشعبية", "واجهة الدمام البحرية"],
    en: ["Khobar Corniche & Waterfront", "Ithra Cultural Center (Dhahran)", "Murjan Island", "Half Moon Bay", "Heritage Village", "Dammam Seafront"]
  },
  "تبوك": {
    ar: ["وادي الديسة", "قلعة تبوك ومتحفها", "مقنا ورأس الشيخ حميد", "جبال حسمى والزيتة", "جبل اللوز", "عين السكر التاريخية"],
    en: ["Wadi Al-Disah", "Tabuk Castle", "Magna & Ras Al-Sheikh Hameed", "Hisma Desert & Mountains", "Jabal Al-Lawz", "Ain Al-Sukkar"]
  },
  "Tabuk": {
    ar: ["وادي الديسة", "قلعة تبوك ومتحفها", "مقنا ورأس الشيخ حميد", "جبال حسمى والزيتة", "جبل اللوز", "عين السكر التاريخية"],
    en: ["Wadi Al-Disah", "Tabuk Castle", "Magna & Ras Al-Sheikh Hameed", "Hisma Desert & Mountains", "Jabal Al-Lawz", "Ain Al-Sukkar"]
  },
  "حائل": {
    ar: ["جبة التاريخية وجبال أم سنمان", "قلعة عيرف التاريخية", "منتزه أجا وسلمى", "قصر القشلة الأثري", "متحف حائل الإقليمي"],
    en: ["Jubbah Rock Art", "A'arif Fort", "Aja & Salma Peaks", "Al-Qishlah Palace", "Hail Regional Museum"]
  },
  "Hail": {
    ar: ["جبة التاريخية وجبال أم سنمان", "قلعة عيرف التاريخية", "منتزه أجا وسلمى", "قصر القشلة الأثري", "متحف حائل الإقليمي"],
    en: ["Jubbah Rock Art", "A'arif Fort", "Aja & Salma Peaks", "Al-Qishlah Palace", "Hail Regional Museum"]
  },
  "جازان": {
    ar: ["جزر فرسان ومحمية فرسان", "وادي لجب الخلاب", "جبال فيفاء (جارة القمر)", "القرية التراثية بالكورنيش الجنوبي", "الواجهة البحرية بجازان"],
    en: ["Farasan Islands", "Wadi Lajab", "Fifa Mountains", "Heritage Village", "Jazan Waterfront"]
  },
  "Jazan": {
    ar: ["جزر فرسان ومحمية فرسان", "وادي لجب الخلاب", "جبال فيفاء (جارة القمر)", "القرية التراثية بالكورنيش الجنوبي", "الواجهة البحرية بجازان"],
    en: ["Farasan Islands", "Wadi Lajab", "Fifa Mountains", "Heritage Village", "Jazan Waterfront"]
  }
};

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

  // Interactive Service Areas & National Address
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>(
    guide.service_areas && guide.service_areas.length > 0 ? guide.service_areas : []
  );
  const [customAreaInput, setCustomAreaInput] = useState("");
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);

  const initialAddress = parseInitialAddress(guide.address_details);
  const [addressDistrict, setAddressDistrict] = useState(initialAddress.district);
  const [addressStreet, setAddressStreet] = useState(initialAddress.street);
  const [addressBuilding, setAddressBuilding] = useState(initialAddress.building_number);
  const [addressPostal, setAddressPostal] = useState(initialAddress.postal_code);
  const [addressNotes, setAddressNotes] = useState(initialAddress.notes);

  // Identity & Personal Information states
  const isEnglishString = (str: string) => /^[\x00-\x7F\s]+$/.test(str);
  const [firstName, setFirstName] = useState(guide.first_name || "");
  const [lastName, setLastName] = useState(guide.last_name || "");
  const [fullNameAr, setFullNameAr] = useState(
    guide.full_name_ar || (name && !isEnglishString(name) ? name : "")
  );
  const [fullNameEn, setFullNameEn] = useState(
    guide.full_name_en || (name && isEnglishString(name) ? name : "")
  );
  const [bio, setBio] = useState(guide.bio || "");
  const [maxParticipants, setMaxParticipants] = useState(guide.max_participants || 4);

  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    const expectedPrev = `${firstName} ${lastName}`.trim();
    if (!fullNameAr || fullNameAr === expectedPrev) {
      setFullNameAr(`${val} ${lastName}`.trim());
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    const expectedPrev = `${firstName} ${lastName}`.trim();
    if (!fullNameAr || fullNameAr === expectedPrev) {
      setFullNameAr(`${firstName} ${val}`.trim());
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientValidationError(null);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isSubmit = submitter?.value === "submit";

    if (isSubmit) {
      if (!fullNameAr.trim() && (!firstName.trim() || !lastName.trim()) && !name) {
        e.preventDefault();
        setStep(1);
        setClientValidationError(isAr ? "يرجى كتابة اسمك الكامل في الخطوة 1 قبل إرسال الملف للاعتماد." : "Please enter your full name in Step 1.");
        return;
      }

      if (!selectedCity.trim()) {
        e.preventDefault();
        setStep(1);
        setClientValidationError(isAr ? "يرجى تحديد مدينتك الأساسية للإرشاد في الخطوة 1." : "Please select your primary city in Step 1.");
        return;
      }

      if (!bio.trim()) {
        e.preventDefault();
        setStep(5);
        setClientValidationError(isAr ? "حقل النبذة التعريفية (في الخطوة 5) إلزامي للإرسال للاعتماد الرسمي. نأمل كتابة نبذة توضح خبرتك وجولاتك." : "The Bio field (in Step 5) is required for official submission.");
        return;
      }
    }
  };

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

  const suggestedLandmarks = CITY_LANDMARKS[selectedCity]?.[isAr ? "ar" : "en"] || 
    (isAr 
      ? ["وسط المدينة والأسواق التاريخية", "المتاحف والمعالم الثقافية", "المتنزهات الطبيعية", "البلدة القديمة", "الواجهة السياحية"] 
      : ["City Center & Markets", "Cultural Museums", "Nature Parks", "Historic Old Town", "Touristic Waterfront"]);

  const toggleServiceArea = (area: string) => {
    setSelectedServiceAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const addCustomServiceArea = () => {
    const trimmed = customAreaInput.trim();
    if (!trimmed) return;
    if (!selectedServiceAreas.includes(trimmed)) {
      setSelectedServiceAreas(prev => [...prev, trimmed]);
    }
    setCustomAreaInput("");
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
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                {guide.official_license_url ? (
                  <><Check size={13} /> {isAr ? "مرفقة ومؤمنة" : "Attached"}</>
                ) : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "الهوية الوطنية:" : "National ID:"}</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                {guide.national_id_url ? (
                  <><Check size={13} /> {isAr ? "مرفقة ومؤمنة" : "Attached"}</>
                ) : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "شهادة إتقان اللغة:" : "Language Certificate:"}</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                {guide.language_certificates ? (
                  <><Check size={13} /> {isAr ? "مرفقة ومؤمنة" : "Attached"}</>
                ) : (isAr ? "غير مدرجة (اختياري)" : "None (Optional)")}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--muted)]">{isAr ? "الصورة الشخصية (بورتريه):" : "Profile Photo:"}</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                {(guide.personal_photo_url || guide.avatar_url) ? (
                  <><Check size={13} /> {isAr ? "مرفقة ومؤمنة" : "Attached"}</>
                ) : (isAr ? "غير مرفقة" : "Not uploaded")}
              </span>
            </div>
          </div>
        </div>

        {/* Notice on Profile Lock During Pending Review */}
        <div className="p-4 mb-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 max-w-lg mx-auto text-start">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-amber-700" />
          <div>
            <span className="font-bold block mb-1">
              {isAr ? "الملف مؤمّن ومقفل مؤقتاً أثناء التدقيق الرسمي" : "Application locked during official audit"}
            </span>
            <p className="m-0 leading-relaxed text-amber-800">
              {isAr
                ? "لضمان مصداقية الفحص وتطابق السجلات، لا يمكن تعديل البيانات بينما يقوم المشرف بمراجعة طلبك. في حال وجود أي ملاحظات أو طلب استكمال، سيصلك إشعار فوري وتُتاح إمكانية التعديل وإعادة الإرسال."
                : "To maintain audit integrity, details cannot be modified while under review. If revisions or additional documents are requested, you will be notified immediately to update and resubmit."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/${locale}`} className="button button-primary">
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // If approved
  if (guide.status === "approved") {
    return (
      <div className="status-hub-card">
        <div className="status-hub-badge-wrap approved">
          <Check size={40} />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2 inline-flex items-center justify-center gap-2">
          <span>{isAr ? "تهانينا! حسابك معتمد رسمياً في نديم" : "Congratulations! Your Profile is Approved"}</span>
          <Sparkles size={22} className="text-amber-500 inline-block" />
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed mb-6">
          {isAr 
            ? "أصبحت الآن مرشداً سياحياً معتمداً في منصة نديم. ملفك متاح للزوار والسياح لحجز جولات أصيلة وتجارب لا تُنسى."
            : "You are now an officially certified tour guide on Nadeem. Travelers from all over the world can book your tours."}
        </p>

        {/* Summary of Approved Credentials */}
        <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] max-w-lg mx-auto text-start mb-6">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-emerald-700">
            <ShieldCheck size={18} />
            <span>{isAr ? "بيانات الاعتماد الرسمية الموثقة:" : "Verified Guide Credentials:"}</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "الاسم المعتمد:" : "Verified Name:"}</span>
              <span className="font-semibold">{guide.full_name_ar || name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "المدينة ومناطق الجولات:" : "City & Coverage:"}</span>
              <span className="font-semibold">{guide.city || "—"} ({guide.service_areas?.join("، ") || "—"})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "السعر بالساعة:" : "Hourly Rate:"}</span>
              <span className="font-semibold">{guide.hourly_rate} SAR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">{isAr ? "رخصة الإرشاد السياحي:" : "Tour Guide License:"}</span>
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <Check size={13} />
                {isAr ? "موثقة ومعتمدة رسمياً" : "Verified & Active"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--muted)]">{isAr ? "اللغات المعتمدة:" : "Approved Languages:"}</span>
              <span className="font-semibold">{guide.languages?.join("، ") || "—"}</span>
            </div>
          </div>
        </div>

        {/* Official Lock Notice */}
        <div className="p-4 mb-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] text-xs flex items-start gap-3 max-w-lg mx-auto text-start">
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-[var(--color-primary)]" />
          <div>
            <span className="font-bold block mb-1 text-[var(--color-text)]">
              {isAr ? "الملف مؤمّن وموثق رسمياً" : "Profile Certified & Locked"}
            </span>
            <p className="m-0 leading-relaxed text-[var(--muted)]">
              {isAr
                ? "للحفاظ على الامتثال لمعايير وزارة السياحة ومصداقية الحجوزات، يبقى ملفك مقفلاً بعد الاعتماد. إذا كنت ترغب في تحديث أي بيانات أو أسعار أو وثائق، يُرجى التواصل مع إدارة المنصة لطلب التعديل."
                : "To maintain compliance with tourism regulations and booking reliability, your certified profile is protected. If you wish to update any details, rates, or documents, please contact administration."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/guides/${guide.user_id}`} className="button button-primary">
            <ExternalLink size={16} />
            <span>{isAr ? "عرض ملفك كما يراه السياح" : "View Public Profile"}</span>
          </Link>
          <Link href={`/${locale}/contact`} className="button">
            <MessageSquare size={16} />
            <span>{isAr ? "تواصل مع الإدارة لطلب تعديل" : "Contact Admin to Update"}</span>
          </Link>
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

      <form action={action} onSubmit={handleFormSubmit} noValidate className="space-y-8">
        <input 
          type="hidden" 
          name="name" 
          value={fullNameAr.trim() || `${firstName} ${lastName}`.trim() || name} 
        />

        {/* Step 1: Identity & Personal Information */}
        <div className={`space-y-6 animate-fadeIn ${step === 1 ? "block" : "hidden"}`}>
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
                <label className="text-xs font-bold block mb-2">{isAr ? "الاسم الأول" : "First Name"} *</label>
                <input 
                  name="first_name" 
                  value={firstName} 
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  placeholder={isAr ? "مثال: عبد الله" : "e.g., Abdullah"}
                  required 
                  maxLength={50}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-2">{isAr ? "اسم العائلة" : "Last Name"} *</label>
                <input 
                  name="last_name" 
                  value={lastName} 
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  placeholder={isAr ? "مثال: الغامدي" : "e.g., Alghamdi"}
                  required 
                  maxLength={50}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-2">{isAr ? "الاسم الكامل (مطابق للهوية باللغة العربية)" : "Full Name (Arabic)"} *</label>
              <input 
                name="full_name_ar" 
                value={fullNameAr} 
                onChange={(e) => setFullNameAr(e.target.value)}
                placeholder={isAr ? "الاسم الثلاثي أو الرباعي كما في الهوية الوطنية" : "Full name in Arabic"}
                required 
                maxLength={120}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-2">{isAr ? "الاسم الكامل (مطابق لجواز السفر بالإنجليزية)" : "Full Name (English)"} *</label>
              <input 
                name="full_name_en" 
                value={fullNameEn} 
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="Full name as written on passport / official license"
                dir="ltr"
                required 
                maxLength={120}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] font-sans focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
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
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>

            {/* Service Areas Interactive Component */}
            <div className="space-y-3 p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2 m-0 text-[var(--color-text)]">
                  <MapPin size={18} className="text-[var(--color-primary)]" />
                  <span>{isAr ? "مناطق وأحياء ومعالم الخدمة" : "Service Areas & Landmarks"} *</span>
                </label>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--border)] text-[var(--muted)]">
                  {selectedServiceAreas.length} {isAr ? "مناطق محددة" : "selected"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                {isAr 
                  ? "حدد المناطق والمعالم التي تقدم فيها جولاتك بالنقر المباشر على المقترحات، أو أضف أحياء أخرى:" 
                  : "Pick the areas and landmarks you cover by clicking below, or add custom ones:"}
              </p>

              {/* Selected Pills */}
              <div className="p-3 min-h-[50px] rounded-xl bg-[var(--color-surface)] border border-[var(--border)] flex flex-wrap items-center gap-2">
                {selectedServiceAreas.length === 0 ? (
                  <span className="text-xs text-[var(--muted)] italic">
                    {isAr ? "لم تحدد أي منطقة بعد. انقر على المعالم المقترحة أدناه لإضافتها فوراً." : "No areas selected yet. Click landmarks below to add them instantly."}
                  </span>
                ) : (
                  selectedServiceAreas.map((area) => (
                    <span 
                      key={area}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs"
                    >
                      <span>{area}</span>
                      <button
                        type="button"
                        onClick={() => toggleServiceArea(area)}
                        className="hover:opacity-75 rounded-full p-0.5 transition"
                        aria-label={`Remove ${area}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggested Landmarks by Selected City */}
              <div>
                <span className="text-xs font-bold block mb-2 text-[var(--color-text)]">
                  {isAr ? `معالم وأحياء مقترحة في (${selectedCity}):` : `Suggested landmarks in (${selectedCity}):`}
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedLandmarks.map((landmark) => {
                    const isSelected = selectedServiceAreas.includes(landmark);
                    return (
                      <button
                        key={landmark}
                        type="button"
                        onClick={() => toggleServiceArea(landmark)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-xs" 
                            : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--border)] hover:border-[var(--color-primary)] hover:bg-[var(--background-alt)]"
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <Plus size={12} className="text-[var(--muted)]" />}
                        <span>{landmark}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Area Quick Adder */}
              <div className="flex gap-2 pt-2">
                <input 
                  type="text"
                  value={customAreaInput}
                  onChange={(e) => setCustomAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomServiceArea();
                    }
                  }}
                  placeholder={isAr ? "أو اكتب اسم حي أو معلم آخر واضغط إضافة..." : "Or type another district / landmark..."}
                  className="flex-1 p-2.5 rounded-xl text-xs border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <button
                  type="button"
                  onClick={addCustomServiceArea}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--background-alt)] transition flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>{isAr ? "إضافة" : "Add"}</span>
                </button>
              </div>

              {/* Hidden input bound to form submission */}
              <input 
                type="hidden" 
                name="service_areas" 
                value={selectedServiceAreas.join(", ")} 
              />
            </div>

            {/* National Address Structured Card */}
            <div className="space-y-4 p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2 m-0 text-[var(--color-text)]">
                  <Building2 size={18} className="text-[var(--color-primary)]" />
                  <span>{isAr ? "تفاصيل العنوان الوطني السعودي" : "Saudi National Address"} *</span>
                </label>
                <span className="text-[11px] font-semibold text-[var(--color-primary)] bg-[var(--color-surface)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                  {isAr ? "توثيق رسمي" : "Official Verification"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                {isAr 
                  ? "أدخل بيانات عنوانك الوطني المسجل لتوثيق مقر الإقامة الرسمي للمرشد وفق اشتراطات التراخيص:" 
                  : "Enter your registered national address to verify your official residency:"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* District / الحي */}
                <div>
                  <label className="text-xs font-bold block mb-2 text-[var(--color-text)]">
                    {isAr ? "الحي" : "District"} *
                  </label>
                  <input 
                    type="text"
                    value={addressDistrict}
                    onChange={(e) => setAddressDistrict(e.target.value)}
                    placeholder={isAr ? "مثال: حي النخيل، حي الشاطئ" : "e.g., Al-Nakheel"}
                    required
                    className="w-full p-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Street / الشارع */}
                <div>
                  <label className="text-xs font-bold block mb-2 text-[var(--color-text)]">
                    {isAr ? "اسم الشارع" : "Street Name"} *
                  </label>
                  <input 
                    type="text"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder={isAr ? "مثال: شارع التخصصي" : "e.g., Takhassusi St."}
                    required
                    className="w-full p-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Building Number */}
                <div>
                  <label className="text-xs font-bold block mb-2 text-[var(--color-text)]">
                    {isAr ? "رقم المبنى (4 أرقام)" : "Building Number (4 digits)"} *
                  </label>
                  <input 
                    type="text"
                    value={addressBuilding}
                    onChange={(e) => setAddressBuilding(e.target.value)}
                    placeholder="7234"
                    maxLength={10}
                    required
                    className="w-full p-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-xs font-bold block mb-2 text-[var(--color-text)]">
                    {isAr ? "الرمز البريدي (5 أرقام)" : "Postal Code (5 digits)"} *
                  </label>
                  <input 
                    type="text"
                    value={addressPostal}
                    onChange={(e) => setAddressPostal(e.target.value)}
                    placeholder="12345"
                    maxLength={10}
                    required
                    className="w-full p-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>

              {/* Additional notes / landmark */}
              <div>
                <label className="text-xs font-bold block mb-2 text-[var(--muted)]">
                  {isAr ? "ملاحظات إضافية للعنوان أو أقرب معلم (اختياري)" : "Additional Address Notes or Nearby Landmark (Optional)"}
                </label>
                <input 
                  type="text"
                  value={addressNotes}
                  onChange={(e) => setAddressNotes(e.target.value)}
                  placeholder={isAr ? "مثال: بجوار جامع الراجحي، مبنى 3" : "e.g., Near Al-Rajhi Mosque"}
                  className="w-full p-2.5 rounded-xl text-sm border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              {/* Live Formatted Address Card */}
              {(addressDistrict || addressStreet || addressBuilding || addressPostal) && (
                <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] text-xs text-[var(--color-text)] flex items-center gap-2">
                  <Navigation size={14} className="text-[var(--color-primary)] shrink-0" />
                  <span className="font-semibold text-[var(--color-primary)]">{isAr ? "العنوان الوطني المعتمد:" : "Verified Address:"}</span>
                  <span className="text-[var(--muted)]">
                    {[
                      selectedCity,
                      addressDistrict && (isAr ? `حي ${addressDistrict}` : `${addressDistrict} Dist.`),
                      addressStreet && (isAr ? `شارع ${addressStreet}` : `${addressStreet} St.`),
                      addressBuilding && (isAr ? `مبنى ${addressBuilding}` : `Bldg ${addressBuilding}`),
                      addressPostal && (isAr ? `الرمز البريدي ${addressPostal}` : `Postal ${addressPostal}`),
                      addressNotes
                    ].filter(Boolean).join("، ")}
                  </span>
                </div>
              )}

              {/* Hidden input with JSON serialization */}
              <input 
                type="hidden" 
                name="address_details" 
                value={JSON.stringify({
                  city: selectedCity,
                  district: addressDistrict.trim(),
                  street: addressStreet.trim(),
                  building_number: addressBuilding.trim(),
                  postal_code: addressPostal.trim(),
                  notes: addressNotes.trim()
                })} 
              />
            </div>
          </div>

        {/* Step 2: Professional Profile Photo */}
        <div className={`space-y-6 animate-fadeIn ${step === 2 ? "block" : "hidden"}`}>
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

            <div className="p-4 sm:p-6 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] space-y-4 w-full max-w-full min-w-0 overflow-hidden">
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

        {/* Step 3: Official Verification Documents */}
        <div className={`space-y-6 animate-fadeIn ${step === 3 ? "block" : "hidden"} w-full max-w-full min-w-0`}>
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
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start sm:items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold block">{isAr ? "خصوصيتك وأمان وثائقك أولوية قصوى:" : "Your privacy is encrypted and secured:"}</span>
                <span>{isAr ? "جميع الملفات المرفوعة مشفرة في مخزن سحابي خاص ولا تظهر في حسابك العام أو لأي سائح." : "All uploaded documents are encrypted in private storage and never shown publicly."}</span>
              </div>
            </div>

            <div className="space-y-6 w-full max-w-full min-w-0">
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

        {/* Step 4: Languages & Credentials */}
        <div className={`space-y-6 animate-fadeIn ${step === 4 ? "block" : "hidden"} w-full max-w-full min-w-0`}>
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
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>

            {/* Language Certificates Upload */}
            <div className="pt-2 w-full max-w-full min-w-0">
              <GuideFileUpload 
                name="language_certificates" 
                label={isAr ? "شهادات إتقان اللغات (اختياري / يُوصى به)" : "Language Proficiency Certificates (Optional)"}
                defaultValue={typeof guide.language_certificates === 'string' ? guide.language_certificates : (guide.language_certificates as { url?: string } | null | undefined)?.url}
                acceptedTypes="image/jpeg, image/png, application/pdf"
                hint={isAr ? "مثل: IELTS, TOEFL, DELE أو شهادات جامعية" : "e.g., IELTS, TOEFL, DELE or diploma"}
              />
            </div>
          </div>

        {/* Step 5: Bio, Pricing & Inclusions */}
        <div className={`space-y-6 animate-fadeIn ${step === 5 ? "block" : "hidden"}`}>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)] m-0">
                {isAr ? "5. النبذة التعريفية، الخدمات والتسعير" : "5. Bio, Services & Pricing"}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                {isAr ? "شارك قصتك وشغفك ببلادك وحدد أسعارك وسعة المجموعة للجولة." : "Share your story and set your tour rates and inclusions."}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold block mb-2">{isAr ? "نبذة عنك وعن جولتك السياحية" : "Bio & Local Story"} *</label>
              <textarea 
                name="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                required
                maxLength={2000}
                placeholder={isAr ? "تحدث عن مسقط رأسك، شغفك بالتاريخ أو الطبيعة، أسلوبك في الإرشاد، وما الذي يجعل تجربتك مميزة عن غيرها..." : "Tell travelers about yourself, your passion for local culture, and what makes your tours unique..."}
                className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] leading-relaxed text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
              <span className="text-[11px] text-[var(--muted)] block mt-1">
                {isAr ? "يُنصح بكتابة نبذة مفصلة لا تقل عن 50 كلمة لبناء الثقة." : "Recommended length: 50+ words."}
              </span>
            </div>

            {/* Pricing Card with Commission Preview */}
            <div className="p-5 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="text-xs font-bold block mb-2">
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
                      className="w-full p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] font-bold text-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
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
              <label className="text-xs font-bold block mb-2">
                {isAr ? "الحد الأقصى للمشاركين في الجولة الواحدة" : "Max Participants Per Tour"} *
              </label>
              <input 
                type="number"
                name="max_participants"
                min="1"
                max="50"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                required
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
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
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>
          </div>

        {/* Form Action Controls & Stepper Navigation */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 w-full max-w-full">
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

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
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
        {(clientValidationError || state.error) && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="m-0 font-semibold">
                {clientValidationError || (state.error ? (m[state.error] || state.error) : "")}
              </p>
              {!clientValidationError && state.error === "invalid" && (
                <p className="m-0 mt-1 text-xs text-red-600 leading-relaxed">
                  {isAr 
                    ? "تأكد من تعبئة: اسمك الكامل ومدينتك (في الخطوة 1)، والنبذة التعريفية (في الخطوة 5)." 
                    : "Make sure your name and city (Step 1) and your bio (Step 5) are all filled."}
                </p>
              )}
            </div>
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
