import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { GuideEarningsCalculator } from "@/components/guide-earnings-calculator";
import { 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Globe2, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  FileCheck2,
  Award
} from "lucide-react";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "انضم كمرشد سياحي | نديم" : "Become a Tour Guide | Nadeem",
    description: locale === "ar" 
      ? "حوّل شغفك بوطنك وتاريخك إلى عوائد مجزية. انضم إلى نخبة المرشدين السياحيين المعتمدين في المملكة العربية السعودية مع نديم."
      : "Turn your passion for Saudi heritage into rewarding income. Join certified tour guides with Nadeem.",
  };
}

export default async function BecomeAGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const benefits = [
    {
      title: isAr ? "عوائد مجزية ومدفوعات مضمونة" : "High Payouts & Guaranteed Pay",
      desc: isAr 
        ? "حدد سعرك بالساعة واستلم أرباحك مباشرة ومؤمنة في حسابك بعد إتمام كل جولة بنجاح دون أي تأخير."
        : "Set your own hourly rates and receive guaranteed payouts directly after each completed tour.",
      icon: DollarSign,
      color: "emerald"
    },
    {
      title: isAr ? "مرونة وتحكم كامل في جدولك" : "Complete Flexibility & Control",
      desc: isAr 
        ? "أنت مدير نفسك! اختر أوقات توفرك، وأيام إجازتك، وعدد المشاركين في كل جولة بكل حرية وسلاسة."
        : "You are in control. Choose your available hours, days off, and group sizes with ease.",
      icon: Calendar,
      color: "blue"
    },
    {
      title: isAr ? "سياح من جميع أنحاء العالم" : "Connect with Global Travelers",
      desc: isAr 
        ? "نربطك بزوّار وسياح حقيقيين يبحثون عن قصص محلية أصيلة وتجارب ثقافية استثنائية لا توفرها الكتب."
        : "Meet travelers from around the world looking for authentic local stories and cultural experiences.",
      icon: Globe2,
      color: "gold"
    },
    {
      title: isAr ? "منصة مرخصة وموثوقة" : "Licensed & Trusted Ecosystem",
      desc: isAr 
        ? "متوافقون تماماً مع اشتراطات وزارة السياحة السعودية، ونوفر لك مظلة احترافية تحمي حقوقك كمرشد معتمد."
        : "Fully compliant with Saudi Ministry of Tourism guidelines, providing professional backing.",
      icon: ShieldCheck,
      color: "emerald"
    }
  ];

  const requirements = isAr ? [
    "أن تكون حاصلاً على رخصة إرشاد سياحي سارية المفعول من وزارة السياحة السعودية.",
    "هوية وطنية أو إقامة سارية المفعول.",
    "معرفة عميقة بالوجهات التاريخية والتراثية والطبيعية في مدينتك.",
    "شغف بتمثيل كرم الضيافة السعودية وتقديم تجربة إنسانية لا تُنسى."
  ] : [
    "Valid tour guide license from the Saudi Ministry of Tourism.",
    "Valid National ID or Iqama.",
    "In-depth knowledge of local destinations, heritage, and culture in your city.",
    "Passion for Saudi hospitality and storytelling."
  ];

  const steps = [
    {
      num: "01",
      title: isAr ? "أنشئ حسابك كمرشد" : "Create Guide Account",
      desc: isAr ? "سجل بريدك الإلكتروني واختر حساب مرشد سياحي في أقل من دقيقة." : "Sign up with your email and select tour guide account."
    },
    {
      num: "02",
      title: isAr ? "أكمل بياناتك وارفع رخصتك" : "Submit Credentials",
      desc: isAr ? "ارفع رخصة الإرشاد السياحي والهوية وصورتك المهنية عبر معالج التسجيل السلس." : "Upload your official tourism license, ID, and profile photo."
    },
    {
      num: "03",
      title: isAr ? "التدقيق والاعتماد السريع" : "Quick Verification",
      desc: isAr ? "يقوم فريقنا بمطابقة بياناتك واعتماد ملفك خلال 24 - 48 ساعة عمل." : "Our team verifies your official license within 24–48 hours."
    },
    {
      num: "04",
      title: isAr ? "انطلق واستقبل الحجوزات" : "Start Hosting Tours",
      desc: isAr ? "يظهر ملفك في دليل نديم للسياح، وتبدأ في استقبال طلبات الحجز الفورية!" : "Your profile goes live to travelers worldwide. Start earning!"
    }
  ];

  return (
    <main id="main-content" tabIndex={-1} className="py-12 md:py-20">
      {/* Hero Section */}
      <section className="container">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
            <Award size={14} className="text-[var(--nadeem-sand)]" />
            <span>{isAr ? "بوابة المرشدين السياحيين الرسمية" : "Official Guide Community"}</span>
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight m-0">
            {isAr ? "شارك حكايات السعودية... وحقق عوائد تليق بشغفك" : "Share Saudi Stories... and Earn Great Income"}
          </h1>

          <p className="text-base md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "انضم إلى نخبة المرشدين المحليين في منصة نديم. نُمكّنك من تقديم تجارب ثقافية وسياحية فريدة لزوار المملكة وإدارة حجوزاتك بكل سهولة وأمان."
              : "Join certified local guides on Nadeem. Host authentic cultural tours for global visitors and manage your bookings effortlessly."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/signup?role=guide`}
              className="button button-primary text-base py-4 px-8 shadow-xl"
            >
              <span>{isAr ? "سجّل الآن كمرشد سياحي" : "Sign Up as Guide"}</span>
              <ArrowIcon size={18} />
            </Link>
            <Link
              href={`/${locale}/login`}
              className="button text-base py-4 px-8"
            >
              <span>{isAr ? "لديك حساب؟ تسجيل الدخول" : "Already a Guide? Log In"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container my-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] m-0">
            {isAr ? "لماذا تختار الإرشاد عبر منصة نديم؟" : "Why Guide with Nadeem?"}
          </h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            {isAr ? "صُممت المنصة خصيصاً لدعم المرشد السياحي السعودي وتمكينه تقنياً ومالياً" : "Built specifically to empower Saudi tour guides"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div 
                key={i} 
                className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--border)] shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center mb-6 shadow-xs">
                    <Icon size={26} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">{b.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed m-0">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section className="container">
        <GuideEarningsCalculator locale={locale} />
      </section>

      {/* Requirements & Licensing Section */}
      <section className="container my-20">
        <div className="p-8 md:p-14 rounded-3xl bg-[var(--background-alt)] border border-[var(--border)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider block mb-2">
                {isAr ? "معايير الجودة والاعتماد" : "Quality Standards"}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] m-0 mb-4">
                {isAr ? "ما هي شروط الانضمام كمرشد معتمد؟" : "Guide Requirements & Eligibility"}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                {isAr 
                  ? "لضمان تجربة سياحية رفيعة المستوى لضيوف المملكة، نلتزم بالمعايير المهنية الصادرة عن وزارة السياحة ونوفر لمرشدينا كل الدعم للنمو."
                  : "To ensure world-class experiences, we uphold the standards of the Ministry of Tourism."}
              </p>

              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-text)]">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] shadow-md space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <FileCheck2 size={24} />
              </div>
              <h3 className="text-lg font-bold m-0">{isAr ? "هل ترخيصك ساري وجاهز؟" : "Have your license ready?"}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                {isAr 
                  ? "يمكنك إتمام التسجيل ورفع رخصة السياحة خلال 5 دقائق فقط عبر جوالك أو حاسوبك."
                  : "Complete your onboarding in under 5 minutes from your phone or laptop."}
              </p>
              <div className="pt-2">
                <Link 
                  href={`/${locale}/signup?role=guide`}
                  className="button button-primary w-full py-3"
                >
                  <span>{isAr ? "ابدأ التسجيل الفوري" : "Start Fast Registration"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works 4 steps */}
      <section className="container my-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] m-0">
            {isAr ? "كيف تبدأ رحلتك معنا؟" : "How to Get Started"}
          </h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            {isAr ? "4 خطوات بسيطة تفصلك عن استقبال أول سائح" : "4 simple steps to your first guided tour"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] shadow-sm relative">
              <span className="text-3xl font-extrabold text-[var(--color-primary)] opacity-30 block mb-4">
                {s.num}
              </span>
              <h3 className="text-base font-bold text-[var(--color-text)] mb-2">{s.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container mt-20">
        <div className="p-10 md:p-16 rounded-3xl bg-[var(--color-primary)] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white m-0">
              {isAr ? "مستعد لمشاركة قصص مدينتك مع العالم؟" : "Ready to share your city with the world?"}
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              {isAr 
                ? "انضم اليوم إلى عائلة مرشدي نديم وكن سفيراً لتراث وحضارة المملكة العربية السعودية."
                : "Join the Nadeem family of guides today and be an ambassador for Saudi hospitality."}
            </p>
            <div className="pt-4">
              <Link
                href={`/${locale}/signup?role=guide`}
                className="py-4 px-10 rounded-full bg-[var(--nadeem-sand)] hover:bg-[#c9b88b] text-[#0e3526] font-bold text-base shadow-xl inline-flex items-center gap-2 transition"
              >
                <span>{isAr ? "انضم كمرشد سياحي الآن" : "Join as a Guide Now"}</span>
                <ArrowIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
