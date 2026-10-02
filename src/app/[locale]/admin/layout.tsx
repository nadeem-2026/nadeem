import { requireAccount } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { profile } = await requireAccount(locale);

  if (profile.role !== "admin") {
    notFound();
  }

  const isAr = locale === "ar";

  return (
    <div className="container" style={{ display: "flex", gap: "2rem", paddingTop: "2rem", paddingBottom: "4rem" }}>
      <aside style={{ width: "250px", flexShrink: 0 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 className="text-xl font-bold mb-4">{isAr ? "لوحة التحكم" : "Dashboard"}</h2>
          <Link href={`/${locale}/admin`} className="hover:text-primary">
            {isAr ? "نظرة عامة" : "Overview"}
          </Link>
          <Link href={`/${locale}/admin/guides`} className="hover:text-primary">
            {isAr ? "المرشدين" : "Guides"}
          </Link>
          <Link href={`/${locale}/admin/complaints`} className="hover:text-primary">
            {isAr ? "الشكاوى" : "Complaints"}
          </Link>
        </nav>
      </aside>
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  );
}
