import Image from "next/image";
import { notFound } from "next/navigation";
import { getMessages } from "@/content/messages";
import { GuideAvatar } from "@/components/guide-avatar";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { Map, ShieldCheck, Headphones } from "lucide-react";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  const topGuides = (await publicGuides()).slice(0, 3);

  const serviceIcons = [
    <Map key="map" className="w-10 h-10 text-emerald-800" aria-hidden="true" />,
    <ShieldCheck key="shield" className="w-10 h-10 text-emerald-800" aria-hidden="true" />,
    <Headphones key="headphones" className="w-10 h-10 text-emerald-800" aria-hidden="true" />
  ];

  return (
    <main id="main-content" tabIndex={-1}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <Image src="/photos/alula.jpg" alt="" fill sizes="100vw" className="hero-img" preload />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <p className="hero-kicker">{locale === "ar" ? "رفقة محلية. حكايات لا تُنسى." : "Local company. Lasting stories."}</p>
          <h1 className="hero-title">{m.heroTitle}</h1>
          <form className="hero-search" action={`/${locale}/guides`}>
            <div className="search-input-group">
              <label htmlFor="city" className="sr-only">{locale === "ar" ? "المدينة" : "City"}</label>
              <input type="text" id="city" name="city" placeholder={m.heroSearchWhere} className="search-input" />
            </div>
            <button type="submit" className="button button-primary search-btn">{m.heroSearchBtn}</button>
          </form>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="container section destinations-section" aria-labelledby="destinations-title">
        <h2 id="destinations-title" className="section-title">{m.destinationsTitle}</h2>
        <div className="destinations-grid">
          {m.destinations.map((dest, i) => (
            <a href={`/${locale}/guides?city=${dest.name}`} className="destination-card hover-lift fade-in" style={{ animationDelay: `${i * 100}ms` }} key={dest.id}>
              <Image src={dest.image} alt="" width={1280} height={853} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw" className="destination-img" />
              <div className="destination-overlay">
                <h3>{dest.name}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="interests-section" id="services">
        <div className="container">
          <h2 className="section-title text-center">{m.servicesTitle}</h2>
          <div className="interests-grid">
            {m.services.map((service, i) => (
              <div className="interest-card hover-lift fade-in" style={{ animationDelay: `${i * 100}ms` }} key={i}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3>{service.title}</h3>
                <p style={{ color: "var(--muted)", marginTop: "12px", fontSize: "0.95rem", lineHeight: "1.6" }}>{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Guides Section */}
      {topGuides.length > 0 && (
        <section className="container section guides-section" aria-labelledby="guides-title">
          <h2 id="guides-title" className="section-title">{m.topGuidesTitle}</h2>
          <div className="guides-grid">
            {topGuides.map((guide, i) => (
              <a href={`/${locale}/guides/${guide.id}`} className="guide-card hover-lift fade-in" style={{ animationDelay: `${i * 100}ms` }} key={guide.id}>
                <div className="guide-avatar-container">
                  <GuideAvatar src={guide.avatar_url} name={guide.display_name} size={200} className="guide-avatar" />
                  <span className="badge-verified">{m.verified}</span>
                </div>
                <div className="guide-info">
                  <h3>{guide.display_name}</h3>
                  <p className="guide-city">{guide.city}</p>
                  <p className="guide-price">
                    <strong>{guide.hourly_rate}</strong> {m.guideHourly}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container section how-section" id="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title text-center">{m.howTitle}</h2>
        <ol className="steps-grid">
          {m.howSteps.map((step, index) => (
            <li className="step-card hover-lift fade-in" style={{ animationDelay: `${index * 100}ms` }} key={index}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust Section */}
      <section className="trust-section" id="about" aria-labelledby="trust-title">
        <div className="container">
          <h2 id="trust-title" className="section-title text-center">{m.trustTitle}</h2>
          <div className="trust-grid">
            {m.trustFeatures.map((feature, i) => (
              <div className="trust-card hover-lift fade-in" style={{ animationDelay: `${i * 100}ms` }} key={i}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container section contact-section" id="contact" aria-labelledby="contact-title">
        <div className="contact-card" style={{ background: "var(--section-accent)", padding: "64px 20px", borderRadius: "var(--radius-card)", textAlign: "center" }}>
          <h2 id="contact-title" className="section-title">{m.contactTitle}</h2>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>{m.contactText}</p>
          <form style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }} action={`/${locale}`}>
            <input type="email" placeholder={m.contactEmailPlaceholder} style={{ padding: "16px", borderRadius: "var(--radius-button)", border: "1px solid var(--border)", background: "var(--color-surface)", fontSize: "1rem", outline: "none", color: "var(--foreground)", width: "100%" }} required />
            <textarea placeholder={m.contactMessagePlaceholder} rows={4} style={{ padding: "16px", borderRadius: "var(--radius-button)", border: "1px solid var(--border)", background: "var(--color-surface)", fontSize: "1rem", outline: "none", color: "var(--foreground)", width: "100%", resize: "vertical" }} required></textarea>
            <button type="submit" className="button button-primary" style={{ width: "100%", justifyContent: "center" }}>{m.contactBtn}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
