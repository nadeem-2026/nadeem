import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function PaymentCallbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main-content" className="container section">
    <h1>{locale === "ar" ? "تعذر التحقق من الدفع" : "Payment could not be verified"}</h1>
    <p>{locale === "ar"
      ? "الدفع غير مفعّل حاليًا. هذه الصفحة لا تؤكد نجاح الدفع أو الحجز. إذا خُصم مبلغ، احتفظ بمرجع العملية للمراجعة."
      : "Payments are not enabled. This page does not confirm payment or booking. If you were charged, retain the transaction reference for review."}</p>
    <Link href={`/${locale}/account`} className="button button-primary">{locale === "ar" ? "حسابي" : "My account"}</Link>
  </main>;
}
