import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Privacy({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const ar=locale==="ar";
 return <main id="main-content" className="container information-page" tabIndex={-1}>
  <p className="eyebrow">{ar?"المعلومات القانونية":"Legal Information"}</p>
  <h1>{ar?"سياسة الخصوصية":"Privacy Policy"}</h1>
  <section className="info-card"><h2>{ar?"بيانات المستخدمين":"User Data"}</h2><p>{ar?"يستخدم الموقع البريد الإلكتروني لتسجيل الحساب واستعادته، وبيانات الملف الشخصي والتوفر والحجوزات والرسائل والتقييمات التي تدخلها لتشغيل الخدمة. ملفات المرشدين المعتمدة تعرض بياناتها العامة للزوار؛ تفاصيل الحجوزات مخصصة للأطراف المصرح لهم.":"The site uses your email for registration and recovery, and the profile, availability, booking, message and review data you enter to operate the service. Approved guide profiles expose their public details to visitors; booking details are intended for authorized participants."}</p></section>
  <section className="info-card"><h2>{ar?"التخزين والخدمات":"Storage and services"}</h2><p>{ar?"تُستخدم ملفات ارتباط (Cookies) لتسجيل الدخول وحفظ اختيار المظهر. تُحمّل الخطوط من Google Fonts، بينما صور الوجهات محفوظة ضمن الموقع. قد تسجل خدمات الاستضافة معلومات تقنية عن الطلبات لضمان عمل المنصة بشكل صحيح.":"Cookies support sign-in and store your appearance preference. Fonts load from Google Fonts; destination photographs are hosted with the site. Hosting services may record technical request information to ensure the platform operates correctly."}</p></section>
  <section className="info-card"><h2>{ar?"الدفع والمعلومات المالية":"Payment and Financial Information"}</h2><p>{ar?"نحن لا نقوم بتخزين تفاصيل بطاقتك الائتمانية على خوادمنا. تتم معالجة جميع المعاملات المالية من خلال بوابات دفع آمنة ومشفرة.":"We do not store your credit card details on our servers. All financial transactions are processed through secure and encrypted payment gateways."}</p></section>
 </main>;
}
