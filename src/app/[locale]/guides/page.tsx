import Link from "next/link";
import { GuideAvatar } from "@/components/guide-avatar";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { guidesMessages } from "@/content/guides";
import { MapPin, Star, ShieldCheck, Search, SlidersHorizontal, ArrowLeft, ArrowRight, Languages as LanguagesIcon, Sparkles } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "ابحث عن مرشد سياحي معتمد | نديم" : "Find a Certified Tour Guide | Nadeem",
    description: locale === "ar" ? "تصفح نخبة المرشدين السياحيين المعتمدين من وزارة السياحة في المملكة العربية السعودية لحجز تجربة أصيلة وثرية." : "Browse certified tour guides licensed by the Ministry of Tourism in Saudi Arabia for an authentic and rich travel experience.",
    openGraph: {
      title: locale === "ar" ? "ابحث عن مرشد سياحي معتمد | نديم" : "Find a Certified Tour Guide | Nadeem",
      description: locale === "ar" ? "تصفح نخبة المرشدين السياحيين المعتمدين في المملكة لحجز تجربة فريدة." : "Browse certified tour guides in Saudi Arabia for a unique experience."
    }
  };
}

export default async function GuidesSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  
  const isAr = locale === "ar";
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
  
  const allGuides = await publicGuides();
  const guides = allGuides.filter(guide =>
    (!cityQuery || [guide.city, ...guide.service_areas].some(city => normalize(city).includes(normalize(cityQuery)))) &&
    (!langQuery || guide.languages.some(language => normalize(language) === normalize(langQuery))) &&
    (!nameQuery || guide.display_name.toLowerCase().includes(nameQuery.toLowerCase()))
  );

  const cities = isAr 
    ? ["الرياض", "العلا", "جدة", "أبها", "الدمام", "مكة المكرمة", "المدينة المنورة", "الطائف", "حائل"] 
    : ["Riyadh", "AlUla", "Jeddah", "Abha", "Dammam", "Makkah", "Madinah", "Taif", "Hail"];
  const languages = isAr 
    ? ["العربية", "English", "Español", "Français", "Deutsch", "中文"] 
    : ["Arabic", "English", "Spanish", "French", "German", "Chinese"];

  return (
    <main className="container section" id="main-content" tabIndex={-1}>
      {/* Search Header Banner */}
      <header className="section-heading text-center" style={{ marginInline: "auto", maxWidth: "780px", marginBottom: "3rem" }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-emerald-50 text-[var(--color-primary)] border border-emerald-200">
          <ShieldCheck size={16} />
          <span>{isAr ? "جميع المرشدين مرخصون رسمياً من وزارة السياحة" : "All Guides Licensed by Ministry of Tourism"}</span>
        </div>
        <h1 className="hero-title" style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>
          {m.title}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
          {m.description}
        </p>
      </header>

      {/* Luxury Search & Filter Form */}
      <section className="dashboard-card" style={{ marginBottom: "3.5rem", padding: "2rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <SlidersHorizontal size={18} style={{ color: "var(--color-primary)" }} />
          <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "var(--foreground)" }}>
            {isAr ? "تخصيص وتصفية البحث" : "Filter & Search Guides"}
          </h2>
        </div>

        <form 
          method="GET" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: "1.5rem", 
            alignItems: "end" 
          }}
        >
          {/* City Filter */}
          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="city" style={{ fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={15} style={{ color: "var(--color-primary)" }} />
              <span>{m.filterCity}</span>
            </label>
            <select 
              name="city" 
              id="city" 
              defaultValue={cityQuery} 
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
            >
              <option value="">{m.allCities}</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Language Filter */}
          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="lang" style={{ fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <LanguagesIcon size={15} style={{ color: "var(--color-primary)" }} />
              <span>{m.filterLanguage}</span>
            </label>
            <select 
              name="lang" 
              id="lang" 
              defaultValue={langQuery}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
            >
              <option value="">{m.allLanguages}</option>
              {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>

          {/* Name / Keyword Search */}
          <div style={{ display: "grid", gap: "8px" }}>
            <label htmlFor="name" style={{ fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={15} style={{ color: "var(--color-primary)" }} />
              <span>{isAr ? "البحث بالاسم" : "Search by Name"}</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={nameQuery} 
              placeholder={m.searchPlaceholder}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] text-sm"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="button button-primary"
            style={{ padding: "14px 24px", justifyContent: "center", height: "48px" }}
          >
            <Search size={16} />
            <span>{m.searchBtn}</span>
          </button>
        </form>

        {/* Active Filters tags if filtered */}
        {(cityQuery || langQuery || nameQuery) && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
              {isAr ? "النتائج المطابقة للتصفية:" : "Active filters:"}
            </span>
            {cityQuery && (
              <span className="pill text-xs">
                📍 {cityQuery}
              </span>
            )}
            {langQuery && (
              <span className="pill text-xs">
                🌐 {langQuery}
              </span>
            )}
            {nameQuery && (
              <span className="pill text-xs">
                🔎 &ldquo;{nameQuery}&rdquo;
              </span>
            )}
            <Link 
              href={`/${locale}/guides`} 
              style={{ fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "underline", marginInlineStart: "auto" }}
            >
              {isAr ? "إعادة ضبط البحث" : "Clear filters"}
            </Link>
          </div>
        )}
      </section>

      {/* Results Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--foreground)" }}>
          {isAr 
            ? `عرض ${guides.length} من أصل ${allGuides.length} مرشد سياحي معتمد` 
            : `Showing ${guides.length} of ${allGuides.length} verified guides`}
        </p>
      </div>

      {/* Guides Grid */}
      <section>
        {guides.length === 0 ? (
          <div className="empty-state dashboard-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--background-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--muted)" }}>
              <Search size={32} />
            </div>
            <h3 style={{ fontSize: "1.4rem", margin: "0 0 8px", color: "var(--foreground)" }}>{m.noResults}</h3>
            <p style={{ color: "var(--muted)", maxWidth: "420px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
              {isAr ? "لم نجد أي مرشد يطابق معايير البحث الحالية. جرّب توسيع نطاق البحث أو اختيار مدينة أخرى." : "No tour guides match your current search criteria. Try broadening your filters or choosing another city."}
            </p>
            <Link href={`/${locale}/guides`} className="button button-primary">
              {isAr ? "عرض جميع المرشدين" : "View all guides"}
            </Link>
          </div>
        ) : (
          <div className="guides-grid">
            {guides.map((guide) => {
              const gp = guide;
              return (
                <Link 
                  href={`/${locale}/guides/${guide.id}`} 
                  key={guide.id} 
                  className="guide-card hover-lift fade-in group"
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}
                >
                  {/* Card Avatar / Banner */}
                  <div className="guide-avatar-container" style={{ position: "relative" }}>
                    <GuideAvatar src={guide.avatar_url} name={guide.display_name} size={400} className="guide-avatar" />
                    <div 
                      style={{ 
                        position: "absolute", 
                        top: "12px", 
                        [isAr ? "left" : "right"]: "12px",
                        background: "rgba(14, 53, 38, 0.9)",
                        backdropFilter: "blur(8px)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>{isAr ? "معتمد" : "Verified"}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="guide-info" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: "var(--foreground)" }}>
                        {guide.display_name}
                      </h3>
                      <div style={{ textAlign: isAr ? "left" : "right" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-primary)" }}>
                          {gp.hourly_rate}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginInlineStart: "4px" }}>
                          {m.hourlyRate}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)", fontSize: "0.85rem", marginBottom: "12px" }}>
                      <MapPin size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{gp.city}</span>
                      {gp.service_areas?.length > 1 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          (+{gp.service_areas.length - 1} {isAr ? "مناطق" : "areas"})
                        </span>
                      )}
                    </div>

                    {/* Rating Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginBottom: "12px" }}>
                      {gp.review_count > 0 ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", color: "#F59E0B" }}>
                            <Star size={15} fill="#F59E0B" />
                          </div>
                          <strong style={{ color: "var(--foreground)" }}>{gp.avg_rating.toFixed(1)}</strong>
                          <span style={{ color: "var(--muted)" }}>({gp.review_count} {locale === "ar" ? "تقييم" : "reviews"})</span>
                        </>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
                          {isAr ? "مرشد مميز جديد" : "New Verified Guide"}
                        </span>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    <p style={{ margin: "0 0 16px", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                      {gp.bio}
                    </p>

                    {/* Languages Tag */}
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                      <LanguagesIcon size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {(gp.languages || []).join(" • ")}
                      </span>
                    </div>

                    {/* Card Footer CTA */}
                    <div 
                      style={{ 
                        marginTop: "auto", 
                        paddingTop: "14px", 
                        borderTop: "1px solid var(--border)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        color: "var(--color-primary)", 
                        fontWeight: 600,
                        fontSize: "0.9rem"
                      }}
                    >
                      <span>{m.viewProfile}</span>
                      {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
