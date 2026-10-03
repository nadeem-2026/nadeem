import type { Locale } from "@/lib/i18n";

const ar = {
  name: "نديم",
  description: "منصة حجز المرشدين السياحيين في المملكة العربية السعودية",
  skip: "انتقل إلى المحتوى",
  nav: { about: "عن نديم", how: "كيف تعمل المنصة", status: "حالة المنصة", guides: "المرشدين السياحيين" },
  otherLanguage: "English",
  languageLabel: "View in English",
  notice: "نسخة تجريبية",
  noticeDetail: "الحجز والدفع قيد التفعيل في المرحلة القادمة",
  
  // Hero
  heroTitle: "اكتشف السعودية برفقة أهلها",
  heroSearchWhere: "إلى أين؟ (مثل: الرياض، العلا)",
  heroSearchWhen: "متى؟ (اختياري)",
  heroSearchBtn: "استكشف المرشدين",
  
  // Destinations
  destinationsTitle: "وجهات تستحق الاستكشاف",
  destinations: [
    { id: "riyadh", name: "الرياض", image: "https://images.unsplash.com/photo-1588667677943-4cc2c366ff45?q=80&w=600&auto=format&fit=crop" },
    { id: "jeddah", name: "جدة", image: "https://images.unsplash.com/photo-1629853965555-460cc950d853?q=80&w=600&auto=format&fit=crop" },
    { id: "alula", name: "العلا", image: "https://images.unsplash.com/photo-1620211153835-f09d43d3b749?q=80&w=600&auto=format&fit=crop" },
    { id: "abha", name: "أبها", image: "https://images.unsplash.com/photo-1601227092120-1e5f8f307a51?q=80&w=600&auto=format&fit=crop" }
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
    { title: "ادفع بأمان وابدأ رحلتك", text: "بعد قبول المرشد، ادفع قيمة الجولة بأمان واستمتع بتجربتك." }
  ],
  
  // Trust
  trustTitle: "لماذا نديم؟",
  trustFeatures: [
    { title: "مرشدون موثوقون", text: "نراجع حسابات كافة المرشدين للتحقق من التراخيص الرسمية." },
    { title: "دفع آمن ومضمون", text: "نحفظ حقوقك المالية حتى تكتمل جولتك بنجاح." },
    { title: "تجربة ضيافة حقيقية", text: "تعرّف على السعودية بعيون أهلها من خلال تجارب محلية أصيلة." }
  ],

  footer: "منصة حجز المرشدين السياحيين",
  footerNote: "نسخة تجريبية · نديم 2026",
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
  nav: { about: "About Nadeem", how: "How it works", status: "Platform status", guides: "Tour Guides" },
  otherLanguage: "العربية",
  languageLabel: "عرض باللغة العربية",
  notice: "Preview Version",
  noticeDetail: "Bookings and payments will be activated soon",
  
  heroTitle: "Discover Saudi with its locals",
  heroSearchWhere: "Where to? (e.g., Riyadh, AlUla)",
  heroSearchWhen: "When? (Optional)",
  heroSearchBtn: "Explore Guides",
  
  destinationsTitle: "Destinations worth exploring",
  destinations: [
    { id: "riyadh", name: "Riyadh", image: "https://images.unsplash.com/photo-1588667677943-4cc2c366ff45?q=80&w=600&auto=format&fit=crop" },
    { id: "jeddah", name: "Jeddah", image: "https://images.unsplash.com/photo-1629853965555-460cc950d853?q=80&w=600&auto=format&fit=crop" },
    { id: "alula", name: "AlUla", image: "https://images.unsplash.com/photo-1620211153835-f09d43d3b749?q=80&w=600&auto=format&fit=crop" },
    { id: "abha", name: "Abha", image: "https://images.unsplash.com/photo-1601227092120-1e5f8f307a51?q=80&w=600&auto=format&fit=crop" }
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
    { title: "Pay securely & enjoy", text: "After approval, securely pay for your tour and start exploring." }
  ],
  
  trustTitle: "Why Nadeem?",
  trustFeatures: [
    { title: "Verified Guides", text: "We review all guides to ensure they hold official licenses." },
    { title: "Secure Payments", text: "Your money is safe with us until your tour is successfully completed." },
    { title: "Authentic Hospitality", text: "Discover Saudi Arabia through the eyes of its locals." }
  ],

  footer: "A platform for booking local tour guides",
  footerNote: "Preview Version · Nadeem 2026",
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
