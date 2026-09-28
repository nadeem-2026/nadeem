import type { Locale } from "@/lib/i18n";

const ar = {
  login: "تسجيل الدخول", signup: "إنشاء حساب", forgot: "استعادة كلمة المرور", update: "تعيين كلمة مرور جديدة",
  email: "البريد الإلكتروني", password: "كلمة المرور", passwordHint: "من 12 إلى 128 حرفًا. استخدم كلمة مرور خاصة بهذا الحساب.",
  name: "الاسم", role: "نوع الحساب", tourist: "سائح", guide: "مرشد", admin: "مسؤول", submit: "متابعة", busy: "جارٍ الإرسال…",
  unavailable: "ربط الحسابات غير جاهز في هذه البيئة. راجع إعدادات التطوير.",
  invalid: "راجع الحقول المطلوبة وحدود كلمة المرور.", failed: "تعذّر إكمال الطلب. تحقق من البيانات أو حاول لاحقًا.",
  checkEmail: "راجع بريدك لإكمال التأكيد. إذا لم تصلك الرسالة، تحقق من إعدادات تسليم البريد في بيئة التطوير.",
  recoverySent: "إذا كان الحساب موجودًا ومتاحًا للاستعادة، فستصلك رسالة تحتوي رابطًا لتغيير كلمة المرور.",
  saved: "حُفظت التغييرات.", submitted: "أُرسل الملف للمراجعة.", reviewed: "سُجل قرار المراجعة.",
  suspended: "هذا الحساب موقوف. تواصل مع إدارة المنصة.", sessionExpired: "الرابط غير صالح أو منتهي. اطلب رابطًا جديدًا.",
  account: "حسابي", logout: "تسجيل الخروج", development: "حسابات بيئة التطوير", developmentNote: "الحجز والدفع غير متاحين بعد. إرسال البريد للإنتاج لم يُجهز بعد.",
  profile: "ملف المرشد الأولي", city: "المدينة أو منطقة الخدمة", bio: "نبذة عنك", save: "حفظ المسودة", send: "إرسال للمراجعة",
  draft: "مسودة", pending_review: "بانتظار المراجعة", approved: "معتمد", rejected: "مرفوض", guideSuspended: "معلّق", status: "حالة الملف",
  reason: "سبب القرار", locked: "الملف قيد المراجعة أو مغلق للتعديل. قرار اعتماد المنصة مستقل عن قبول مزود الدفع.",
  reviewTitle: "مراجعة ملفات المرشدين", approve: "اعتماد الملف", reject: "رفض الملف", suspend: "تعليق الملف", empty: "لا توجد ملفات للمراجعة.",
  reviewNote: "الاعتماد يدوي. لا توجد قائمة مستندات إلزامية معتمدة بعد؛ يجب حسم معايير الاعتماد قبل استخدام ملفات حقيقية. لا يمنح الاعتماد أهلية صرف لدى مزود دفع.",
  noBookings: "ستظهر وظائف الحجز في المرحلة الخاصة بها.",
};
type AuthMessages = typeof ar;
const en: AuthMessages = {
  login: "Sign in", signup: "Create an account", forgot: "Reset your password", update: "Set a new password",
  email: "Email", password: "Password", passwordHint: "12–128 characters. Use a password unique to this account.",
  name: "Name", role: "Account type", tourist: "Traveler", guide: "Guide", admin: "Administrator", submit: "Continue", busy: "Submitting…",
  unavailable: "Accounts are not configured in this environment. Check the development settings.",
  invalid: "Check the required fields and password length.", failed: "The request could not be completed. Check your details or try again later.",
  checkEmail: "Check your email to confirm your account. If no message arrives, check email delivery settings in the development environment.",
  recoverySent: "If the account exists and can be recovered, an email with a password reset link will arrive.",
  saved: "Changes saved.", submitted: "Profile submitted for review.", reviewed: "Review decision recorded.",
  suspended: "This account is suspended. Contact the platform administrator.", sessionExpired: "This link is invalid or expired. Request a new link.",
  account: "My account", logout: "Sign out", development: "Development accounts", developmentNote: "Bookings and payments are not available yet. Production email delivery is not configured.",
  profile: "Initial guide profile", city: "City or service area", bio: "About you", save: "Save draft", send: "Submit for review",
  draft: "Draft", pending_review: "Pending review", approved: "Approved", rejected: "Rejected", guideSuspended: "Suspended", status: "Profile status",
  reason: "Decision reason", locked: "This profile is under review or locked for editing. Platform approval is separate from payment-provider acceptance.",
  reviewTitle: "Review guide profiles", approve: "Approve profile", reject: "Reject profile", suspend: "Suspend profile", empty: "No profiles to review.",
  reviewNote: "Approval is manual. Required documents have not been decided; define approval criteria before reviewing real guides. Approval does not establish payout eligibility with a payment provider.",
  noBookings: "Booking features will arrive in their development phase.",
};
export function authMessages(locale: Locale): AuthMessages { return locale === "ar" ? ar : en; }
