import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { publicGuides } from "@/lib/guides/public";
import { guidesMessages } from "@/content/guides";
import { GuideAvatar } from "@/components/guide-avatar";
import { authClient } from "@/lib/auth/server";
import { 
  MapPin, Star, ShieldCheck, Users, Clock, Award, 
  Languages as LanguagesIcon, CheckCircle2, ArrowRight, ArrowLeft,
  CalendarCheck, MessageSquare
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) notFound();

  return {
    title: locale === "ar" ? `${profile.display_name} - مرشد سياحي معتمد | نديم` : `${profile.display_name} - Certified Tour Guide | Nadeem`,
    description: profile.bio ? profile.bio.slice(0, 160) : (locale === "ar" ? "احجز جولتك السياحية مع مرشد مرخص ومعتمد في المملكة العربية السعودية" : "Book your tour with a licensed guide in Saudi Arabia"),
    openGraph: {
      title: locale === "ar" ? `${profile.display_name} | نديم` : `${profile.display_name} | Nadeem`,
      description: profile.bio ? profile.bio.slice(0, 160) : ""
    }
  };
}

interface GuideReview {
  rating: number;
  comment: string | null;
  created_at: string;
  tourist: { display_name: string | null } | null;
}

export default async function GuideDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  
  const isAr = locale === "ar";
  const m = guidesMessages(locale);
  const profile = (await publicGuides()).find(guide => guide.id === id);
  if (!profile) notFound();
  const gp = profile;

  const client = await authClient();
  let reviews: GuideReview[] = [];
  if (client) {
    const { data } = await client
      .from("reviews")
      .select("rating, comment, created_at, tourist:profiles!tourist_id(display_name)")
      .eq("guide_id", id)
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      reviews = data as unknown as GuideReview[];
    }
  }

  return (
    <main className="container section" id="main-content" tabIndex={-1}>
      {/* Breadcrumb Back Button */}
      <div style={{ marginBottom: "2rem" }}>
        <Link 
          href={`/${locale}/guides`} 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "var(--color-primary)", 
            textDecoration: "none", 
            fontWeight: 600,
            fontSize: "0.95rem"
          }}
        >
          {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span>{m.backToSearch}</span>
        </Link>
      </div>

      <div className="guide-details-grid">
        {/* Main Content Column */}
        <div className="guide-main" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Hero Profile Header Card */}
          <div 
            className="dashboard-card" 
            style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "28px", 
              alignItems: "center", 
              position: "relative", 
              overflow: "hidden",
              padding: "2rem"
            }}
          >
            <div 
              style={{ 
                position: "absolute", 
                top: 0, 
                left: 0, 
                right: 0, 
                height: "100px", 
                background: "linear-gradient(135deg, rgba(14, 53, 38, 0.15) 0%, rgba(229, 217, 182, 0.25) 100%)", 
                zIndex: 0 
              }}
            />

            <div style={{ position: "relative", zIndex: 1, marginTop: "20px" }}>
              <GuideAvatar src={profile.avatar_url} name={profile.display_name} size={150} className="guide-avatar-large shadow-lg" />
            </div>

            <div style={{ position: "relative", zIndex: 1, marginTop: "30px", flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                <h1 style={{ fontSize: "2.1rem", margin: 0, color: "var(--foreground)", fontWeight: 800 }}>
                  {profile.display_name}
                </h1>
                <span 
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "5px", 
                    fontSize: "0.8rem", 
                    background: "var(--color-primary)", 
                    color: "white", 
                    padding: "4px 12px", 
                    borderRadius: "20px",
                    fontWeight: 600
                  }}
                >
                  <ShieldCheck size={14} className="text-emerald-300" />
                  <span>{isAr ? "مرخص من وزارة السياحة" : "Ministry Licensed"}</span>
                </span>
              </div>

              <div style={{ color: "var(--muted)", fontSize: "1rem", display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} style={{ color: "var(--color-primary)" }} />
                  <strong>{gp.city}</strong>
                </span>

                {gp.review_count > 0 ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ display: "flex", color: "#F59E0B" }}>
                      <Star size={16} fill="#F59E0B" />
                    </div>
                    <strong style={{ color: "var(--foreground)" }}>{gp.avg_rating.toFixed(1)}</strong>
                    <span>({gp.review_count} {isAr ? "تقييم معتمد" : "verified reviews"})</span>
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)", fontSize: "0.9rem" }}>
                    <Award size={16} style={{ color: "var(--color-primary)" }} />
                    <span>{isAr ? "مرشد معتمد في المنصة" : "Platform Verified"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About the Guide */}
          <div className="dashboard-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 16px", color: "var(--foreground)", fontWeight: 700 }}>
              {m.aboutGuide}
            </h2>
            <p style={{ lineHeight: 1.85, fontSize: "1.05rem", color: "var(--color-text)", whiteSpace: "pre-wrap", margin: 0 }}>
              {gp.bio}
            </p>
          </div>

          {/* Languages & Service Areas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* Languages */}
            <div className="dashboard-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <LanguagesIcon size={18} style={{ color: "var(--color-primary)" }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>{m.languages}</h3>
              </div>
              <div className="pills-list">
                {(gp.languages || []).map((lang: string) => (
                  <span key={lang} className="pill" style={{ padding: "6px 14px", fontWeight: 500 }}>
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="dashboard-card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <MapPin size={18} style={{ color: "var(--color-primary)" }} />
                <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>{m.serviceAreas}</h3>
              </div>
              <div className="pills-list">
                {(gp.service_areas || []).map((area: string) => (
                  <span key={area} className="pill" style={{ padding: "6px 14px", fontWeight: 500 }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inclusions */}
          {gp.inclusions.length > 0 && (
            <div className="dashboard-card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", margin: "0 0 16px", color: "var(--foreground)", fontWeight: 700 }}>
                {m.whatIsIncluded}
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {gp.inclusions.map((inclusion, index) => (
                  <li 
                    key={index} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      padding: "10px 14px", 
                      borderRadius: "10px",
                      background: "var(--background-alt)",
                      border: "1px solid var(--border)",
                      fontSize: "0.95rem"
                    }}
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span style={{ fontWeight: 500 }}>{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews Section */}
          <div className="dashboard-card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare size={20} style={{ color: "var(--color-primary)" }} />
                <h2 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 700 }}>
                  {locale === "ar" ? "تقييمات وتجارب السياح" : "Tourist Reviews"}
                </h2>
              </div>
              {gp.review_count > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={16} fill="#F59E0B" className="text-amber-500" />
                  <strong style={{ fontSize: "1.1rem" }}>{gp.avg_rating.toFixed(1)}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>/ 5</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--muted)" }}>
                <p style={{ margin: 0, fontSize: "1rem" }}>
                  {locale === "ar" ? "لا توجد تقييمات مكتوبة بعد. كن أول من يخوض التجربة مع المرشد!" : "No reviews written yet. Be the first to take a tour with this guide!"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map((review, i) => (
                  <div key={i} style={{ padding: "1.25rem", borderRadius: "14px", background: "var(--background-alt)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                          {(review.tourist?.display_name || "س")[0].toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "0.95rem" }}>
                            {review.tourist?.display_name || (locale === "ar" ? "سائح معتمد" : "Verified Tourist")}
                          </strong>
                          <small style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                            {new Date(review.created_at).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                          </small>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#F59E0B" }}>
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            size={15} 
                            fill={starIdx < review.rating ? "#F59E0B" : "none"} 
                            color="#F59E0B" 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ color: "var(--foreground)", margin: "0", lineHeight: 1.6, fontSize: "0.95rem" }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Booking Sidebar */}
        <aside className="guide-sidebar">
          <div className="dashboard-card" style={{ position: "sticky", top: "40px", padding: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", fontWeight: 500 }}>
                  {isAr ? "سعر الجولة" : "Tour Rate"}
                </span>
                <div>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                    {gp.hourly_rate}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", marginInlineStart: "4px" }}>
                    {m.hourlyRate}
                  </span>
                </div>
              </div>

              <div style={{ height: "1px", background: "var(--border)", margin: "20px 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={16} style={{ color: "var(--color-primary)" }} />
                    <span>{m.maxParticipants}</span>
                  </span>
                  <strong style={{ color: "var(--foreground)" }}>
                    {gp.max_participants} {isAr ? "أشخاص كحد أقصى" : "people max"}
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={16} style={{ color: "var(--color-primary)" }} />
                    <span>{isAr ? "إشعار الحجز المسبق" : "Notice Required"}</span>
                  </span>
                  <strong style={{ color: "var(--foreground)" }}>
                    {isAr ? "24 ساعة على الأقل" : "24 hours notice"}
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CalendarCheck size={16} style={{ color: "var(--color-primary)" }} />
                    <span>{isAr ? "حالة التوفر" : "Availability"}</span>
                  </span>
                  <span className="badge badge-approved" style={{ fontSize: "0.75rem" }}>
                    {isAr ? "متاح للحجز الفوري" : "Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <Link 
              href={`/${locale}/guides/${id}/book`} 
              className="button button-primary" 
              style={{ 
                width: "100%", 
                justifyContent: "center", 
                padding: "16px",
                fontSize: "1.05rem",
                fontWeight: 700
              }}
            >
              <CalendarCheck size={18} />
              <span>{m.bookNowBtn}</span>
            </Link>

            {/* Guarantee / Trust Badges */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "var(--muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{isAr ? "دفع آمن ومحمي بالكامل عبر منصة نديم" : "100% Secure Payment via Nadeem"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{isAr ? "ضمان استرداد المبلغ وفق سياسة الإلغاء" : "Cancellation & Refund Guarantee"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
