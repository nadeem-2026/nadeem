import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { photoCredits } from "@/content/photos";

export default async function Credits({ params }: { params: Promise<{locale:string}> }) {
  const {locale}=await params; if(!isLocale(locale)) notFound();
  const ar=locale==="ar";
  return <main id="main-content" className="container information-page" tabIndex={-1}>
    <p className="eyebrow">{ar ? "عدسات توثق المكان" : "Places through a lens"}</p>
    <h1>{ar ? "مصادر الصور" : "Photo credits"}</h1>
    <p>{ar ? "صور فوتوغرافية حقيقية من Wikimedia Commons. تعرض مع تغيير الحجم واقتصاص بصري يناسب التصميم؛ يحتفظ كل عمل بترخيصه الأصلي أدناه. لا يعني استخدامها تأييد المصورين للمشروع." : "Real photographs from Wikimedia Commons, resized and visually cropped to fit the layout. Each work retains the license below. Use does not imply endorsement by the photographers."}</p>
    <div className="credits-grid">{photoCredits.map(photo=><article className="info-card" key={photo.id}>
      <h2>{photo.title}</h2><p>{photo.author}</p>
      <a href={photo.source}>{ar ? "الصورة الأصلية ومعلوماتها" : "Original photograph and details"}</a><br />
      <a href={photo.licenseUrl} dir="ltr">{photo.license}</a>
    </article>)}</div>
  </main>;
}
