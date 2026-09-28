import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/auth/server";
import { authMessages } from "@/content/auth";
import { ReviewForm, type GuideProfile } from "@/components/auth-forms";
import Link from "next/link";

export default async function Reviews({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { client, profile } = await requireAccount(locale);
  if (profile.role !== "admin") notFound();
  const m = authMessages(locale);
  const requestedPage = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10000 ? requestedPage : 1;
  const { data, error, count } = await client.from("guide_profiles").select("user_id, city, bio, status, review_reason, profile:profiles!guide_profiles_user_id_fkey(display_name)", { count: "exact" }).in("status", ["pending_review", "approved", "suspended"]).order("updated_at", { ascending: false }).order("user_id").range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error("Guide reviews could not be loaded");
  const guides = data as unknown as (GuideProfile & { profile: { display_name: string } })[];
  return <main id="main-content" className="container account-page review-page" tabIndex={-1}>
    <h1>{m.reviewTitle}</h1><p>{m.reviewNote}</p>
    {guides.length === 0 && <p>{m.empty}</p>}
    {guides.map((guide) => <article className="step-card" key={guide.user_id}>
      <h2>{guide.profile.display_name}</h2><p>{guide.city}</p><p>{guide.bio}</p><p>{m.status}: {guide.status === "suspended" ? m.guideSuspended : m[guide.status]}</p>
      <ReviewForm locale={locale} guide={guide} />
    </article>)}
    <nav className="account-links" aria-label={locale === "ar" ? "صفحات المراجعة" : "Review pages"}>
      {page > 1 && <Link href={`/${locale}/admin/guides?page=${page - 1}`}>{locale === "ar" ? "السابق" : "Previous"}</Link>}
      {page * 20 < (count ?? 0) && <Link href={`/${locale}/admin/guides?page=${page + 1}`}>{locale === "ar" ? "التالي" : "Next"}</Link>}
    </nav>
  </main>;
}
