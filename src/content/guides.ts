import type { Locale } from "@/lib/i18n";

const ar = {
  title: "البحث عن مرشد سياحي",
  description: "اكتشف أفضل المرشدين السياحيين المعتمدين في السعودية",
  searchPlaceholder: "اسم المرشد (اختياري)...",
  filterLanguage: "لغة الجولة",
  filterCity: "المدينة",
  filterPrice: "السعر",
  searchBtn: "بحث",
  allCities: "جميع المدن",
  allLanguages: "جميع اللغات",
  noResults: "لم يتم العثور على مرشدين يطابقون هذه الفلاتر.",
  emptySearch: "لا يوجد مرشدين متاحين حالياً.",
  hourlyRate: "ر.س / ساعة",
  languages: "اللغات:",
  viewProfile: "عرض المرشد",
  // Details Page
  aboutGuide: "النبذة والخبرات",
  serviceAreas: "مناطق الخدمة",
  whatIsIncluded: "ما تشمله الخدمة",
  maxParticipants: "الحد الأقصى للمشاركين",
  bookNowBtn: "أرسل طلب الحجز",
  backToSearch: "العودة للبحث",
  notApproved: "عذراً، هذا المرشد غير متاح حالياً.",
};

const en = {
  title: "Find a Tour Guide",
  description: "Discover the best approved tour guides in Saudi Arabia",
  searchPlaceholder: "Guide name (optional)...",
  filterLanguage: "Tour Language",
  filterCity: "City",
  filterPrice: "Price",
  searchBtn: "Search",
  allCities: "All Cities",
  allLanguages: "All Languages",
  noResults: "No guides found matching these filters.",
  emptySearch: "No guides are currently available.",
  hourlyRate: "SAR / hour",
  languages: "Languages:",
  viewProfile: "View Guide",
  // Details Page
  aboutGuide: "Bio & Experience",
  serviceAreas: "Service Areas",
  whatIsIncluded: "What's Included",
  maxParticipants: "Max Participants",
  bookNowBtn: "Send Booking Request",
  backToSearch: "Back to Search",
  notApproved: "Sorry, this guide is not currently available.",
};

export function guidesMessages(locale: Locale) {
  return locale === "ar" ? ar : en;
}
