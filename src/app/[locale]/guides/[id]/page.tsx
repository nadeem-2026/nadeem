import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { authClient } from "@/lib/auth/server";
import { guidesMessages } from "@/content/guides";

export default async function GuideDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = guidesMessages(locale);
  const client = await authClient();
  if (!client) throw new Error("Auth client unavailable");

  // Fetch the guide profile and base profile details
  const { data: profile, error } = await client
    .from("profiles")
    .select("id, display_name, guide_profiles!inner(*)")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const gp = Array.isArray(profile.guide_profiles) ? profile.guide_profiles[0] : profile.guide_profiles;
  
  if (gp.status !== "approved") {
    return (
      <main className="container" id="main-content" tabIndex={-1}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <h2>{m.notApproved}</h2>
          <Link href={`/${locale}/guides`} className="button" style={{ marginTop: "1rem" }}>{m.backToSearch}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" id="main-content" tabIndex={-1}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/guides`} style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary, #0070f3)", textDecoration: "none" }}>
          &larr; {m.backToSearch}
        </Link>
      </div>

      <header style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border-color, #eaeaea)" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{profile.display_name}</h1>
        <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-muted, #666)", fontSize: "1.1rem" }}>
          <span>📍 {gp.city}</span>
          <span style={{ fontWeight: "bold", color: "var(--primary, #0070f3)" }}>{gp.hourly_rate} {m.hourlyRate}</span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{m.aboutGuide}</h2>
            <p style={{ lineHeight: 1.8, fontSize: "1.1rem", whiteSpace: "pre-wrap" }}>
              {gp.bio}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{m.languages}</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(gp.languages || []).map((lang: string) => (
                <span key={lang} style={{ padding: "0.5rem 1rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "20px", fontSize: "0.9rem" }}>
                  {lang}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{m.serviceAreas}</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(gp.service_areas || []).map((area: string) => (
                <span key={area} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border-color, #e5e5e5)", borderRadius: "20px", fontSize: "0.9rem" }}>
                  {area}
                </span>
              ))}
            </div>
          </section>

          {gp.what_is_included && (
            <section>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{m.whatIsIncluded}</h2>
              <p style={{ lineHeight: 1.8, fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
                {gp.what_is_included}
              </p>
            </section>
          )}
          
          <section style={{ padding: "2rem", background: "var(--background-alt, #f5f5f5)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>
              <strong>{m.maxParticipants}:</strong> {gp.max_participants}
            </p>
            <Link href={`/${locale}/guides/${id}/book`} className="button button-primary" style={{ padding: "1rem 3rem", fontSize: "1.2rem" }}>
              {m.bookNowBtn}
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}
