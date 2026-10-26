"use client";

import { useActionState, useState, useMemo, useRef } from "react";
import type { Locale } from "@/lib/i18n";
import { saveTourist, type TouristProfile } from "@/lib/auth/actions";
import { processAvatarFile } from "@/lib/image-process";
import { UserAvatar } from "./user-avatar";
import { 
  User, 
  Camera,
  UploadCloud,
  Trash2,
  Heart, 
  Languages, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Compass, 
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Building2,
  PhoneCall,
  UtensilsCrossed,
  Activity,
  ShieldCheck,
  Wheat,
  Milk,
  Salad,
  Leaf,
  Fish,
  Egg,
  Footprints,
  Clock,
  Accessibility,
  Ban,
  Luggage,
  Users,
  Baby,
  HeartHandshake,
  Landmark,
  Mountain,
  Coffee,
  Palette,
  ShoppingBag,
  Waves,
  Tent
} from "lucide-react";

interface TouristProfileFormProps {
  locale: Locale;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  profile?: TouristProfile | null;
}

const COUNTRY_DIAL_CODES = [
  { code: "+966", countryAr: "السعودية", countryEn: "Saudi Arabia" },
  { code: "+971", countryAr: "الإمارات", countryEn: "UAE" },
  { code: "+965", countryAr: "الكويت", countryEn: "Kuwait" },
  { code: "+974", countryAr: "قطر", countryEn: "Qatar" },
  { code: "+973", countryAr: "البحرين", countryEn: "Bahrain" },
  { code: "+968", countryAr: "عُمان", countryEn: "Oman" },
  { code: "+20", countryAr: "مصر", countryEn: "Egypt" },
  { code: "+962", countryAr: "الأردن", countryEn: "Jordan" },
  { code: "+44", countryAr: "بريطانيا", countryEn: "UK" },
  { code: "+1", countryAr: "أمريكا/كندا", countryEn: "USA/Canada" },
  { code: "+33", countryAr: "فرنسا", countryEn: "France" },
  { code: "+49", countryAr: "ألمانيا", countryEn: "Germany" }
];

const POPULAR_NATIONALITIES = [
  { ar: "سعودي", en: "Saudi" },
  { ar: "إماراتي", en: "Emirati" },
  { ar: "كويتي", en: "Kuwaiti" },
  { ar: "قطري", en: "Qatari" },
  { ar: "بحريني", en: "Bahraini" },
  { ar: "عماني", en: "Omani" },
  { ar: "مصري", en: "Egyptian" },
  { ar: "أردني", en: "Jordanian" },
  { ar: "بريطاني", en: "British" },
  { ar: "أمريكي", en: "American" },
  { ar: "فرنسي", en: "French" },
  { ar: "ألماني", en: "German" }
];

