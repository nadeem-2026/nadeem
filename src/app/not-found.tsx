import Link from "next/link";
import { getRequestLocale } from "@/lib/request-locale";
import { getMessages } from "@/content/messages";
import { Brand } from "@/components/brand";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const m = getMessages(locale);
  
  return (
    <main id="main-content" className="container" tabIndex={-1} style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Brand name={m.name} />
      </div>
      <p className="eyebrow" style={{ fontSize: "1.5rem", color: "var(--color-primary)", letterSpacing: "4px" }}>404</p>
      <h1 style={{ fontSize: "3rem", margin: "1rem 0" }}>{m.notFoundTitle}</h1>
      <p style={{ color: "var(--muted)", fontSize: "1.2rem", maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>{m.notFoundText}</p>
      <Link className="button button-primary" href={`/${locale}`} style={{ padding: "12px 32px", fontSize: "1.1rem" }}>
        {m.backHome}
      </Link>
    </main>
  );
}
