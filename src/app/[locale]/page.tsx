import Image from "next/image";
import { notFound } from "next/navigation";
import { getMessages } from "@/content/messages";
import { isLocale } from "@/lib/i18n";
import { getSupabaseAdmin } from "@/lib/auth/admin";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  // Fetch some top guides (placeholder logic, we can fetch real guides if available)
  let topGuides: any[] = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('profiles').select('*').eq('role', 'guide').eq('is_guide_verified', true).limit(3);
    if (data) topGuides = data;
  } catch (e) {
    console.error("Failed to fetch guides for homepage", e);
  }

  return (
    <main id="main-content" tabIndex={-1}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <Image src="https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=2000&auto=format&fit=crop" alt="Saudi Arabia" fill className="hero-img" priority />
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title">{m.heroTitle}</h1>
          <form className="hero-search" action={`/${locale}/guides`}>
            <div className="search-input-group">
              <label htmlFor="city" className="sr-only">City</label>
              <input type="text" id="city" name="city" placeholder={m.heroSearchWhere} className="search-input" />
            </div>
            <div className="search-input-group">
              <label htmlFor="date" className="sr-only">Date</label>
              <input type="date" id="date" name="date" placeholder={m.heroSearchWhen} className="search-input date-input" />
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
              <Image src={dest.image} alt={dest.name} width={600} height={400} className="destination-img" />
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
              <a href={`/${locale}/guides?interest=${interest.title}`} className="interest-card" key={i}>
                <span className="interest-icon" aria-hidden="true">{interest.icon}</span>
                <h3>{interest.title}</h3>
              </a>
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
                  <Image src={guide.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"} alt={guide.full_name} width={200} height={200} className="guide-avatar" />
                  <span className="badge-verified">{m.verified}</span>
                </div>
                <div className="guide-info">
                  <h3>{guide.full_name}</h3>
                  <p className="guide-city">{guide.city || m.destinations[0].name}</p>
                  <p className="guide-price">
                    <strong>150</strong> {m.guideHourly}
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
      <section className="trust-section" aria-labelledby="trust-title">
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
