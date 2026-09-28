import { getRequestLocale } from "@/lib/request-locale";
import { getMessages } from "@/content/messages";

export default async function Loading() {
  const m = getMessages(await getRequestLocale());
  return <main id="main-content" className="container feedback-page" tabIndex={-1} aria-busy="true"><p role="status">{m.loading}</p><div className="loading-placeholder" aria-hidden="true" /></main>;
}
