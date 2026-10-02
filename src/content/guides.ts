import type { Locale } from "@/lib/i18n";

const ar = {
  title: "البحث عن مرشد سياحي",
  description: "اكتشف أفضل المرشدين السياحيين المعتمدين في السعودية",
  searchPlaceholder: "ابحث بالمدينة أو اسم المرشد...",
  filterLanguage: "اللغة",
  filterCity: "المدينة",
  filterPrice: "السعر",
  searchBtn: "بحث",
  noResults: "لم يتم العثور على مرشدين يطابقون بحثك.",
  hourlyRate: "ر.س / ساعة",
  languages: "اللغات:",
  viewProfile: "عرض الملف",
  // Details Page
  aboutGuide: "عن المرشد",
  serviceAreas: "مناطق الخدمة",
  whatIsIncluded: "ما تشمله الخدمة",
  maxParticipants: "الحد الأقصى للمشاركين",
  bookNowBtn: "احجز الآن",
  backToSearch: "العودة للبحث",
  notApproved: "عذراً، هذا المرشد غير متاح حالياً.",
};

const en = {
  title: "Find a Tour Guide",
  description: "Discover the best approved tour guides in Saudi Arabia",
  searchPlaceholder: "Search by city or guide name...",
  filterLanguage: "Language",
  filterCity: "City",
  filterPrice: "Price",
  searchBtn: "Search",
  noResults: "No guides found matching your search.",
  hourlyRate: "SAR / hour",
  languages: "Languages:",
  viewProfile: "View Profile",
  // Details Page
  aboutGuide: "About the Guide",
  serviceAreas: "Service Areas",
  whatIsIncluded: "What's Included",
  maxParticipants: "Max Participants",
  bookNowBtn: "Book Now",
  backToSearch: "Back to Search",
  notApproved: "Sorry, this guide is not currently available.",
};

export function guidesMessages(locale: Locale) {
  return locale === "ar" ? ar : en;
}
