import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export default async function PaymentCallbackPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const tapId = sp.tap_id as string;

  if (!tapId) {
    return (
      <main className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Invalid Request</h1>
        <p>No payment reference found.</p>
        <Link href={`/${locale}/account`} className="button">Return to Account</Link>
      </main>
    );
  }

  // Verify the charge status via Tap API
  const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || "sk_test_mock";
  
  const response = await fetch(`https://api.tap.company/v2/charges/${tapId}`, {
    headers: {
      "Authorization": `Bearer ${TAP_SECRET_KEY}`,
      "Accept": "application/json"
    }
  });

  const chargeData = await response.json();
  const isSuccess = chargeData.status === "CAPTURED" || chargeData.status === "AUTHORIZED";

  // Trigger our webhook handler proactively so user doesn't have to wait for the actual webhook
  if (response.ok && chargeData.status) {
    let ourStatus = 'initiated';
    if (isSuccess) ourStatus = 'captured';
    else if (chargeData.status === 'FAILED') ourStatus = 'failed';
    else if (chargeData.status === 'DECLINED') ourStatus = 'declined';
    
    const adminClient = getSupabaseAdmin();
    await adminClient.rpc('handle_payment_webhook', {
      p_charge_id: tapId,
      p_status: ourStatus,
      p_receipt_url: chargeData.receipt?.url || null
    });
  }

  return (
    <main className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
      {isSuccess ? (
        <>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h1>{locale === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!"}</h1>
          <p>{locale === "ar" ? "تم تأكيد حجزك. نتمنى لك جولة ممتعة." : "Your booking is confirmed. Have a great tour."}</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❌</div>
          <h1>{locale === "ar" ? "فشلت عملية الدفع" : "Payment Failed"}</h1>
          <p>{locale === "ar" ? "يرجى المحاولة مرة أخرى من صفحة حجوزاتك." : "Please try again from your bookings page."}</p>
        </>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link href={`/${locale}/account`} className="button button-primary">
          {locale === "ar" ? "العودة لحجوزاتي" : "Return to My Bookings"}
        </Link>
      </div>
    </main>
  );
}
