import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { guidesMessages } from "@/content/guides";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function GuidesSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = guidesMessages(locale);
  const sp = await searchParams;
  
  const cityQuery = typeof sp.city === "string" ? sp.city : "";
  const langQuery = typeof sp.lang === "string" ? sp.lang : "";
  const nameQuery = typeof sp.name === "string" ? sp.name : "";

  const aliases: Record<string, string> = {
    riyadh: "الرياض", jeddah: "جدة", alula: "العلا", abha: "أبها", dammam: "الدمام",
    makkah: "مكة المكرمة", madinah: "المدينة المنورة", arabic: "العربية",
    spanish: "español", french: "français",
  };
  const normalize = (value: string) => aliases[value.trim().toLowerCase()] ?? value.trim().toLowerCase();
  const guides = (await publicGuides()).filter(guide =>
    (!cityQuery || [guide.city, ...guide.service_areas].some(city => normalize(city).includes(normalize(cityQuery)))) &&
    (!langQuery || guide.languages.some(language => normalize(language) === normalize(langQuery))) &&
    (!nameQuery || guide.display_name.toLowerCase().includes(nameQuery.toLowerCase()))
  );

  const cities = locale === "ar" ? ["الرياض", "جدة", "العلا", "أبها", "الدمام", "مكة المكرمة", "المدينة المنورة"] : ["Riyadh", "Jeddah", "AlUla", "Abha", "Dammam", "Makkah", "Madinah"];
  const languages = locale === "ar" ? ["العربية", "English", "Español", "Français"] : ["Arabic", "English", "Spanish", "French"];

  return (
    <main className="container section" id="main-content" tabIndex={-1}>
      <header className="section-heading" style={{ marginInline: "auto", textAlign: "center" }}>
        <h1 className="hero-title" style={{ color: "var(--nadeem-green)", marginBottom: "16px" }}>{m.title}</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>{m.description}</p>
      </header>

      <section style={{ marginBottom: "3rem", background: "white", padding: "1.5rem", borderRadius: "var(--radius-card)", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <form className="account-form" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", alignItems: "end", margin: 0, padding: 0, border: "none", background: "none" }} method="GET">
          
          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="city" style={{ fontWeight: 600 }}>{m.filterCity}</label>
            <select name="city" id="city" defaultValue={cityQuery}>
              <option value="">{m.allCities}</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="lang" style={{ fontWeight: 600 }}>{m.filterLanguage}</label>
            <select name="lang" id="lang" defaultValue={langQuery}>
              <option value="">{m.allLanguages}</option>
              {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="name" className="sr-only">{m.searchPlaceholder}</label>
            <input type="text" id="name" name="name" defaultValue={nameQuery} placeholder={m.searchPlaceholder} />
          </div>

          <button type="submit" className="button button-primary">{m.searchBtn}</button>
        </form>
      </section>

      <section>
        {(!guides) ? (
           <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">⏳</span>
              <h3>{m.emptySearch}</h3>
           </div>
        ) : guides.length === 0 ? (
          <div className="empty-state">
             <span className="empty-icon" aria-hidden="true">🔍</span>
             <h3>{m.noResults}</h3>
          </div>
        ) : (
          <div className="guides-grid">
            {guides.map((guide) => {
              const gp = guide;
              return (
                <a href={`/${locale}/guides/${guide.id}`} key={guide.id} className="guide-card">
                  <div className="guide-avatar-container">
                    <Image src={"/brand/nadeem-symbol-reverse.svg"} alt={guide.display_name} width={400} height={400} className="guide-avatar" />
                    <span className="badge-verified">✓</span>
                  </div>
                  <div className="guide-info">
                    <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>{guide.display_name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "12px" }}>
                      <span>📍 {gp.city}</span>
                      <span style={{ fontWeight: "bold", color: "var(--nadeem-ink)" }}>{gp.hourly_rate} {m.hourlyRate}</span>
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {gp.bio}
                    </p>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      <strong>{m.languages}</strong> {(gp.languages || []).join(" • ")}
                    </div>
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--nadeem-green)", fontWeight: 500 }}>
                      {m.viewProfile} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
