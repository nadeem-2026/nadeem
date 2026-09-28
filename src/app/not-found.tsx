import Link from "next/link";
import { getRequestLocale } from "@/lib/request-locale";
import { getMessages } from "@/content/messages";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const m = getMessages(locale);
  return <main id="main-content" className="container feedback-page" tabIndex={-1}>
    <p className="eyebrow">404</p><h1>{m.notFoundTitle}</h1><p>{m.notFoundText}</p>
    <Link className="button button-primary" href={`/${locale}`}>{m.backHome}</Link>
  </main>;
}
