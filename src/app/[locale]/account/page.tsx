import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/auth/server";
import { signOut } from "@/lib/auth/actions";
import { authMessages } from "@/content/auth";
import { GuideForm, type GuideProfile } from "@/components/auth-forms";

export default async function Account({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { client, profile } = await requireAccount(locale);
  const m = authMessages(locale);
  let guide: GuideProfile | null = null;
  if (profile.role === "guide") {
    const { data, error } = await client.from("guide_profiles").select("user_id, city, bio, status, review_reason").eq("user_id", profile.id).single<GuideProfile>();
    if (error) throw new Error("Guide profile could not be loaded");
    guide = data;
  }
  return <main id="main-content" className="container account-page" tabIndex={-1}>
    <p className="eyebrow">{m.account}</p><h1>{profile.display_name || m.account}</h1><p>{m.role}: {m[profile.role]}</p>
    <p>{m.developmentNote}</p>
    {guide && <section><h2>{m.profile}</h2><GuideForm locale={locale} name={profile.display_name} guide={guide} /></section>}
    {profile.role === "admin" && <Link className="button button-primary" href={`/${locale}/admin/guides`}>{m.reviewTitle}</Link>}
    {profile.role === "tourist" && <p>{m.noBookings}</p>}
    <form action={signOut.bind(null, locale)}><button className="button" type="submit">{m.logout}</button></form>
  </main>;
}
