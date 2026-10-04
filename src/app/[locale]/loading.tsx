import { getRequestLocale } from "@/lib/request-locale";
import { getMessages } from "@/content/messages";

export default async function Loading() {
  const m = getMessages(await getRequestLocale());
  return (
    <main id="main-content" className="container section" tabIndex={-1} aria-busy="true">
      <div className="sr-only" role="status">{m.loading}</div>
      <div className="skeleton-header"></div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-line title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        ))}
      </div>
    </main>
  );
}
