import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Terms({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!isLocale(locale))notFound();const ar=locale==="ar";
 return <main id="main-content" className="container information-page" tabIndex={-1}>
  <p className="eyebrow">{ar?"النسخة التعليمية":"Educational edition"}</p>
  <h1>{ar?"شروط استخدام النسخة الجامعية":"College project terms of use"}</h1>
  <section className="info-card"><h2>{ar?"التجربة والمحاكاة":"Demonstration and simulation"}</h2><p>{ar?"نديم مشروع تطبيقي جامعي للتعلم وعرض رحلة حجز مرشد سياحي. الحجوزات الجديدة والدفع والاسترداد تجريبية، ولا تمثل شراء خدمة سياحية أو التزامًا بتنفيذ جولة حقيقية.":"Nadeem is a college project demonstrating a tour-guide booking workflow. New bookings, payments and refunds are simulations, not purchases of tourism services or commitments to deliver real tours."}</p></section>
  <section className="info-card"><h2>{ar?"الاستخدام المسؤول":"Responsible use"}</h2><p>{ar?"استخدم بيانات مناسبة للتجربة، ولا تدخل بيانات بطاقة أو وثائق هوية أو معلومات حساسة في المحادثات. احترم المستخدمين ولا تحاول الوصول إلى حساباتهم أو حجوزاتهم.":"Use data suitable for a demonstration. Do not enter card details, identity documents or sensitive information in messages. Respect other users and do not attempt to access their accounts or bookings."}</p></section>
  <section className="info-card"><h2>{ar?"حدود النسخة":"Preview limitations"}</h2><p>{ar?"قد تتغير الوظائف أثناء التطوير. اعتماد ملف مرشد داخل العرض لا يمثل ترخيصًا رسميًا. لم تُفعّل روابط التواصل الاجتماعي بعد.":"Features may change during development. Approval of a guide profile in the demo does not represent an official license. Social contact links are not yet active."}</p></section>
 </main>;
}
