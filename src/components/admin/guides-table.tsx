"use client";

import { ReviewForm, type GuideProfile } from "@/components/auth-forms";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";

type ReviewedGuide = GuideProfile & { profiles: { display_name: string } | null };

export function GuidesTable({ guides, locale }: { guides: ReviewedGuide[]; locale: Locale }) {
  const m = authMessages(locale);
  const isAr = locale === "ar";
  
  return <div className="admin-guides-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {guides.length === 0 && <p>{isAr ? "لا يوجد مرشدون" : "No guides found"}</p>}
    {guides.map(guide => (
      <section key={guide.user_id} className="account-form" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--card-background, #fff)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{guide.profiles?.display_name || m.guide}</h2>
          <span className={`status-badge status-${guide.status}`} style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', background: guide.status === 'approved' ? '#dcfce7' : '#fef08a', color: guide.status === 'approved' ? '#166534' : '#854d0e' }}>
            {guide.status === "suspended" ? m.guideSuspended : m[guide.status]}
          </span>
        </div>
        
        <div className="guide-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ color: 'var(--text-muted, #666)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{isAr ? "الأسماء والمطابقة" : "Names & Verification"}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.6 }}>
              <li><strong>{isAr ? "الاسم الأول والأخير" : "First & Last"}:</strong> {guide.first_name} {guide.last_name}</li>
              <li><strong>{isAr ? "الاسم العربي" : "Arabic Name"}:</strong> {guide.full_name_ar}</li>
              <li><strong>{isAr ? "الاسم الإنجليزي" : "English Name"}:</strong> {guide.full_name_en}</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text-muted, #666)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{isAr ? "الموقع الجغرافي" : "Location"}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.6 }}>
              <li><strong>{isAr ? "المدينة الأساسية" : "Primary City"}:</strong> {guide.city}</li>
              <li><strong>{isAr ? "مناطق الخدمة" : "Service Areas"}:</strong> {guide.service_areas?.join('، ')}</li>
              <li><strong>{isAr ? "العنوان" : "Address"}:</strong> {typeof guide.address_details === 'string' ? guide.address_details : JSON.stringify(guide.address_details)}</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-muted, #666)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{isAr ? "الخدمات والتسعير" : "Services & Pricing"}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.6 }}>
              <li><strong>{isAr ? "السعر بالساعة" : "Hourly Rate"}:</strong> {guide.hourly_rate} SAR</li>
              <li><strong>{isAr ? "أقصى عدد مشاركين" : "Max Participants"}:</strong> {guide.max_participants}</li>
              <li><strong>{isAr ? "اللغات" : "Languages"}:</strong> {guide.languages?.join('، ')}</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-muted, #666)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{isAr ? "الوثائق المرفقة (مخزن خاص)" : "Private Documents"}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.6 }}>
              <li><strong>{m.national_id_url}:</strong> {guide.national_id_url ? <span style={{color: 'green'}}>✓ {isAr ? "مرفوع" : "Uploaded"}</span> : <span style={{color: 'red'}}>✗ {isAr ? "مفقود" : "Missing"}</span>}</li>
              <li><strong>{m.official_license_url}:</strong> {guide.official_license_url ? <span style={{color: 'green'}}>✓ {isAr ? "مرفوع" : "Uploaded"}</span> : <span style={{color: 'red'}}>✗ {isAr ? "مفقود" : "Missing"}</span>}</li>
              <li><strong>{m.language_certificates}:</strong> {guide.language_certificates ? <span style={{color: 'green'}}>✓ {isAr ? "مرفوع" : "Uploaded"}</span> : <span style={{color: 'orange'}}>— {isAr ? "غير متوفر" : "N/A"}</span>}</li>
              <li style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>{isAr ? "(للأمان، يتم مراجعة الملفات من قبل الدعم الفني مباشرة عبر الكونسول)" : "(For security, access files directly via support console)"}</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--background-alt, #f9f9f9)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>{m.bio}</h4>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{guide.bio}</p>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <ReviewForm guide={guide} locale={locale} />
        </div>
      </section>
    ))}
  </div>;
}
