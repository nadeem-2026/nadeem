import Link from "next/link";
import Image from "next/image";
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
    .select("id, display_name, avatar_url, guide_profiles!inner(*)")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const gp = Array.isArray(profile.guide_profiles) ? profile.guide_profiles[0] : profile.guide_profiles;
  
  if (gp.status !== "approved") {
    return (
      <main className="container section" id="main-content" tabIndex={-1}>
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🔒</span>
          <h3>{m.notApproved}</h3>
          <Link href={`/${locale}/guides`} className="button" style={{ marginTop: "1rem" }}>{m.backToSearch}</Link>
        </div>
      </main>
    );
  }

  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop";

  return (
    <main className="container section" id="main-content" tabIndex={-1}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/${locale}/guides`} style={{ display: "inline-block", color: "var(--nadeem-green)", textDecoration: "none", fontWeight: 500 }}>
          <span aria-hidden="true">&larr;</span> {m.backToSearch}
        </Link>
      </div>

      <div className="guide-details-grid">
        <div className="guide-main">
          
          <div className="guide-header-compact">
            <Image src={profile.avatar_url || defaultAvatar} alt={profile.display_name} width={200} height={200} className="guide-avatar-large" />
            <div>
              <h1 style={{ fontSize: "2.5rem", margin: "0 0 8px", color: "var(--nadeem-green)" }}>{profile.display_name} <span style={{ fontSize: "1rem", verticalAlign: "middle", background: "var(--nadeem-green)", color: "white", padding: "2px 10px", borderRadius: "12px" }}>✓</span></h1>
              <div style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
                <span>📍 {gp.city}</span>
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

          {gp.what_is_included && (
            <section style={{ borderBottom: "none" }}>
              <h2>{m.whatIsIncluded}</h2>
              <p style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                {gp.what_is_included}
              </p>
            </section>
          )}
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
