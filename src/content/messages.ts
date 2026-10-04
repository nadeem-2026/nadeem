import type { Locale } from "@/lib/i18n";

const ar = {
  name: "نديم",
  description: "منصة حجز المرشدين السياحيين في المملكة العربية السعودية",
  skip: "انتقل إلى المحتوى",
  nav: { about: "عن نديم", how: "كيف تعمل المنصة", guides: "المرشدين السياحيين" },
  otherLanguage: "English",
  languageLabel: "View in English",
  
  // Hero
  heroTitle: "اكتشف السعودية برفقة أهلها",
  heroSearchWhere: "إلى أين؟ (مثل: الرياض، العلا)",
  heroSearchWhen: "متى؟ (اختياري)",
  heroSearchBtn: "استكشف المرشدين",
  
  // Destinations
  destinationsTitle: "وجهات تستحق الاستكشاف",
  destinations: [
    { id: "riyadh", name: "الرياض", image: "/photos/riyadh.jpg" },
    { id: "jeddah", name: "جدة", image: "/photos/jeddah.jpg" },
    { id: "alula", name: "العلا", image: "/photos/alula.jpg" },
    { id: "abha", name: "أبها", image: "/photos/abha.jpg" }
  ],
  
  // Guides
  topGuidesTitle: "تعرّف على مرشدينا المعتمدين",
  viewGuideBtn: "عرض المرشد",
  guideHourly: "ريال / ساعة",
  guideTour: "ريال / جولة",
  verified: "معتمد",
  
  // Interests
  interestsTitle: "تجارب تناسب اهتماماتك",
  interests: [
    { title: "تراث وثقافة", icon: "🏛️" },
    { title: "طبيعة ومغامرة", icon: "⛰️" },
    { title: "تجارب محلية", icon: "☕" }
  ],
  
  // How it works
  howTitle: "كيف تحجز جولتك؟",
  howSteps: [
    { title: "ابحث عن مرشدك", text: "اختر المرشد الأنسب لرحلتك بناءً على المدينة، التقييمات، واللغات." },
    { title: "أرسل طلب الحجز", text: "حدد الموعد وأرسل الطلب ليقوم المرشد بمراجعته وقبوله." },
    { title: "أكمل الدفع وابدأ الجولة", text: "بعد قبول المرشد، أكمل الدفع بأمان وابدأ جولتك السياحية الممتعة." }
  ],
  
  // Trust
  trustTitle: "لماذا نديم؟",
  trustFeatures: [
    { title: "مرشدون موثوقون", text: "تظهر ملفات المرشدين بعد مراجعتها واعتمادها في المنصة." },
    { title: "دفع آمن وموثوق", text: "خيارات دفع متنوعة وآمنة لضمان حماية معاملاتك المالية." },
    { title: "تجربة ضيافة حقيقية", text: "تعرّف على السعودية بعيون أهلها من خلال تجارب محلية أصيلة." }
  ],

  footer: "منصة حجز المرشدين السياحيين",
  footerNote: "جميع الحقوق محفوظة · نديم 2026",
  footerLinks: { terms: "الشروط والأحكام", privacy: "سياسة الخصوصية", contact: "تواصل معنا" },
  backHome: "العودة للرئيسية",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundText: "قد يكون الرابط غير صحيح، أو أن هذه الصفحة لم تُتح بعد.",
  loading: "جارٍ تحميل الصفحة…",
  errorTitle: "تعذّر عرض الصفحة",
  errorText: "حاول تحميل الصفحة مرة أخرى.",
  retry: "إعادة المحاولة",
  
  // General
  emptyStateGuides: "لا يوجد مرشدين متاحين حالياً في هذا البحث",
};

export type Messages = typeof ar;

const en: Messages = {
  name: "Nadeem",
  description: "A platform for booking local tour guides in Saudi Arabia",
  skip: "Skip to content",
  nav: { about: "About Nadeem", how: "How it works", guides: "Tour Guides" },
  otherLanguage: "العربية",
  languageLabel: "عرض باللغة العربية",
  
  heroTitle: "Discover Saudi with its locals",
  heroSearchWhere: "Where to? (e.g., Riyadh, AlUla)",
  heroSearchWhen: "When? (Optional)",
  heroSearchBtn: "Explore Guides",
  
  destinationsTitle: "Destinations worth exploring",
  destinations: [
    { id: "riyadh", name: "Riyadh", image: "/photos/riyadh.jpg" },
    { id: "jeddah", name: "Jeddah", image: "/photos/jeddah.jpg" },
    { id: "alula", name: "AlUla", image: "/photos/alula.jpg" },
    { id: "abha", name: "Abha", image: "/photos/abha.jpg" }
  ],
  
  topGuidesTitle: "Meet our verified guides",
  viewGuideBtn: "View Guide",
  guideHourly: "SAR / hour",
  guideTour: "SAR / tour",
  verified: "Verified",
  
  interestsTitle: "Experiences for your interests",
  interests: [
    { title: "Heritage & Culture", icon: "🏛️" },
    { title: "Nature & Adventure", icon: "⛰️" },
    { title: "Local Experiences", icon: "☕" }
  ],
  
  howTitle: "How to book your tour?",
  howSteps: [
    { title: "Find your guide", text: "Choose the perfect guide based on city, reviews, and languages." },
    { title: "Send a booking request", text: "Select your time and send a request for the guide to review." },
    { title: "Complete payment & start", text: "After approval, complete payment securely and start your enjoyable tour." }
  ],
  
  trustTitle: "Why Nadeem?",
  trustFeatures: [
    { title: "Verified Guides", text: "Guide profiles appear after review and approval on the platform." },
    { title: "Secure & Reliable Payment", text: "Various secure payment options to ensure your financial transactions are protected." },
    { title: "Authentic Hospitality", text: "Discover Saudi Arabia through the eyes of its locals." }
  ],

  footer: "A platform for booking local tour guides",
  footerNote: "All Rights Reserved · Nadeem 2026",
  footerLinks: { terms: "Terms & Conditions", privacy: "Privacy Policy", contact: "Contact Us" },
  backHome: "Back to home",
  notFoundTitle: "Page not found",
  notFoundText: "The link may be incorrect, or this page may not be available yet.",
  loading: "Loading the page…",
  errorTitle: "This page could not be displayed",
  errorText: "Please try loading the page again.",
  retry: "Try again",
  
  emptyStateGuides: "No guides are currently available matching your search",
};

export function getMessages(locale: Locale): Messages {
  return locale === "ar" ? ar : en;
}
