"use client";

import { useActionState, useState, useMemo } from "react";
import type { Locale } from "@/lib/i18n";
import { saveTourist, type TouristProfile } from "@/lib/auth/actions";
import { 
  User, 
  Heart, 
  Languages, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2,
  FileText,
  Compass,
  CheckCircle2
} from "lucide-react";

interface TouristProfileFormProps {
  locale: Locale;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  profile?: TouristProfile | null;
}

const INTERESTS_OPTIONS = [
  { id: "heritage", ar: "آثار وتاريخ", en: "History & Heritage", icon: "🏛️" },
  { id: "adventure", ar: "طبيعة ومغامرات وهايكنج", en: "Nature & Adventure", icon: "⛰️" },
  { id: "culinary", ar: "تجارب طهي وأكلات شعبية", en: "Culinary & Local Food", icon: "☕" },
  { id: "culture", ar: "فنون وثقافة وحرف", en: "Culture & Arts", icon: "🎨" },
  { id: "shopping", ar: "أسواق تقليدية ومراكز تسوق", en: "Traditional Souks & Shopping", icon: "🛍️" },
  { id: "entertainment", ar: "فعاليات ومواسم ترفيهية", en: "Festivals & Entertainment", icon: "🎪" },
  { id: "marine", ar: "شواطئ وجزر وأنشطة بحرية", en: "Coastal & Marine Activities", icon: "🌊" },
  { id: "camping", ar: "تخييم ورحلات برية وصحراوية", en: "Desert Camping & Safari", icon: "⛺" }
];

const LANGUAGE_OPTIONS = [
  { id: "ar", ar: "العربية", en: "Arabic", flag: "🇸🇦" },
  { id: "en", ar: "الإنجليزية", en: "English", flag: "🇬🇧" },
  { id: "fr", ar: "الفرنسية", en: "French", flag: "🇫🇷" },
  { id: "de", ar: "الألمانية", en: "German", flag: "🇩🇪" },
  { id: "es", ar: "الإسبانية", en: "Spanish", flag: "🇪🇸" },
  { id: "zh", ar: "الصينية", en: "Chinese", flag: "🇨🇳" },
  { id: "ru", ar: "الروسية", en: "Russian", flag: "🇷🇺" }
];

const TRAVEL_STYLES = [
  { id: "solo", ar: "مسافر فردي", en: "Solo Traveler", descAr: "أستكشف الوجهات بمفردي وبمرونة تامة", descEn: "Exploring independently with full flexibility", icon: "🎒" },
  { id: "family", ar: "عائلي مع أطفال", en: "Family with Kids", descAr: "أفضل وجهات مريحة وتناسب كل أفراد العائلة", descEn: "Comfortable, family-friendly spots and activities", icon: "👨‍👩‍👧‍👦" },
  { id: "couples", ar: "أزواج", en: "Couples", descAr: "تجارب هادئة وفاخرة وأمسيات خاصة", descEn: "Scenic, romantic and tailored unique experiences", icon: "💑" },
  { id: "friends", ar: "مجموعة أصدقاء", en: "Friends Group", descAr: "حماس وأنشطة جماعية وتحديات ممتعة", descEn: "High-energy, fun group adventures and memories", icon: "👥" }
];

