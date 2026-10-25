import type { Locale } from "@/lib/i18n";

const ar = {
  name: "نديم",
  description: "منصة حجز المرشدين السياحيين في المملكة العربية السعودية",
  skip: "انتقل إلى المحتوى",
  nav: { home: "الرئيسية", about: "عن نديم", services: "الخدمات", contact: "تواصل معنا" },
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
  
  // Services
  servicesTitle: "خدماتنا",
  services: [
    { title: "جولات سياحية مخصصة", text: "استمتع بجولات ثقافية وتاريخية ومغامرات مصممة خصيصاً لتناسب اهتماماتك وجدولك الزمني.", icon: "map" },
    { title: "مرشدون محليون معتمدون", text: "نخبة من المرشدين المرخصين رسمياً من وزارة السياحة لضمان تجربة آمنة وأصيلة.", icon: "shield" },
    { title: "دعم على مدار الساعة", text: "فريق دعم فني متكامل لخدمتك ومتابعة رحلتك في أي وقت.", icon: "headphones" }
  ],

  // Contact
  contactTitle: "تواصل معنا",
  contactText: "نحن هنا لمساعدتك والإجابة على جميع استفساراتك.",
  contactEmailPlaceholder: "البريد الإلكتروني",
  contactMessagePlaceholder: "كيف يمكننا مساعدتك؟",
  contactBtn: "إرسال رسالة",
  
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
    { title: "ترخيص رسمي وموثق", text: "مراجعة وتدقيق رخص الإرشاد السياحي والهويات لضمان الأمان والمصداقية." },
    { title: "دفع آمن بنظام الضمان", text: "حماية أموالك بالكامل، ولا يتم تحويل المستحقات للمرشد إلا بعد إتمام الجولة بنجاح." },
    { title: "حكايات محلية أصيلة", text: "تعرّف على كنوز السعودية وتاريخها العريق بعيون أبنائها المرخصين." }
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
  nav: { home: "Home", about: "About Nadeem", services: "Services", contact: "Contact Us" },
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
  
  servicesTitle: "Our Services",
  services: [
    { title: "Customized Tours", text: "Enjoy cultural, historic, and adventure tours tailored specifically to your interests and schedule.", icon: "map" },
    { title: "Certified Local Guides", text: "We provide elite guides officially licensed by the Ministry of Tourism for a safe and authentic journey.", icon: "shield" },
    { title: "24/7 Dedicated Support", text: "Our specialized support team is here to assist you anytime throughout your trip.", icon: "headphones" }
  ],
  
  contactTitle: "Contact Us",
  contactText: "We are here to help you and answer all your inquiries.",
  contactEmailPlaceholder: "Email address",
  contactMessagePlaceholder: "How can we help you?",
  contactBtn: "Send Message",
  
  howTitle: "How to book your tour?",
  howSteps: [
    { title: "Find your guide", text: "Choose the perfect guide based on city, reviews, and languages." },
    { title: "Send a booking request", text: "Select your time and send a request for the guide to review." },
    { title: "Complete payment & start", text: "After approval, complete payment securely and start your enjoyable tour." }
  ],
  
  trustTitle: "Why Nadeem?",
  trustFeatures: [
    { title: "Official Accreditation", text: "Rigorous verification of official tourism licenses and IDs to ensure total credibility." },
    { title: "Protected Escrow System", text: "Bank-grade financial escrow protects your funds until your tour concludes successfully." },
    { title: "Authentic Storytelling", text: "Discover Saudi Arabia's heritage through the eyes of proud local narrators." }
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
