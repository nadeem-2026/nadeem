import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  Compass,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تواصل معنا | نديم" : "Contact Us | Nadeem",
    description: isAr 
      ? "تواصل مع فريق منصة نديم. نحن هنا للإجابة على استفساراتك وتقديم المساعدة بشأن رحلاتك السياحية وانضمامك كمرشد معتمد في المملكة."
      : "Contact the Nadeem team. We are here to answer your questions and assist with tours or guide partnerships in Saudi Arabia.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const faqs = [
    {
      q: isAr ? "كيف أقوم باختيار وحجز المرشد السياحي المناسب؟" : "How do I choose and book the right tour guide?",
      a: isAr 
        ? "يمكنك تصفح صفحة المرشدين وتصفيتهم بحسب المدينة واللغات والاهتمامات (تاريخية، جبلية، بحرية). بعد اختيار المرشد، حدد التاريخ والوقت المناسبين وأكمل الحجز فوراً وبكل سهولة."
        : "You can browse our tour guides and filter by city, languages, and specialties (historical, hiking, coastal). Once selected, pick your preferred date and time to instantly complete your booking."
    },
    {
      q: isAr ? "هل يمكنني إلغاء الحجز أو تعديل موعد الجولة؟" : "Can I cancel or reschedule my tour booking?",
      a: isAr 
        ? "نعم، يمكنك إلغاء الحجز أو طلب تعديل الموعد عبر صفحة حسابك قبل 24 ساعة من موعد انطلاق الجولة مع استرداد كامل المبلغ وفق سياسة الإلغاء المرنة لدينا."
        : "Yes, you can cancel or request a reschedule through your account page up to 24 hours prior to the tour start time with a full refund under our flexible policy."
    },
    {
      q: isAr ? "كيف يمكنني الانضمام كمرشد سياحي معتمد في نديم؟" : "How can I join as a certified tour guide on Nadeem?",
      a: isAr 
        ? "إذا كنت حاصلاً على رخصة إرشاد سياحي سارية من وزارة السياحة السعودية، يمكنك التقديم مباشرة عبر صفحة 'انضم كمرشد'، وسيقوم فريقنا بمراجعة طلبك وتفعيله خلال 48 ساعة."
        : "If you hold a valid tour guide license from the Saudi Ministry of Tourism, apply through our 'Become a Guide' page. Our team reviews and approves applications within 48 hours."
    },
    {
      q: isAr ? "هل المدفوعات آمنة ومضمونة عبر المنصة؟" : "Are payments safe and guaranteed on the platform?",
      a: isAr 
        ? "جميع المعاملات المالية مشفرة بالكامل ومتوافقة مع أعلى معايير الأمان المصرفي. يتم الاحتفاظ بمبلغ الجولة ولا يُحوّل للمرشد إلا بعد إتمام الجولة ورضا الزائر بنجاح."
        : "All transactions are fully encrypted following bank-grade security standards. Payments are securely held and only released to the guide after the tour is satisfactorily completed."
    }
  ];

  return (
    <main id="main-content" className="py-12 md:py-16">
      <div className="container">
        
        {/* Breadcrumb / Eyebrow */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--background-alt)] border border-[var(--border)] text-xs font-semibold text-[var(--color-primary)]">
            <Sparkles size={14} />
            <span>{isAr ? "مركز الدعم وخدمة العملاء" : "Customer Support & Inquiries"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-4 text-[var(--color-text)] tracking-tight">
            {isAr ? "نحن هنا لمساعدتك في أي وقت" : "We're Here to Help You Anytime"}
          </h1>
          <p className="text-[var(--muted)] text-base sm:text-lg max-w-2xl leading-relaxed">
            {isAr 
              ? "سواء كنت زائرًا يخطط لرحلته القادمة، أو مرشدًا ترغب بالانضمام لعائلة نديم، فريقنا متواجد للإجابة على جميع استفساراتك وتسهيل تجربتك."
              : "Whether you're a traveler planning your next Saudi journey or a licensed guide eager to join Nadeem, we are always here to assist."}
          </p>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">
                {isAr ? "استجابة سريعة" : "Rapid Response"}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {isAr ? "رد على الاستفسارات خلال ساعات قليلة" : "Replies within a few business hours"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">
                {isAr ? "دعم موثوق ومحلي" : "Trusted Local Team"}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {isAr ? "فريق عمل سعودي خبير بالوجهات" : "Saudi team specialized in destinations"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">
                {isAr ? "تغطية شاملة للمملكة" : "Kingdom-wide Coverage"}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {isAr ? "خدمة تغطي كافة مناطق ومدن السعودية" : "Covering all regions across Saudi Arabia"}
              </p>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section: Form + Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Form Column */}
          <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {isAr ? "أرسل لنا استفسارك" : "Send Us a Message"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)]">
                  {isAr 
                    ? "املأ الحقول التالية وسيتواصل معك مختص من فريقنا بأقرب وقت" 
                    : "Fill in the fields below and a team specialist will reply shortly"}
                </p>
              </div>
            </div>

            <ContactForm locale={locale} />
          </div>

          {/* Direct Channels & Map Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Card */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                    {isAr ? "محادثة فورية عبر واتساب" : "Instant WhatsApp Support"}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-700/90 dark:text-emerald-300/80 mt-1 mb-4 leading-relaxed">
                    {isAr 
                      ? "هل تحتاج لمساعدة فورية أو حجز عاجل؟ تحدث مباشرة مع خدمة عملاء نديم على واتساب."
                      : "Need quick help or urgent booking assistance? Chat directly with Nadeem support on WhatsApp."}
                  </p>
                  <a
                    href="https://wa.me/966501234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
                  >
                    <span>{isAr ? "تحدث معنا الآن" : "Start Chat Now"}</span>
                    <ArrowIcon size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] space-y-5 shadow-xs">
              <h3 className="text-base font-bold text-[var(--color-text)]">
                {isAr ? "بيانات التواصل المباشر" : "Direct Contact Details"}
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-medium">
                    {isAr ? "الهاتف المباشر" : "Phone Number"}
                  </div>
                  <a href="tel:+966501234567" dir="ltr" className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition">
                    +966 50 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-medium">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </div>
                  <a href="mailto:hello@nadeem-sa.com" className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition">
                    hello@nadeem-sa.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-medium">
                    {isAr ? "ساعات الدعم" : "Working Hours"}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {isAr ? "يومياً من 8:00 صباحاً حتى 10:00 مساءً" : "Daily: 8:00 AM – 10:00 PM (KSA)"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--background-alt)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs text-[var(--muted)] font-medium">
                    {isAr ? "المقر الرئيسي" : "Headquarters"}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {isAr ? "طريق الملك فهد، الرياض، المملكة العربية السعودية" : "King Fahd Road, Riyadh, Saudi Arabia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Google Map Card */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs bg-[var(--color-surface)]">
              <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[var(--color-primary)]" />
                  {isAr ? "موقع المكتب الرئيسي في الرياض" : "Riyadh Office Location"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-bold">
                  KSA
                </span>
              </div>
              <div className="h-52 w-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115934.33120610313!2d46.738586!3d24.774265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nadeem Office Riyadh"
                />
              </div>
            </div>

          </div>

        </div>

        {/* FAQ Section */}
        <div className="pt-8 border-t border-[var(--border)] mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--background-alt)] text-xs font-semibold text-[var(--color-primary)] mb-3">
              <HelpCircle size={14} />
              <span>{isAr ? "إجابات سريعة" : "Quick Answers"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
              {isAr ? "الأسئلة الأكثر تكراراً" : "Frequently Asked Questions"}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              {isAr 
                ? "جمعنا لك أهم الإجابات عن رحلاتك مع نديم وكيفية الاستفادة القصوى من المنصة"
                : "Key answers about traveling with Nadeem and making the most of our local experiences"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--border)] shadow-xs transition hover:border-[var(--color-primary)]"
              >
                <h3 className="text-base font-bold text-[var(--color-text)] mb-2 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--background-alt)] text-[var(--color-primary)] text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed ps-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-br from-[var(--background-alt)] to-[var(--color-surface)] border border-[var(--border)] shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] mb-3">
            {isAr ? "مستعد لاكتشاف أسرار المملكة برفقة أهلها؟" : "Ready to Discover Saudi Arabia with Local Eyes?"}
          </h3>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto mb-8 leading-relaxed">
            {isAr 
              ? "استكشف قائمة المرشدين السياحيين المعتمدين الآن، واحجز جولتك الفريدة بنقرة واحدة."
              : "Explore our certified local guides and book your unforgettable Saudi adventure in one click."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/guides`} className="button button-primary">
              <span>{isAr ? "تصفح المرشدين السياحيين" : "Browse Tour Guides"}</span>
              <ArrowIcon size={16} />
            </Link>
            <Link href={`/${locale}/become-a-guide`} className="button">
              <span>{isAr ? "انضم كمرشد سياحي" : "Become a Tour Guide"}</span>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
