import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { ShieldAlert, ArrowLeft, ArrowRight, LifeBuoy, CheckCircle2, Clock, Hash, ShieldCheck } from "lucide-react";
import { PrintButton } from "@/components/print-button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إشعار الدفع | نديم" : "Payment Notice | Nadeem",
    robots: { index: false, follow: false }
  };
}

export default async function PaymentCallbackPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const query = searchParams ? await searchParams : {};
  const isAr = locale === "ar";

  // Extract reference or transaction ID if passed by gateway/caller
  const rawRef = query.tap_id || query.id || query.payment_id || query.reference || "";
  const transactionRef = Array.isArray(rawRef) ? rawRef[0] : rawRef;
  const rawBookingId = query.booking_id || "";
  const bookingId = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;

  return (
    <main id="main-content" className="container section" tabIndex={-1} style={{ maxWidth: "780px", margin: "2rem auto 5rem auto" }}>
      <div 
        className="card" 
        style={{ 
          padding: "2.5rem 2rem", 
          borderRadius: "24px", 
          border: "1px solid var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
        }}
      >
        {/* Status Icon */}
        <div 
          style={{ 
            width: "64px", 
            height: "64px", 
            borderRadius: "20px", 
            background: "rgba(217, 119, 6, 0.1)", 
            color: "#b45309", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: "1.5rem"
          }}
        >
          <ShieldAlert size={34} />
        </div>

        {/* Required Primary Heading (Tested) */}
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 1rem 0", color: "var(--foreground)" }}>
          {locale === "ar" ? "تعذر التحقق من الدفع" : "Payment could not be verified"}
        </h1>

        {/* Required Explanatory Notice (Tested) */}
        <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "var(--muted)", margin: "0 0 1.75rem 0" }}>
          {locale === "ar"
            ? "الدفع غير مفعّل حاليًا. هذه الصفحة لا تؤكد نجاح الدفع أو الحجز. إذا خُصم مبلغ، احتفظ بمرجع العملية للمراجعة."
            : "Payments are not enabled. This page does not confirm payment or booking. If you were charged, retain the transaction reference for review."}
        </p>

        {/* Transaction Summary Voucher Box */}
        <div 
          style={{ 
            background: "var(--background-alt)", 
            borderRadius: "16px", 
            border: "1px solid var(--border)", 
            padding: "1.25rem 1.5rem", 
            marginBottom: "2rem" 
          }}
        >
          <h2 style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-primary)", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Hash size={16} />
            <span>{isAr ? "بيانات الإشعار المرجعي" : "Transaction Reference Details"}</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                {isAr ? "الرقم المرجعي للاستجابة" : "Reference ID"}
              </span>
              <strong style={{ fontSize: "0.92rem", fontFamily: "monospace", color: "var(--foreground)" }}>
                {transactionRef || (isAr ? "لا يوجد رمز مرفق" : "N/A")}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                {isAr ? "حالة المعاملة" : "Transaction Status"}
              </span>
              <span className="badge" style={{ background: "rgba(217, 119, 6, 0.1)", color: "#b45309", fontWeight: "600", fontSize: "0.8rem", padding: "3px 8px" }}>
                {isAr ? "معاملة غير معتمدة" : "Unverified"}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                {isAr ? "نوع البيئة" : "Environment"}
              </span>
              <strong style={{ fontSize: "0.88rem", color: "var(--foreground)" }}>
                {isAr ? "بيئة تجريبية وأكاديمية" : "Demo / Academic Sandbox"}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                {isAr ? "حماية الضمان المالي" : "Escrow Safeguard"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: "600" }}>
                <ShieldCheck size={14} />
                <span>{isAr ? "أموالك محمية بالكامل" : "Funds fully protected"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }} className="print:hidden">
          {bookingId && (
            <Link 
              href={`/${locale}/bookings/${bookingId}`} 
              className="button button-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>{isAr ? "الانتقال لمتابعة الجولة" : "Go to Tour Details"}</span>
              {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          )}

          <Link 
            href={`/${locale}/account`} 
            className={bookingId ? "button button-outline" : "button button-primary"}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <span>{locale === "ar" ? "حسابي وحجوزاتي" : "My Account"}</span>
          </Link>

          <Link 
            href={`/${locale}/contact`} 
            className="button button-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <LifeBuoy size={15} />
            <span>{isAr ? "مركز الدعم والمساعدة" : "Help & Support"}</span>
          </Link>

          <PrintButton locale={locale as Locale} />
        </div>
      </div>
    </main>
  );
}