export function TouristProfileForm({
  locale,
  displayName,
  avatarUrl,
  email,
  profile
}: TouristProfileFormProps) {
  const isAr = locale === "ar";
  const [state, formAction, isPending] = useActionState(saveTourist.bind(null, locale), {});

  // Form local state for interactive tags and styles
  const [name, setName] = useState(displayName || "");
  const [phone, setPhone] = useState(profile?.phone_number || "");
  const [nationality, setNationality] = useState(profile?.nationality || "");
  const [country, setCountry] = useState(profile?.country_of_residence || "");
  const [city, setCity] = useState(profile?.city_of_residence || "");
  const [travelStyle, setTravelStyle] = useState<string>(profile?.travel_style || "solo");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile?.preferred_languages || ["ar"]);
  const [dietary, setDietary] = useState(profile?.dietary_requirements || "");
  const [mobility, setMobility] = useState(profile?.mobility_needs || "");
  const [emergencyName, setEmergencyName] = useState(profile?.emergency_contact_name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergency_contact_phone || "");
  const [bio, setBio] = useState(profile?.bio || "");

  // Profile completion calculation
  const completionScore = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 15;
    if (phone.trim()) score += 15;
    if (nationality.trim()) score += 10;
    if (country.trim() || city.trim()) score += 10;
    if (travelStyle) score += 10;
    if (selectedInterests.length > 0) score += 15;
    if (selectedLanguages.length > 0) score += 10;
    if (emergencyName.trim() || emergencyPhone.trim()) score += 10;
    if (bio.trim()) score += 5;
    return Math.min(score, 100);
  }, [name, phone, nationality, country, city, travelStyle, selectedInterests, selectedLanguages, emergencyName, emergencyPhone, bio]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one language
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile Completion Header Card */}
      <div 
        className="dashboard-card"
        style={{
          background: "linear-gradient(135deg, rgba(14, 53, 38, 0.05) 0%, rgba(197, 160, 89, 0.08) 100%)",
          border: "1px solid rgba(14, 53, 38, 0.12)",
          padding: "24px",
          borderRadius: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div 
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.4rem",
                boxShadow: "0 4px 12px rgba(14, 53, 38, 0.2)",
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
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}>
                {isAr ? "بروفايل السائح المتكامل" : "Comprehensive Traveler Profile"}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                {isAr ? "تخصيص معلوماتك يساعد المرشدين في تقديم جولات تفوق توقعاتك." : "Customizing your profile helps tour guides craft bespoke experiences."}
              </p>
            </div>
          </div>

          <div style={{ textAlign: isAr ? "left" : "right" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, display: "block" }}>
              {isAr ? "نسبة اكتمال البروفايل" : "Profile Completion"}
            </span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: completionScore >= 80 ? "#059669" : "var(--color-primary)" }}>
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
            overflow: "hidden",
            position: "relative"
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
              {isAr ? "رائع! ملفك السياحي متكامل وجاهز لتجربة سفر استثنائية." : "Awesome! Your travel profile is complete for seamless tour matching."}
            </span>
          ) : (
            <span style={{ color: "var(--color-primary)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isAr ? "أكمل بيانات الاتصال والاهتمامات لتسهيل التنسيق مع المرشد." : "Complete contact details & interests to streamline tour coordination."}
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <form action={formAction}>
        <input type="hidden" name="avatar_url" value={avatarUrl || ""} />
        {/* Hidden inputs for arrays & travel style */}
        <input type="hidden" name="travel_style" value={travelStyle} />
        {selectedInterests.map(interest => (
          <input key={interest} type="hidden" name="interests" value={interest} />
        ))}
        {selectedLanguages.map(lang => (
          <input key={lang} type="hidden" name="preferred_languages" value={lang} />
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: Personal & Contact Info */}
          <div className="dashboard-card">
            <h2>
              <User className="w-5 h-5 text-emerald-800" />
              {isAr ? "البيانات الشخصية ومعلومات الاتصال" : "Personal & Contact Information"}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <label>
                {isAr ? "الاسم الكامل" : "Full Name"}
                <input 
                  name="display_name" 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  maxLength={120} 
                  required 
                />
              </label>

              <label>
                {isAr ? "البريد الإلكتروني (المسجل)" : "Registered Email"}
                <input 
                  type="email" 
                  value={email || ""} 
                  disabled 
                  style={{ opacity: 0.7, cursor: "not-allowed", background: "var(--background-alt)" }} 
                />
              </label>

              <label>
                {isAr ? "رقم الجوال / الواتساب (للتنسيق)" : "Phone / WhatsApp (For coordination)"}
                <div style={{ position: "relative" }}>
                  <input 
                    name="phone_number" 
                    type="tel" 
                    dir="ltr" 
                    placeholder="+966 5X XXX XXXX"
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    maxLength={30} 
                  />
                </div>
              </label>

              <label>
                {isAr ? "الجنسية" : "Nationality"}
                <input 
                  name="nationality" 
                  type="text" 
                  placeholder={isAr ? "مثال: سعودي، إماراتي، كويتي، فرنسي..." : "e.g. Saudi, Emirati, British, French..."} 
                  value={nationality} 
                  onChange={e => setNationality(e.target.value)} 
                  maxLength={60} 
                />
              </label>

              <label>
                {isAr ? "بلد الإقامة الحالي" : "Country of Residence"}
                <input 
                  name="country_of_residence" 
                  type="text" 
                  placeholder={isAr ? "مثال: المملكة العربية السعودية" : "e.g. Saudi Arabia"} 
                  value={country} 
                  onChange={e => setCountry(e.target.value)} 
                  maxLength={60} 
                />
              </label>

              <label>
                {isAr ? "مدينة الإقامة" : "City of Residence"}
                <input 
                  name="city_of_residence" 
                  type="text" 
                  placeholder={isAr ? "مثال: الرياض، دبي، لندن..." : "e.g. Riyadh, Dubai, London..."} 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  maxLength={60} 
                />
              </label>
            </div>
          </div>

          {/* Section 2: Travel Style */}
          <div className="dashboard-card">
            <h2>
              <Compass className="w-5 h-5 text-emerald-800" />
              {isAr ? "نمط السفر والرحلات المفضل" : "Preferred Travel Style"}
            </h2>
            <p style={{ margin: "-8px 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "حدد النمط الأقرب لطبيعة رحلاتك لمساعدة المرشد في ضبط جدول الجولة." : "Choose how you usually travel so the guide can pace your itinerary."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {TRAVEL_STYLES.map(style => {
                const isSelected = travelStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTravelStyle(style.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      textAlign: isAr ? "right" : "left",
                      padding: "16px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(14, 53, 38, 0.05)" : "var(--color-surface)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "8px" }}>
                      <span style={{ fontSize: "1.5rem" }}>{style.icon}</span>
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
                    <strong style={{ fontSize: "0.95rem", color: isSelected ? "var(--color-primary)" : "var(--color-text)" }}>
                      {isAr ? style.ar : style.en}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", lineHeight: 1.4 }}>
                      {isAr ? style.descAr : style.descEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Travel Interests (Interactive Multi-Select) */}
          <div className="dashboard-card">
            <h2>
              <Heart className="w-5 h-5 text-emerald-800" />
              {isAr ? "الاهتمامات والتجارب السياحية" : "Travel Interests & Activities"}
            </h2>
            <p style={{ margin: "-8px 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "اختر المجالات والأنشطة التي تود التركيز عليها أثناء جولاتك (انقر للتحديد)." : "Select the activities and themes you enjoy most during tours."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {INTERESTS_OPTIONS.map(interest => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border)",
                      background: isSelected ? "var(--color-primary)" : "var(--color-surface)",
                      color: isSelected ? "#ffffff" : "var(--color-text)",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "var(--shadow-sm)" : "none"
                    }}
                  >
                    <span>{interest.icon}</span>
                    <span>{isAr ? interest.ar : interest.en}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Preferred Tour Languages */}
          <div className="dashboard-card">
            <h2>
              <Languages className="w-5 h-5 text-emerald-800" />
              {isAr ? "لغات التواصل والجولة المفضلة" : "Preferred Tour Languages"}
            </h2>
            <p style={{ margin: "-8px 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "اختر اللغات التي تفضل أن يقدم المرشد الشرح بها." : "Select the languages you are comfortable communicating in."}
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
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border)",
                      background: isSelected ? "rgba(14, 53, 38, 0.08)" : "var(--color-surface)",
                      color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{isAr ? lang.ar : lang.en}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Care, Health & Emergency */}
          <div className="dashboard-card">
            <h2>
              <ShieldAlert className="w-5 h-5 text-emerald-800" />
              {isAr ? "السلامة، الرعاية الخاصة، وبيانات الطوارئ" : "Safety, Health Care & Emergency Contact"}
            </h2>
            <p style={{ margin: "-8px 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>
              {isAr ? "هذه المعلومات تساعد المرشد في التجهيز المسبق (مثل مطاعم تناسب حميتك، أو مسارات ممهدة)." : "This information assists the guide in tailoring dining stops and accessible routes."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <label>
                {isAr ? "الحساسية أو القيود الغذائية" : "Dietary Restrictions / Allergies"}
                <input 
                  name="dietary_requirements" 
                  type="text" 
                  placeholder={isAr ? "مثال: حساسية مكسرات، خالي من الغلوتين، نباتي..." : "e.g. Nut allergy, gluten-free, vegetarian, none..."} 
                  value={dietary} 
                  onChange={e => setDietary(e.target.value)} 
                  maxLength={250} 
                />
              </label>

              <label>
                {isAr ? "متطلبات حركية أو احتياجات خاصة" : "Mobility Needs & Accessibility"}
                <input 
                  name="mobility_needs" 
                  type="text" 
                  placeholder={isAr ? "مثال: كبار سن، كرسي متحرك، تفضيل مسارات مستوية..." : "e.g. Wheelchair accessible, avoids steep stairs, none..."} 
                  value={mobility} 
                  onChange={e => setMobility(e.target.value)} 
                  maxLength={250} 
                />
              </label>

              <label>
                {isAr ? "اسم جهة اتصال للطوارئ" : "Emergency Contact Name"}
                <input 
                  name="emergency_contact_name" 
                  type="text" 
                  placeholder={isAr ? "اسم شخص مقرب للطوارئ" : "Contact person name"} 
                  value={emergencyName} 
                  onChange={e => setEmergencyName(e.target.value)} 
                  maxLength={100} 
                />
              </label>

              <label>
                {isAr ? "هاتف الطوارئ" : "Emergency Contact Phone"}
                <input 
                  name="emergency_contact_phone" 
                  type="tel" 
                  dir="ltr" 
                  placeholder="+966 5X XXX XXXX" 
                  value={emergencyPhone} 
                  onChange={e => setEmergencyPhone(e.target.value)} 
                  maxLength={30} 
                />
              </label>
            </div>
          </div>

          {/* Section 6: Bio */}
          <div className="dashboard-card">
            <h2>
              <FileText className="w-5 h-5 text-emerald-800" />
              {isAr ? "نبذة تعريفية عنك (Bio)" : "About You (Bio)"}
            </h2>
            <label>
              {isAr ? "نبذة مختصرة ليتعرف عليك المرشد ويكسر الجليد قبل بدء الجولة" : "A brief introduction to help the guide get to know you"}
              <textarea 
                name="bio" 
                rows={3} 
                placeholder={isAr ? "شاركنا نبذة عن حبك للاستكشاف أو مدينتك المفضلة..." : "Share a short note about your travel passion or favorite destinations..."} 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                maxLength={500} 
              />
            </label>
          </div>

          {/* Feedback messages */}
          {state.error && (
            <div 
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem"
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{isAr ? "حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى." : "An error occurred while saving changes. Please try again."}</span>
            </div>
          )}

          {state.success === "saved" && (
            <div 
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.9rem",
                fontWeight: 600
              }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{isAr ? "تم حفظ وتحديث بيانات ملفك الشخصي بنجاح!" : "Your tourist profile details have been saved successfully!"}</span>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: isAr ? "flex-start" : "flex-end" }}>
            <button 
              className="button button-primary" 
              type="submit" 
              disabled={isPending}
              style={{ minWidth: "180px", padding: "12px 28px", fontSize: "1rem" }}
            >
              {isPending ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isAr ? "جارٍ الحفظ…" : "Saving…"}
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
