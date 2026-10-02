import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { authClient } from "@/lib/auth/server";
import { guidesMessages } from "@/content/guides";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function GuidesSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = guidesMessages(locale);
  const sp = await searchParams;
  
  const cityQuery = typeof sp.city === "string" ? sp.city : "";
  const langQuery = typeof sp.lang === "string" ? sp.lang : "";

  const client = await authClient();
  if (!client) throw new Error("Auth client unavailable");

  // Query profiles that have an approved guide_profile
  let query = client
    .from("profiles")
    .select("id, display_name, guide_profiles!inner(city, bio, hourly_rate, languages, service_areas)")
    .eq("guide_profiles.status", "approved")
    .eq("role", "guide");

  if (cityQuery) {
    // Basic search on city or service areas
    query = query.or(`city.ilike.%${cityQuery}%,service_areas.cs.{${cityQuery}}`, { foreignTable: 'guide_profiles' });
  }
  
  if (langQuery) {
    query = query.contains("guide_profiles.languages", [langQuery]);
  }

  const { data: guides, error } = await query;
  if (error) {
    console.error("Guides search error:", error);
  }

  return (
    <main className="container" id="main-content" tabIndex={-1}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 className="hero-title">{m.title}</h1>
        <p className="hero-description">{m.description}</p>
      </header>

      <section style={{ marginBottom: "2rem", background: "var(--background-alt, #f5f5f5)", padding: "1.5rem", borderRadius: "8px" }}>
        <form className="account-form" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }} method="GET">
          <label style={{ flex: "1 1 200px" }}>
            {m.filterCity}
            <input type="text" name="city" defaultValue={cityQuery} placeholder={m.searchPlaceholder} />
          </label>
          <label style={{ flex: "1 1 200px" }}>
            {m.filterLanguage}
            <input type="text" name="lang" defaultValue={langQuery} placeholder="English, العربية..." />
          </label>
          <button type="submit" className="button button-primary">{m.searchBtn}</button>
        </form>
      </section>

      <section>
        {(!guides || guides.length === 0) ? (
          <p style={{ textAlign: "center", padding: "2rem", border: "1px dashed var(--border-color, #ccc)", borderRadius: "8px" }}>
            {m.noResults}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {guides.map((guide: any) => {
              const gp = guide.guide_profiles[0] || guide.guide_profiles; // depending on relation type in postgrest
              return (
                <div key={guide.id} style={{ border: "1px solid var(--border-color, #e5e5e5)", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{guide.display_name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted, #666)", fontSize: "0.9rem" }}>
                    <span>📍 {gp.city}</span>
                    <span style={{ fontWeight: "bold", color: "var(--primary, #0070f3)" }}>{gp.hourly_rate} {m.hourlyRate}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {gp.bio}
                  </p>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #666)" }}>
                    <strong>{m.languages}</strong> {(gp.languages || []).join(" • ")}
                  </div>
                  <Link href={`/${locale}/guides/${guide.id}`} className="button" style={{ textAlign: "center", marginTop: "auto" }}>
                    {m.viewProfile}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