const POPULAR_COUNTRIES = [
  { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  { ar: "الكويت", en: "Kuwait" },
  { ar: "قطر", en: "Qatar" },
  { ar: "البحرين", en: "Bahrain" },
  { ar: "سلطنة عمان", en: "Oman" },
  { ar: "مصر", en: "Egypt" },
  { ar: "الأردن", en: "Jordan" },
  { ar: "المملكة المتحدة", en: "United Kingdom" },
  { ar: "الولايات المتحدة", en: "United States" }
];

const POPULAR_CITIES = [
  { ar: "الرياض", en: "Riyadh" },
  { ar: "جدة", en: "Jeddah" },
  { ar: "مكة المكرمة", en: "Makkah" },
  { ar: "المدينة المنورة", en: "Madinah" },
  { ar: "العلا", en: "AlUla" },
  { ar: "الدمام والخبر", en: "Dammam & Khobar" },
  { ar: "أبها وعسير", en: "Abha & Asir" },
  { ar: "الطائف", en: "Taif" },
  { ar: "تبوك", en: "Tabuk" },
  { ar: "دبي", en: "Dubai" },
  { ar: "القاهرة", en: "Cairo" },
  { ar: "لندن", en: "London" }
];

const DIETARY_OPTIONS = [
  { id: "none", ar: "لا توجد قيود أو حساسية", en: "No dietary restrictions", icon: ShieldCheck },
  { id: "nuts", ar: "حساسية مكسرات", en: "Nut allergy", icon: AlertCircle },
  { id: "gluten", ar: "خالي من الغلوتين / سيلياك", en: "Gluten-free / Celiac", icon: Wheat },
  { id: "lactose", ar: "حساسية لاكتوز / مشتقات حليب", en: "Lactose-free", icon: Milk },
  { id: "vegetarian", ar: "نباتي (Vegetarian)", en: "Vegetarian", icon: Salad },
  { id: "vegan", ar: "نباتي صرف (Vegan)", en: "Vegan", icon: Leaf },
  { id: "halal", ar: "لحوم حلال فقط", en: "Halal only", icon: CheckCircle2 },
  { id: "seafood", ar: "حساسية مأكولات بحرية", en: "Seafood allergy", icon: Fish },
  { id: "eggs", ar: "حساسية بيض", en: "Egg allergy", icon: Egg }
];

const MOBILITY_OPTIONS = [
  { id: "standard", ar: "حركة طبيعية ونشطة", en: "Standard & Active Mobility", descAr: "مستعد للمشي والمسارات التراثية وصعود السلالم والدرج", descEn: "Comfortable with walking, stairs, and active itineraries", icon: Footprints },
  { id: "gentle", ar: "وتيرة هادئة ومسافات قصيرة", en: "Gentle Pace & Short Walks", descAr: "تفضيل مسافات مشي خفيفة مع فترات راحة منتظمة", descEn: "Prefer leisurely walks with relaxing breaks", icon: Clock },
  { id: "seniors", ar: "كبار سن / راحة مستمرة", en: "Seniors / Frequent Rest", descAr: "تفضيل سيارة قريبة وتجنب الوقوف لفترات طويلة", descEn: "Easy-access stops avoiding prolonged standing", icon: User },
  { id: "wheelchair", ar: "مستخدم كرسي متحرك", en: "Wheelchair Accessible", descAr: "يلزم مسارات ممهدة بالكامل ومصاعد ومنحدرات مهيأة", descEn: "Requires fully paved routes, ramps, and elevator access", icon: Accessibility },
  { id: "avoid_steep", ar: "تجنب المرتفعات أو الصعود الشاق", en: "Avoid Steep Terrain & Hikes", descAr: "أفضل المسارات المستوية بدون صعود جبلي وعر", descEn: "Flat terrain preferred, avoid rugged hiking trails", icon: Ban }
];

const EMERGENCY_RELATIONS = [
  { id: "parent", ar: "أحد الوالدين", en: "Parent", icon: Users },
  { id: "spouse", ar: "الزوج / الزوجة", en: "Spouse", icon: Heart },
  { id: "sibling", ar: "أخ / أخت", en: "Sibling", icon: User },
  { id: "friend", ar: "صديق مقرب", en: "Friend", icon: HeartHandshake },
  { id: "other", ar: "أخرى", en: "Other", icon: FileText }
];

const INTERESTS_OPTIONS = [
  { id: "heritage", ar: "آثار وتاريخ", en: "History & Heritage", icon: Landmark },
  { id: "adventure", ar: "طبيعة ومغامرات وهايكنج", en: "Nature & Adventure", icon: Mountain },
  { id: "culinary", ar: "تجارب طهي وأكلات شعبية", en: "Culinary & Local Food", icon: Coffee },
  { id: "culture", ar: "فنون وثقافة وحرف", en: "Culture & Arts", icon: Palette },
  { id: "shopping", ar: "أسواق تقليدية ومراكز تسوق", en: "Traditional Souks & Shopping", icon: ShoppingBag },
  { id: "entertainment", ar: "فعاليات ومواسم ترفيهية", en: "Festivals & Entertainment", icon: Sparkles },
  { id: "marine", ar: "شواطئ وجزر وأنشطة بحرية", en: "Coastal & Marine Activities", icon: Waves },
  { id: "camping", ar: "تخييم ورحلات برية وصحراوية", en: "Desert Camping & Safari", icon: Tent }
];

const LANGUAGE_OPTIONS = [
  { id: "ar", ar: "العربية", en: "Arabic" },
  { id: "en", ar: "الإنجليزية", en: "English" },
  { id: "fr", ar: "الفرنسية", en: "French" },
  { id: "de", ar: "الألمانية", en: "German" },
  { id: "es", ar: "الإسبانية", en: "Spanish" },
  { id: "zh", ar: "الصينية", en: "Chinese" },
  { id: "ru", ar: "الروسية", en: "Russian" }
];

const TRAVEL_STYLES = [
  { id: "solo", ar: "مسافر فردي", en: "Solo Traveler", descAr: "أستكشف الوجهات بمفردي وبمرونة تامة", descEn: "Exploring independently with full flexibility", icon: Luggage },
  { id: "family", ar: "عائلي مع أطفال", en: "Family with Kids", descAr: "أفضل وجهات مريحة وتناسب كل أفراد العائلة", descEn: "Comfortable, family-friendly spots and activities", icon: Baby },
  { id: "couples", ar: "أزواج", en: "Couples", descAr: "تجارب هادئة وفاخرة وأمسيات خاصة", descEn: "Scenic, romantic and tailored unique experiences", icon: Heart },
  { id: "friends", ar: "مجموعة أصدقاء", en: "Friends Group", descAr: "حماس وأنشطة جماعية وتحديات ممتعة", descEn: "High-energy, fun group adventures and memories", icon: Users }
];

function splitPhone(fullPhone: string) {
  if (!fullPhone) return { dialCode: "+966", numberOnly: "" };
  const trimmed = fullPhone.trim();
  for (const item of COUNTRY_DIAL_CODES) {
    if (trimmed.startsWith(item.code)) {
      return {
        dialCode: item.code,
        numberOnly: trimmed.slice(item.code.length).trim()
      };
    }
  }
  return { dialCode: "+966", numberOnly: trimmed };
}

export function TouristProfileForm({
  locale,
  displayName,
  avatarUrl,
  email,
  profile
}: TouristProfileFormProps) {
  const isAr = locale === "ar";
  const [state, formAction, isPending] = useActionState(saveTourist.bind(null, locale), {});

  // Basic Personal Info
  const [name, setName] = useState(displayName || "");
  
  // Phone with Country Dial Code
  const initialPhone = splitPhone(profile?.phone_number || "");
  const [phoneDialCode, setPhoneDialCode] = useState(initialPhone.dialCode);
  const [phoneNumberOnly, setPhoneNumberOnly] = useState(initialPhone.numberOnly);

  // Nationality, Country & City
  const [nationality, setNationality] = useState(profile?.nationality || "");
  const [country, setCountry] = useState(profile?.country_of_residence || "");
  const [city, setCity] = useState(profile?.city_of_residence || "");

  // Travel Style & Interests & Languages
  const [travelStyle, setTravelStyle] = useState<string>(profile?.travel_style || "solo");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile?.preferred_languages || ["ar"]);

  // Dietary Restrictions
  const [selectedDietary, setSelectedDietary] = useState<string[]>(() => {
    const raw = profile?.dietary_requirements || "";
    if (!raw || raw === "none" || raw.includes("لا توجد")) return ["none"];
    const found: string[] = [];
    DIETARY_OPTIONS.forEach(opt => {
      if (opt.id !== "none" && (raw.includes(opt.id) || raw.includes(opt.ar) || raw.includes(opt.en))) {
        found.push(opt.id);
      }
    });
    return found.length > 0 ? found : [];
  });
  const [dietaryCustom, setDietaryCustom] = useState(() => {
    const raw = profile?.dietary_requirements || "";
    if (raw.startsWith("ملاحظة: ") || raw.startsWith("Note: ")) {
      return raw.replace(/^(ملاحظة: |Note: )/, "");
    }
    return "";
  });

  // Mobility Needs
  const [selectedMobility, setSelectedMobility] = useState<string>(() => {
    const raw = profile?.mobility_needs || "";
    for (const opt of MOBILITY_OPTIONS) {
      if (raw.includes(opt.id) || raw.includes(opt.ar) || raw.includes(opt.en)) {
        return opt.id;
      }
    }
    return "standard";
  });
  const [mobilityCustom, setMobilityCustom] = useState(() => {
    const raw = profile?.mobility_needs || "";
    if (raw.startsWith("ملاحظة: ") || raw.startsWith("Note: ")) {
      return raw.replace(/^(ملاحظة: |Note: )/, "");
    }
    return "";
  });

  // Emergency Contact
  const [emergencyRelation, setEmergencyRelation] = useState<string>("parent");
  const [emergencyName, setEmergencyName] = useState(profile?.emergency_contact_name || "");
  const initialEmergencyPhone = splitPhone(profile?.emergency_contact_phone || "");
  const [emergencyDialCode, setEmergencyDialCode] = useState(initialEmergencyPhone.dialCode);
  const [emergencyPhoneOnly, setEmergencyPhoneOnly] = useState(initialEmergencyPhone.numberOnly);

  // Bio
  const [bio, setBio] = useState(profile?.bio || "");

  // Avatar Photo Management State
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError(isAr ? "حجم الصورة يتجاوز الحد الأقصى (10 ميجابايت)" : "File exceeds maximum size of 10MB");
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);
    setAvatarSuccess(null);

    try {
      const processed = await processAvatarFile(file, { targetSize: 800, quality: 0.9 });
      const fileToUpload = processed.file || file;

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success && json?.url) {
        setCurrentAvatarUrl(json.url);
        setAvatarSuccess(isAr ? "تم تجهيز وتحديث صورتك الشخصية بنجاح" : "Profile photo uploaded and processed successfully");
      } else {
        throw new Error(json?.error || (isAr ? "تعذر رفع الصورة الشخصية" : "Failed to upload photo"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isAr ? "حدث خطأ أثناء رفع الصورة" : "Error uploading avatar");
      setAvatarError(msg);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setCurrentAvatarUrl(null);
    setAvatarSuccess(isAr ? "تمت إزالة الصورة الشخصية (سيتم استخدام الحروف الأولى)" : "Photo removed");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Computed full phone strings for form submission
  const fullPhoneNumber = phoneNumberOnly.trim() ? `${phoneDialCode} ${phoneNumberOnly.trim()}` : "";
  const fullEmergencyPhone = emergencyPhoneOnly.trim() ? `${emergencyDialCode} ${emergencyPhoneOnly.trim()}` : "";

  // Computed dietary requirements string
  const computedDietaryRequirements = useMemo(() => {
    if (selectedDietary.includes("none") && !dietaryCustom.trim()) return "none";
    const labels = selectedDietary
      .filter(id => id !== "none")
      .map(id => {
        const item = DIETARY_OPTIONS.find(o => o.id === id);
        return item ? (isAr ? item.ar : item.en) : id;
      });
    if (dietaryCustom.trim()) {
      labels.push(dietaryCustom.trim());
    }
    return labels.join("، ") || "none";
  }, [selectedDietary, dietaryCustom, isAr]);

  // Computed mobility needs string
  const computedMobilityNeeds = useMemo(() => {
    const found = MOBILITY_OPTIONS.find(o => o.id === selectedMobility);
    const label = found ? (isAr ? found.ar : found.en) : selectedMobility;
    if (mobilityCustom.trim()) {
      return `${label} (${mobilityCustom.trim()})`;
    }
    return label;
  }, [selectedMobility, mobilityCustom, isAr]);

  // Profile completion calculation
  const completionScore = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 15;
    if (phoneNumberOnly.trim()) score += 15;
    if (nationality.trim()) score += 10;
    if (country.trim() || city.trim()) score += 10;
    if (travelStyle) score += 10;
    if (selectedInterests.length > 0) score += 15;
    if (selectedLanguages.length > 0) score += 10;
    if (emergencyName.trim() || emergencyPhoneOnly.trim()) score += 10;
    if (bio.trim()) score += 5;
    return Math.min(score, 100);
  }, [name, phoneNumberOnly, nationality, country, city, travelStyle, selectedInterests, selectedLanguages, emergencyName, emergencyPhoneOnly, bio]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const toggleDietary = (id: string) => {
    if (id === "none") {
      setSelectedDietary(["none"]);
      return;
    }
    setSelectedDietary(prev => {
      const withoutNone = prev.filter(item => item !== "none");
      if (withoutNone.includes(id)) {
        const next = withoutNone.filter(item => item !== id);
        return next.length > 0 ? next : ["none"];
      }
      return [...withoutNone, id];
    });
  };

  return (
    <div className="tourist-profile-form">
      {/* Profile Completion Header Card */}
      <div 
        className="dashboard-card"
        style={{
          background: "linear-gradient(135deg, rgba(14, 53, 38, 0.05) 0%, rgba(197, 160, 89, 0.08) 100%)",
          border: "1px solid rgba(14, 53, 38, 0.14)",
          padding: "24px",
          borderRadius: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div 
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.45rem",
                boxShadow: "0 4px 14px rgba(14, 53, 38, 0.22)",
                overflow: "hidden"
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name || "Tourist"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (name || "N").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--color-primary)", borderBottom: "none", paddingBottom: 0 }}>
                {isAr ? "بروفايل السائح المتكامل" : "Comprehensive Traveler Profile"}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                {isAr ? "بياناتك تساعد المرشدين المحليين في تقديم جولات مخصصة وتواصل سلس وآمن." : "Your details help certified guides tailor bespoke tours and seamless coordination."}
              </p>
            </div>
          </div>

          <div style={{ textAlign: isAr ? "left" : "right" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600, display: "block" }}>
              {isAr ? "نسبة اكتمال البروفايل" : "Profile Completion"}
            </span>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: completionScore >= 80 ? "#059669" : "var(--color-primary)" }}>
              {completionScore}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div 
          style={{
            width: "100%",
            height: "10px",
            background: "rgba(0, 0, 0, 0.08)",
            borderRadius: "999px",
            overflow: "hidden"
          }}
        >
          <div 
            style={{
              width: `${completionScore}%`,
              height: "100%",
              background: completionScore >= 80 
                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)" 
                : "linear-gradient(90deg, #c5a059 0%, var(--color-primary) 100%)",
              borderRadius: "999px",
              transition: "width 0.4s ease"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "0.85rem" }}>
          {completionScore >= 85 ? (
            <span style={{ color: "#065f46", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {isAr ? "بروفايلك السياحي متكامل وجاهز لتجربة سفر متميزة!" : "Your travel profile is complete for seamless booking and coordination!"}
            </span>
          ) : (
            <span style={{ color: "var(--color-primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isAr ? "أكمل رقم الجوال والاهتمامات لرفع نسبة اكتمال ملفك." : "Complete contact details & interests to streamline your tours."}
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <form action={formAction}>
        <input type="hidden" name="avatar_url" value={currentAvatarUrl || ""} />
        <input type="hidden" name="phone_number" value={fullPhoneNumber} />
        <input type="hidden" name="emergency_contact_phone" value={fullEmergencyPhone} />
        <input type="hidden" name="dietary_requirements" value={computedDietaryRequirements} />
        <input type="hidden" name="mobility_needs" value={computedMobilityNeeds} />
        <input type="hidden" name="travel_style" value={travelStyle} />
        {selectedInterests.map(interest => (
          <input key={interest} type="hidden" name="interests" value={interest} />
        ))}
        {selectedLanguages.map(lang => (
          <input key={lang} type="hidden" name="preferred_languages" value={lang} />
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* ========================================================
              CARD 1: البيانات الشخصية ومعلومات الاتصال (Upgraded)
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <User className="w-5 h-5 text-emerald-800" />
              {isAr ? "البيانات الشخصية ومعلومات الاتصال" : "Personal & Contact Information"}
            </h2>
            <p style={{ margin: "-12px 0 20px", fontSize: "0.86rem", color: "var(--muted)" }}>
              {isAr ? "تستخدم هذه البيانات للتنسيق مع المرشد السياحي والتحقق من هوية الحجز." : "Used for tour guide coordination and booking identity verification."}
            </p>

            {/* Avatar Photo Section */}
            <div className="tourist-avatar-section" style={{ padding: "20px", background: "var(--background-alt)", borderRadius: "16px", border: "1px solid var(--border)", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <UserAvatar
                    src={currentAvatarUrl}
                    name={name || displayName}
                    size={96}
                    role="tourist"
                    className="shadow-sm"
                  />
                  {uploadingAvatar && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Camera className="w-4 h-4 text-emerald-800" />
                    <strong style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                      {isAr ? "الصورة الشخصية للبروفايل" : "Profile Portrait"}
                    </strong>
                    {currentAvatarUrl && (
                      <span className="badge-status badge-status-confirmed" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                        <CheckCircle2 size={12} />
                        {isAr ? "نشطة ومعتمدة" : "Active"}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {isAr 
                      ? "تساعد صورتك الشخصية المرشد على التعرف عليك واستقبالك بسلاسة عند نقطة التجمع. نقوم بمعالجة الصورة وقصها مربعاً تلقائياً بأعلى دقة." 
                      : "Helps your guide identify and welcome you smoothly at the meeting point. Photos are auto-cropped to square with optimal clarity."}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarFile}
                      className="hidden"
                      id="tourist-avatar-input"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="button button-primary text-xs"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>{isAr ? "جارٍ الضبط والرفع..." : "Processing & Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} />
                          <span>{currentAvatarUrl ? (isAr ? "تغيير الصورة" : "Change Photo") : (isAr ? "رفع صورة شخصية" : "Upload Photo")}</span>
                        </>
                      )}
                    </button>

                    {currentAvatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="button button-outline text-xs text-red-600 hover:bg-red-50"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderColor: "rgba(220, 38, 38, 0.3)" }}
                      >
                        <Trash2 size={14} />
                        <span>{isAr ? "حذف الصورة" : "Remove"}</span>
                      </button>
                    )}
                  </div>

                  {avatarSuccess && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", fontSize: "0.8rem", color: "#065f46" }}>
                      <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                      <span>{avatarSuccess}</span>
                    </div>
                  )}

                  {avatarError && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", fontSize: "0.8rem", color: "#b91c1c" }}>
                      <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                      <span>{avatarError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              
              {/* Field 1: Name */}
              <div className="tourist-field-card">
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <User className="w-4 h-4 text-emerald-700" />
                    {isAr ? "الاسم الكامل" : "Full Name"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "مطلوب" : "Required"}</span>
                </div>
                <div className="tourist-input-control">
                  <input 
                    name="display_name" 
                    type="text" 
                    placeholder={isAr ? "مثال: عبد الله أحمد" : "e.g. John Doe"}
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    maxLength={120} 
                    required 
                  />
                </div>
              </div>

              {/* Field 2: Email (Verified) */}
              <div className="tourist-field-card" style={{ background: "rgba(14, 53, 38, 0.02)" }}>
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    {isAr ? "البريد الإلكتروني المعتمد" : "Verified Email Address"}
                  </span>
                  <span className="badge-status badge-status-confirmed" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                    <Check className="w-3 h-3" /> {isAr ? "مؤكد" : "Verified"}
                  </span>
                </div>
                <div className="tourist-input-control" style={{ opacity: 0.85, background: "var(--color-surface)" }}>
                  <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <input 
                    type="email" 
                    value={email || ""} 
                    disabled 
                    style={{ cursor: "not-allowed" }} 
                  />
                </div>
              </div>

              {/* Field 3: WhatsApp / Phone with Country Dial Code */}
              <div className="tourist-field-card" style={{ gridColumn: "1 / -1" }}>
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    {isAr ? "رقم الجوال والواتساب للتنسيق الميداني" : "Mobile & WhatsApp for Coordination"}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    {isAr ? "يستخدم لمشاركة موقع اللقاء والتواصل مع المرشد" : "Used for meeting location & live tour updates"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
                  <div className="tourist-input-control">
                    <select 
                      value={phoneDialCode} 
                      onChange={e => setPhoneDialCode(e.target.value)}
                      aria-label={isAr ? "مفتاح الدولة" : "Country Dial Code"}
                    >
                      {COUNTRY_DIAL_CODES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({isAr ? c.countryAr : c.countryEn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tourist-input-control">
                    <input 
                      type="tel" 
                      dir="ltr" 
                      placeholder="5X XXX XXXX"
                      value={phoneNumberOnly} 
                      onChange={e => setPhoneNumberOnly(e.target.value)} 
                      maxLength={20} 
                    />
                  </div>
                </div>
              </div>

              {/* Field 4: Nationality with Quick Chips */}
              <div className="tourist-field-card">
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    {isAr ? "الجنسية" : "Nationality"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "انقر للاختيار السريع" : "Tap for quick pick"}</span>
                </div>
                <div className="tourist-input-control">
                  <input 
                    name="nationality" 
                    type="text" 
                    placeholder={isAr ? "اكتب جنسيتك أو اختر من الأسفل..." : "Type nationality or pick below..."} 
                    value={nationality} 
                    onChange={e => setNationality(e.target.value)} 
                    maxLength={60} 
                  />
                </div>
                <div className="tourist-quick-chips">
                  {POPULAR_NATIONALITIES.map(item => {
                    const active = nationality === (isAr ? item.ar : item.en);
                    return (
                      <button
                        key={item.en}
                        type="button"
                        onClick={() => setNationality(isAr ? item.ar : item.en)}
                        className={`tourist-chip-btn ${active ? "active" : ""}`}
                      >
                        <Globe className="w-3.5 h-3.5 opacity-70" />
                        <span>{isAr ? item.ar : item.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 5: Country of Residence with Quick Chips */}
              <div className="tourist-field-card">
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    {isAr ? "بلد الإقامة الحالي" : "Country of Residence"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "انقر للاختيار السريع" : "Tap for quick pick"}</span>
                </div>
                <div className="tourist-input-control">
                  <input 
                    name="country_of_residence" 
                    type="text" 
                    placeholder={isAr ? "اكتب بلد إقامتك أو اختر من الأسفل..." : "Type country or pick below..."} 
                    value={country} 
                    onChange={e => setCountry(e.target.value)} 
                    maxLength={60} 
                  />
                </div>
                <div className="tourist-quick-chips">
                  {POPULAR_COUNTRIES.map(item => {
                    const active = country === (isAr ? item.ar : item.en);
                    return (
                      <button
                        key={item.en}
                        type="button"
                        onClick={() => setCountry(isAr ? item.ar : item.en)}
                        className={`tourist-chip-btn ${active ? "active" : ""}`}
                      >
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        <span>{isAr ? item.ar : item.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 6: City of Residence with Quick Chips */}
              <div className="tourist-field-card" style={{ gridColumn: "1 / -1" }}>
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    {isAr ? "مدينة الإقامة" : "City of Residence"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "المدينة التي تقيم بها حالياً" : "Your current city"}</span>
                </div>
                <div className="tourist-input-control">
                  <input 
                    name="city_of_residence" 
                    type="text" 
                    placeholder={isAr ? "اكتب مدينتك أو اختر من أشهر المدن..." : "Type city or pick below..."} 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    maxLength={60} 
                  />
                </div>
                <div className="tourist-quick-chips">
                  {POPULAR_CITIES.map(c => {
                    const active = city === (isAr ? c.ar : c.en);
                    return (
                      <button
                        key={c.en}
                        type="button"
                        onClick={() => setCity(isAr ? c.ar : c.en)}
                        className={`tourist-chip-btn ${active ? "active" : ""}`}
                      >
                        <Building2 className="w-3.5 h-3.5 opacity-70" />
                        <span>{isAr ? c.ar : c.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              CARD 2: نمط السفر المفضل (Travel Style)
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <Compass className="w-5 h-5 text-emerald-800" />
              {isAr ? "نمط السفر والرحلات المفضل" : "Preferred Travel Style"}
            </h2>
            <p style={{ margin: "-12px 0 20px", fontSize: "0.86rem", color: "var(--muted)" }}>
              {isAr ? "حدد النمط الأقرب لطبيعة رحلاتك لمساعدة المرشد في ضبط جدول الجولة بما يلائمك." : "Choose how you usually travel so the guide can pace your itinerary."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
              {TRAVEL_STYLES.map(style => {
                const isSelected = travelStyle === style.id;
                const StyleIcon = style.icon;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTravelStyle(style.id)}
                    className={`tourist-interactive-card ${isSelected ? "selected" : ""}`}
                  >
                    <div style={{ 
                      padding: "10px", 
                      borderRadius: "12px", 
                      background: isSelected ? "var(--color-primary)" : "var(--background-alt)", 
                      color: isSelected ? "#fff" : "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <StyleIcon size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                        <strong style={{ fontSize: "0.95rem", color: isSelected ? "var(--color-primary)" : "var(--color-text)" }}>
                          {isAr ? style.ar : style.en}
                        </strong>
                        {isSelected && (
                          <span style={{ 
                            width: "20px", 
                            height: "20px", 
                            borderRadius: "50%", 
                            background: "var(--color-primary)", 
                            color: "#fff", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                          }}>
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "3px", display: "block", lineHeight: 1.35 }}>
                        {isAr ? style.descAr : style.descEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              CARD 3: الاهتمامات والتجارب السياحية (Interests)
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <Heart className="w-5 h-5 text-emerald-800" />
              {isAr ? "الاهتمامات والتجارب السياحية" : "Travel Interests & Activities"}
            </h2>
            <p style={{ margin: "-12px 0 20px", fontSize: "0.86rem", color: "var(--muted)" }}>
              {isAr ? "اختر المجالات والأنشطة التي تود التركيز عليها أثناء جولاتك (انقر للتحديد)." : "Select the activities and themes you enjoy most during tours."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {INTERESTS_OPTIONS.map(interest => {
                const isSelected = selectedInterests.includes(interest.id);
                const InterestIcon = interest.icon;
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border)",
                      background: isSelected ? "var(--color-primary)" : "var(--color-surface)",
                      color: isSelected ? "#ffffff" : "var(--color-text)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "var(--shadow-sm)" : "none"
                    }}
                  >
                    <InterestIcon size={16} />
                    <span>{isAr ? interest.ar : interest.en}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              CARD 4: لغات التواصل والجولة المفضلة
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <Languages className="w-5 h-5 text-emerald-800" />
              {isAr ? "لغات التواصل والجولة المفضلة" : "Preferred Tour Languages"}
            </h2>
            <p style={{ margin: "-12px 0 20px", fontSize: "0.86rem", color: "var(--muted)" }}>
              {isAr ? "اختر اللغات التي تفضل أن يقدم المرشد الشرح بها أثناء الجولة." : "Select the languages you are comfortable communicating in."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {LANGUAGE_OPTIONS.map(lang => {
                const isSelected = selectedLanguages.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 18px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(14, 53, 38, 0.08)" : "var(--color-surface)",
                      color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Globe className="w-4 h-4 text-emerald-800 shrink-0 opacity-80" />
                    <span>{isAr ? lang.ar : lang.en}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              CARD 5: السلامة، الرعاية الخاصة، وبيانات الطوارئ (Upgraded)
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <ShieldAlert className="w-5 h-5 text-emerald-800" />
              {isAr ? "السلامة، الرعاية الخاصة، وبيانات الطوارئ" : "Safety, Health Care & Emergency Contact"}
            </h2>
            <p style={{ margin: "-12px 0 20px", fontSize: "0.86rem", color: "var(--muted)" }}>
              {isAr ? "تمكّن هذه البيانات المرشد السياحي من التحضير المسبق لراحتك وسلامتك (مثل التوقف في مطاعم تلائم حميتك واختيار مسارات مريحة)." : "Enables guides to prepare for your comfort and safety (accommodating dining stops and accessible paths)."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              
              {/* 5.1: Dietary Restrictions Interactive Chips */}
              <div className="tourist-field-card">
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
                    {isAr ? "القيود والحساسية الغذائية (انقر للتحديد)" : "Dietary Restrictions & Allergies"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "مهمة في جولات التذوق والضيافة" : "Crucial for food & culinary stops"}</span>
                </div>

                <div className="tourist-quick-chips">
                  {DIETARY_OPTIONS.map(opt => {
                    const isSelected = selectedDietary.includes(opt.id);
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleDietary(opt.id)}
                        className={`tourist-chip-btn ${isSelected ? "active" : ""}`}
                        style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                      >
                        <OptIcon size={14} className={isSelected ? "text-white" : "text-emerald-700"} />
                        <span>{isAr ? opt.ar : opt.en}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Dietary Note */}
                <div style={{ marginTop: "8px" }}>
                  <div className="tourist-input-control">
                    <input 
                      type="text" 
                      placeholder={isAr ? "هل لديك حساسية أخرى أو أطعمة معينة تود إضافتها؟ (اختياري)..." : "Any other specific dietary notes? (Optional)..."}
                      value={dietaryCustom}
                      onChange={e => setDietaryCustom(e.target.value)}
                      maxLength={150}
                    />
                  </div>
                </div>
              </div>

              {/* 5.2: Mobility Needs & Accessibility */}
              <div className="tourist-field-card">
                <div className="tourist-field-header">
                  <span className="tourist-field-label">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    {isAr ? "القدرة البدنية والاحتياجات الحركية" : "Physical Activity & Mobility Needs"}
                  </span>
                  <span className="tourist-field-helper">{isAr ? "اختر الحالة الأنسب لك" : "Choose your mobility level"}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px", marginTop: "4px" }}>
                  {MOBILITY_OPTIONS.map(opt => {
                    const isSelected = selectedMobility === opt.id;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedMobility(opt.id)}
                        className={`tourist-interactive-card ${isSelected ? "selected" : ""}`}
                        style={{ padding: "12px 14px" }}
                      >
                        <div style={{ 
                          padding: "8px", 
                          borderRadius: "10px", 
                          background: isSelected ? "var(--color-primary)" : "var(--background-alt)", 
                          color: isSelected ? "#fff" : "var(--color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <OptIcon size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                            <strong style={{ fontSize: "0.88rem", color: isSelected ? "var(--color-primary)" : "var(--color-text)" }}>
                              {isAr ? opt.ar : opt.en}
                            </strong>
                            {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", display: "block", lineHeight: 1.3 }}>
                            {isAr ? opt.descAr : opt.descEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Mobility Note */}
                <div style={{ marginTop: "8px" }}>
                  <div className="tourist-input-control">
                    <input 
                      type="text" 
                      placeholder={isAr ? "ملاحظات إضافية حول الحركة أو التنقل (اختياري)..." : "Additional accessibility notes (Optional)..."}
                      value={mobilityCustom}
                      onChange={e => setMobilityCustom(e.target.value)}
                      maxLength={150}
                    />
                  </div>
                </div>
              </div>

              {/* 5.3: Emergency Contact Box */}
              <div 
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(14, 53, 38, 0.04) 100%)",
                  border: "1.5px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: "16px",
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)" }}>
                    {isAr ? "جهة الاتصال في حالات الطوارئ" : "Emergency Contact Person"}
                  </h3>
                </div>
                <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "var(--muted)" }}>
                  {isAr ? "شخص مقرب يمكن للمرشد أو إدارة المنصة التواصل معه في الحالات الطارئة فقط." : "A close contact to reach exclusively in emergency situations."}
                </p>

                {/* Relationship Selector */}
                <div style={{ marginBottom: "14px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)", display: "block", marginBottom: "6px" }}>
                    {isAr ? "صلة القرابة:" : "Relationship:"}
                  </span>
                  <div className="tourist-quick-chips">
                    {EMERGENCY_RELATIONS.map(rel => {
                      const isSelected = emergencyRelation === rel.id;
                      const RelIcon = rel.icon;
                      return (
                        <button
                          key={rel.id}
                          type="button"
                          onClick={() => setEmergencyRelation(rel.id)}
                          className={`tourist-chip-btn ${isSelected ? "active" : ""}`}
                        >
                          <RelIcon size={13} className={isSelected ? "text-white" : "text-[var(--muted)]"} />
                          <span>{isAr ? rel.ar : rel.en}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                  {/* Emergency Contact Name */}
                  <div className="tourist-field-card" style={{ background: "var(--color-surface)" }}>
                    <span className="tourist-field-label">
                      <User className="w-4 h-4 text-amber-600" />
                      {isAr ? "اسم جهة الاتصال" : "Contact Person Name"}
                    </span>
                    <div className="tourist-input-control">
                      <input 
                        name="emergency_contact_name" 
                        type="text" 
                        placeholder={isAr ? "اسم الشخص المقرب" : "Full name of emergency contact"}
                        value={emergencyName} 
                        onChange={e => setEmergencyName(e.target.value)} 
                        maxLength={100} 
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Phone */}
                  <div className="tourist-field-card" style={{ background: "var(--color-surface)" }}>
                    <span className="tourist-field-label">
                      <PhoneCall className="w-4 h-4 text-amber-600" />
                      {isAr ? "هاتف الطوارئ" : "Emergency Phone"}
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px" }}>
                      <div className="tourist-input-control">
                        <select 
                          value={emergencyDialCode} 
                          onChange={e => setEmergencyDialCode(e.target.value)}
                          aria-label={isAr ? "رمز دولة الطوارئ" : "Emergency country dial code"}
                        >
                          {COUNTRY_DIAL_CODES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.code} ({isAr ? c.countryAr : c.countryEn})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="tourist-input-control">
                        <input 
                          type="tel" 
                          dir="ltr" 
                          placeholder="5X XXX XXXX"
                          value={emergencyPhoneOnly} 
                          onChange={e => setEmergencyPhoneOnly(e.target.value)} 
                          maxLength={20} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              CARD 6: نبذة تعريفية عنك (Bio)
             ======================================================== */}
          <div className="dashboard-card">
            <h2>
              <FileText className="w-5 h-5 text-emerald-800" />
              {isAr ? "نبذة تعريفية عنك (Bio)" : "About You (Bio)"}
            </h2>
            <div className="tourist-field-card">
              <span className="tourist-field-label">
                <FileText className="w-4 h-4 text-emerald-700" />
                {isAr ? "مقدمة موجزة ليتعرف عليك المرشد ويكسر الجليد قبل بدء الجولة" : "A brief introduction to help your guide get to know you"}
              </span>
              <div className="tourist-input-control" style={{ padding: "8px 12px" }}>
                <textarea 
                  name="bio" 
                  rows={3} 
                  placeholder={isAr ? "شاركنا نبذة عن شغفك بالاستكشاف، نوعية الأماكن التي تحبها، أو أسلوبك في السفر..." : "Share a short note about your travel passion, preferred places, or exploration style..."} 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  maxLength={500} 
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: "var(--color-text)",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {state.error && (
            <div 
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.92rem",
                fontWeight: 600
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{isAr ? "حدث خطأ أثناء حفظ التغييرات. يرجى مراجعة الحقول والمحاولة مرة أخرى." : "An error occurred while saving changes. Please check fields and try again."}</span>
            </div>
          )}

          {state.success === "saved" && (
            <div 
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                background: "rgba(16, 185, 129, 0.09)",
                border: "1.5px solid rgba(16, 185, 129, 0.25)",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "0.95rem",
                fontWeight: 700
              }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{isAr ? "تم حفظ وتحديث بيانات بروفايلك السياحي بنجاح!" : "Your traveler profile details have been saved successfully!"}</span>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: isAr ? "flex-start" : "flex-end", paddingBottom: "20px" }}>
            <button 
              className="button button-primary" 
              type="submit" 
              disabled={isPending}
              style={{ 
                minWidth: "220px", 
                padding: "14px 32px", 
                fontSize: "1.05rem",
                fontWeight: 700,
                borderRadius: "12px",
                boxShadow: "0 4px 14px rgba(14, 53, 38, 0.2)"
              }}
            >
              {isPending ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isAr ? "جارٍ حفظ البروفايل…" : "Saving profile…"}
                </span>
              ) : (
                isAr ? "حفظ وتحديث البروفايل" : "Save & Update Profile"
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
