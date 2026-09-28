import Image from "next/image";
import { notFound } from "next/navigation";
import { getMessages } from "@/content/messages";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return <main id="main-content" tabIndex={-1}>
    <section className="container hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="small-line" />{m.eyebrow}</p>
        <h1 id="hero-title">{m.title}<span>{m.titleAccent}</span></h1>
        <p className="hero-intro">{m.intro}</p>
        <div className="hero-actions">
          <a href="#how-it-works" className="button button-primary">{m.primaryAction}<span aria-hidden="true">↙</span></a>
          <a href="#about" className="text-link">{m.secondaryAction}</a>
        </div>
      </div>
      <div className="brand-scene" aria-hidden="true">
        <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
        <span className="scene-corner">N / 01</span>
        <Image src="/brand/nadeem-symbol-reverse.svg" alt="" width={512} height={512} className="scene-symbol" priority />
        <div className="scene-caption"><span>{m.visualFootnote}</span><p>{m.visualCaption}</p></div>
      </div>
    </section>
    <div className="container"><dl className="details-strip">
      {m.detailLabels.map((label, i) => <div key={label}><dt>{label}</dt><dd>{m.detailValues[i]}</dd></div>)}
    </dl></div>
    <section className="container section" id="how-it-works" aria-labelledby="how-title">
      <div className="section-heading"><p className="eyebrow">{m.howEyebrow}</p><h2 id="how-title">{m.howTitle}</h2><p>{m.howDescription}</p></div>
      <ol className="steps-grid">{m.steps.map((step, index) => <li className="step-card" key={step.title}>
        <span className="step-number" aria-hidden="true">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p>
      </li>)}</ol>
    </section>
    <section className="about-section" id="about" aria-labelledby="about-title"><div className="container about-grid">
      <div><p className="eyebrow">{m.aboutEyebrow}</p><h2 id="about-title">{m.aboutTitle}</h2><p className="about-text">{m.aboutText}</p>
        <ul className="scope-list">{m.scope.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
      </div>
      <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌖</span><span className="badge">{m.guidesBadge}</span><h3>{m.guidesTitle}</h3><p>{m.guidesText}</p></div>
    </div></section>
    <section className="container section" id="platform-status" aria-labelledby="status-title">
      <div className="section-heading"><p className="eyebrow">{m.statusEyebrow}</p><h2 id="status-title">{m.statusTitle}</h2><p>{m.statusText}</p></div>
      <div className="status-grid">{m.statuses.map((item) => <article className="status-card" key={item.title}>
        <span className={`badge badge-${item.state}`}>{m[item.state]}</span><h3>{item.title}</h3><p>{item.text}</p>
      </article>)}</div>
    </section>
  </main>;
}
