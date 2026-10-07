import Link from "next/link";
import { GuideAvatar } from "@/components/guide-avatar";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { guidesMessages } from "@/content/guides";
import { authClient } from "@/lib/auth/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params;
  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) return { title: "Not Found" };
  return {
    title: `${profile.display_name} - ${profile.city} | Nadeem`,
    description: profile.bio.substring(0, 160)
  };
}

export default async function GuideDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = guidesMessages(locale);
  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) notFound();
  const gp = profile;

  const client = await authClient();
  let reviews: any[] = [];
  if (client) {
    const { data } = await client
      .from("reviews")
      .select("rating, comment, created_at, tourist:profiles!tourist_id(display_name)")
      .eq("guide_id", id)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      reviews = data;
    }
  }

  return (
    <main className="container section" id="main-content" tabIndex={-1}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/guides`} style={{ display: "inline-block", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
          <span aria-hidden="true">&larr;</span> {m.backToSearch}
        </Link>
      </div>

      <div className="guide-details-grid">
        <div className="guide-main" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="dashboard-card" style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "120px", background: "var(--section-accent)", zIndex: 0 }}></div>
            <div style={{ position: "relative", zIndex: 1, marginTop: "40px" }}>
              <GuideAvatar src={profile.avatar_url} name={profile.display_name} size={160} className="guide-avatar-large" />
            </div>
            <div style={{ position: "relative", zIndex: 1, marginTop: "60px", flex: 1 }}>
              <h1 style={{ fontSize: "2.2rem", margin: "0 0 8px", color: "var(--color-primary)" }}>{profile.display_name} <span style={{ fontSize: "0.9rem", verticalAlign: "middle", background: "var(--nadeem-green)", color: "white", padding: "2px 10px", borderRadius: "12px", marginLeft: "8px" }}>✓ {m.verified}</span></h1>
              <div style={{ color: "var(--muted)", fontSize: "1.05rem", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>📍 {gp.city}</span>
                {gp.review_count > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "var(--color-warning)" }}>★</span>
                    <strong style={{ color: "var(--color-primary)" }}>{gp.avg_rating.toFixed(1)}</strong>
                    <span>({gp.review_count} {locale === "ar" ? "تقييم" : "reviews"})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>{m.aboutGuide}</h2>
            <p style={{ lineHeight: 1.8, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap", margin: 0 }}>
              {gp.bio}
            </p>
          </div>

          <div className="dashboard-card">
            <h2>{m.languages}</h2>
            <div className="pills-list">
              {(gp.languages || []).map((lang: string) => (
                <span key={lang} className="pill">{lang}</span>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <h2>{m.serviceAreas}</h2>
            <div className="pills-list">
              {(gp.service_areas || []).map((area: string) => (
                <span key={area} className="pill">{area}</span>
              ))}
            </div>
          </div>

          {gp.inclusions.length > 0 && (
            <div className="dashboard-card">
              <h2>{m.whatIsIncluded}</h2>
              <p style={{ lineHeight: 1.8, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap", margin: 0 }}>
                {gp.inclusions.map(i => `✓ ${i}`).join("\n")}
              </p>
            </div>
          )}

          <div className="dashboard-card">
            <h2>{locale === "ar" ? "آراء السياح" : "Tourist Reviews"}</h2>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--muted)", margin: 0 }}>{locale === "ar" ? "لا توجد تقييمات بعد." : "No reviews yet."}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {reviews.map((review, i) => (
                  <div key={i} style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <strong>{review.tourist?.display_name || (locale === "ar" ? "سائح مجهول" : "Anonymous Tourist")}</strong>
                      <span style={{ color: "var(--color-warning)", letterSpacing: "2px" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                    <p style={{ color: "var(--foreground)", margin: "0 0 12px", lineHeight: 1.6 }}>"{review.comment}"</p>
                    <small style={{ color: "var(--muted)" }}>{new Date(review.created_at).toLocaleDateString(locale)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="guide-sidebar">
          <div className="dashboard-card" style={{ position: "sticky", top: "40px" }}>
            <div>
              <p className="widget-price" style={{ color: "var(--color-primary)" }}>{gp.hourly_rate} <span>{m.hourlyRate}</span></p>
              <div style={{ height: "1px", background: "var(--border)", margin: "24px 0" }}></div>
              <p className="widget-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{m.maxParticipants}</span>
                <strong style={{ color: "var(--foreground)", fontSize: "1.1rem" }}>{gp.max_participants}</strong>
              </p>
            </div>
            <Link href={`/${locale}/guides/${id}/book`} className="button button-primary" style={{ width: "100%", justifyContent: "center", marginTop: "16px", padding: "16px" }}>
              {m.bookNowBtn}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
