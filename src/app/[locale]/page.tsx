import Image from "next/image";
import { notFound } from "next/navigation";
import { getMessages } from "@/content/messages";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  const topGuides = (await publicGuides()).slice(0, 3);

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
          {m.destinations.map((dest) => (
            <a href={`/${locale}/guides?city=${dest.name}`} className="destination-card" key={dest.id}>
              <Image src={dest.image} alt="" width={1280} height={853} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw" className="destination-img" />
              <div className="destination-overlay">
                <h3>{dest.name}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Interests Section */}
      <section className="interests-section">
        <div className="container">
          <h2 className="section-title text-center">{m.interestsTitle}</h2>
          <div className="interests-grid">
            {m.interests.map((interest, i) => (
              <div className="interest-card" key={i}>
                <span className="interest-icon" aria-hidden="true">{interest.icon}</span>
                <h3>{interest.title}</h3>
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
            {topGuides.map((guide) => (
              <a href={`/${locale}/guides/${guide.id}`} className="guide-card" key={guide.id}>
                <div className="guide-avatar-container">
                  <Image src={"/brand/nadeem-symbol-reverse.svg"} alt={guide.display_name} width={200} height={200} className="guide-avatar" />
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
            <li className="step-card" key={index}>
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
              <div className="trust-card" key={i}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
