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
        <div className="guide-main">
          
          <div className="guide-header-compact">
            <GuideAvatar src={profile.avatar_url} name={profile.display_name} size={200} className="guide-avatar-large" />
            <div>
              <h1 style={{ fontSize: "2.5rem", margin: "0 0 8px", color: "var(--color-primary)" }}>{profile.display_name} <span style={{ fontSize: "1rem", verticalAlign: "middle", background: "var(--nadeem-green)", color: "white", padding: "2px 10px", borderRadius: "12px" }}>✓</span></h1>
              <div style={{ color: "var(--muted)", fontSize: "1.1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <span>📍 {gp.city}</span>
                {gp.review_count > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "var(--color-warning)" }}>★</span>
                    <strong style={{ color: "var(--color-primary)" }}>{gp.avg_rating.toFixed(1)}</strong>
                    <span>({gp.review_count} {locale === "ar" ? "تقييم" : "reviews"})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <section>
            <h2>{m.aboutGuide}</h2>
            <p style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
              {gp.bio}
            </p>
          </section>

          <section>
            <h2>{m.languages}</h2>
            <div className="pills-list">
              {(gp.languages || []).map((lang: string) => (
                <span key={lang} className="pill">{lang}</span>
              ))}
            </div>
          </section>

          <section>
            <h2>{m.serviceAreas}</h2>
            <div className="pills-list">
              {(gp.service_areas || []).map((area: string) => (
                <span key={area} className="pill">{area}</span>
              ))}
            </div>
          </section>

          {gp.inclusions.length > 0 && (
            <section style={{ borderBottom: "none" }}>
              <h2>{m.whatIsIncluded}</h2>
              <p style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                {gp.inclusions.join(" • ")}
              </p>
            </section>
          )}

          <section style={{ borderBottom: "none" }}>
            <h2>{locale === "ar" ? "آراء السياح" : "Tourist Reviews"}</h2>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>{locale === "ar" ? "لا توجد تقييمات بعد." : "No reviews yet."}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {reviews.map((review, i) => (
                  <div key={i} style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--color-surface)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>{review.tourist?.display_name || (locale === "ar" ? "سائح مجهول" : "Anonymous Tourist")}</strong>
                      <span style={{ color: "var(--color-warning)" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                    <p style={{ color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.6 }}>{review.comment}</p>
                    <small style={{ color: "var(--muted)" }}>{new Date(review.created_at).toLocaleDateString(locale)}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="guide-sidebar">
          <div className="booking-widget">
            <div>
              <p className="widget-price">{gp.hourly_rate} <span>{m.hourlyRate}</span></p>
              <p className="widget-meta">
                <strong>{m.maxParticipants}:</strong> {gp.max_participants}
              </p>
            </div>
            <Link href={`/${locale}/guides/${id}/book`} className="button button-primary">
              {m.bookNowBtn}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
