import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { guidesMessages } from "@/content/guides";

export default async function GuideDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const m = guidesMessages(locale);
  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) notFound();
  const gp = profile;
  const defaultAvatar = "/brand/nadeem-symbol-reverse.svg";

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
            <Image src={defaultAvatar} alt={profile.display_name} width={200} height={200} className="guide-avatar-large" />
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

          {gp.inclusions.length > 0 && (
            <section style={{ borderBottom: "none" }}>
              <h2>{m.whatIsIncluded}</h2>
              <p style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
                {gp.inclusions.join(" • ")}
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
