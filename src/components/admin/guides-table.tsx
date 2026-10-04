import { ReviewForm, type GuideProfile } from "@/components/auth-forms";
import { authMessages } from "@/content/auth";
import type { Locale } from "@/lib/i18n";

type ReviewedGuide = GuideProfile & { profiles: { display_name: string } | null };
export function GuidesTable({ guides, locale }: { guides: ReviewedGuide[]; locale: Locale }) {
  const m = authMessages(locale);
  return <div>
    {guides.length === 0 && <p>{locale === "ar" ? "لا يوجد مرشدون" : "No guides found"}</p>}
    {guides.map(guide => <section key={guide.user_id} className="account-form">
      <h2>{guide.profiles?.display_name || m.guide}</h2>
      <p>{guide.city}</p><p>{guide.bio}</p>
      <p>{m.status}: {guide.status === "suspended" ? m.guideSuspended : m[guide.status]}</p>
      <ReviewForm guide={guide} locale={locale} />
    </section>)}
  </div>;
}
