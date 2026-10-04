import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Terms({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const ar=locale==="ar";
 return <main id="main-content" className="container information-page" tabIndex={-1}>
  <p className="eyebrow">{ar?"المعلومات القانونية":"Legal Information"}</p>
  <h1>{ar?"الشروط والأحكام":"Terms and Conditions"}</h1>
  <section className="info-card"><h2>{ar?"شروط الاستخدام":"Terms of Use"}</h2><p>{ar?"منصة نديم توفر خدمة حجز المرشدين السياحيين المعتمدين في المملكة العربية السعودية. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط والأحكام الموضحة هنا.":"Nadeem platform provides a booking service for certified tour guides in Saudi Arabia. By using the platform, you agree to comply with the terms and conditions outlined here."}</p></section>
  <section className="info-card"><h2>{ar?"الاستخدام المسؤول":"Responsible Use"}</h2><p>{ar?"يجب على المستخدمين تقديم بيانات دقيقة وصحيحة عند الحجز أو التسجيل. يجب الالتزام بآداب التعامل واحترام خصوصية المرشدين والسياح الآخرين على المنصة.":"Users must provide accurate and correct data when booking or registering. Users must adhere to proper etiquette and respect the privacy of guides and other tourists on the platform."}</p></section>
  <section className="info-card"><h2>{ar?"سياسة الإلغاء والدفع":"Cancellation and Payment Policy"}</h2><p>{ar?"تخضع جميع عمليات الدفع والاسترداد لسياسة المنصة المالية. في حالة إلغاء الحجز، سيتم تطبيق الشروط المتفق عليها مسبقاً قبل إتمام عملية الدفع.":"All payment and refund transactions are subject to the platform's financial policy. In case of booking cancellation, the pre-agreed terms before completing the payment process will apply."}</p></section>
 </main>;
}
