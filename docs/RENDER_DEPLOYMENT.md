# نشر نديم على Render

## الحالة

نُشرت النسخة التجريبية بتاريخ 30 سبتمبر 2026 على [موقع نديم](https://nadeem-rkq4.onrender.com/ar)، في مساحة `nadeem workspace` (`tea-dathh4mk1f9s7389ul00`) التي أكدها المستخدم. الخدمة `srv-dauaghvlot8c73abmnf0`، والنشر `dep-dauaginlot8c73abmpmg` وصل إلى `live` بعد نجاح البناء والتشغيل من commit `a6d634c3d09b8a68f1f88254947289fcd3edab6a`.

[لوحة الخدمة](https://dashboard.render.com/web/srv-dauaghvlot8c73abmnf0). رُبط GitHub وأضيف رابط Supabase ومفتاحه العام إلى بيئة الخدمة. لا توجد قاعدة بيانات جديدة أو خدمة مدفوعة منشأة ضمن هذا العمل.

بعد موافقة المستخدم حُفظ Site URL بالقيمة `https://nadeem-rkq4.onrender.com`، وأُضيفت روابط التأكيد والاستعادة العربية والإنجليزية الأربعة أدناه. أُعيد تحميل لوحة Supabase والتحقق من بقاء العنوان والقائمة بعد الحفظ. لا توجد wildcards أو روابط localhost ضمن القائمة الحالية. أكد المالك في المحادثة نجاح التسجيل وتسجيل الدخول على النسخة المنشورة؛ هذه نتيجة اختبار يدوي أبلغ بها المالك، وليست إعادة اختبار مستقلة من الوكيل. لم يؤكد بشكل منفصل اختبار رسالة تأكيد البريد أو الاستعادة أو الخروج.

## الخدمة المنشورة

| الحقل | القيمة |
| --- | --- |
| النوع | Web Service |
| الاسم | `nadeem` |
| المستودع | `https://github.com/nadeem-2026/nadeem` |
| الفرع | `main` |
| Runtime | Node، بالإصدار 24 المحدد في `.nvmrc` |
| الخطة | `free` |
| المنطقة | `frankfurt` |
| النشر التلقائي | مفعّل عند تحديث `main` |

يحتاج المستودع الخاص إلى صلاحية وصول لتكامل GitHub في Render. التطبيق يستخدم وظائف خادم Next.js للحسابات؛ لذلك يحتاج Web Service. يستخدم مشروع Supabase الموجود دون إنشاء قاعدة بيانات إضافية.

أمر البناء:

```sh
npm ci --include=dev && NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-$RENDER_EXTERNAL_URL}" npm run build
```

أمر التشغيل:

```sh
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-$RENDER_EXTERNAL_URL}" node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "$PORT"
```

يوفر Render متغيرَي `RENDER_EXTERNAL_URL` و`PORT`. يُشتق عنوان التطبيق من عنوان الخدمة الفعلي في البناء والتشغيل، ويمكن تجاوزه لاحقًا بإضافة `NEXT_PUBLIC_SITE_URL` لنطاق مخصص ثم إعادة البناء. يبقى أمر التشغيل المحلي في المشروع مربوطًا بـ`127.0.0.1`.

أُضيف في بيئة Render:

- `NEXT_PUBLIC_SUPABASE_URL`: عنوان مشروع Supabase الموجود.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: المفتاح العام للمشروع نفسه.

لا ترفع `.env.local` ولا تضف مفتاح خدمة. لا تنسخ قيمة Site URL المحلية إلى Render.

## التحقق بعد النشر

فحص محلي بتاريخ 30 سبتمبر 2026: نجح ESLint وفحص TypeScript وملفات اختبارات الوحدات الخمسة، بما فيها الأصول وقاعدة البيانات. تعذر إكمال بناء Turbopack لأن بيئة التنفيذ منعت فتح منفذ داخلي (`Operation not permitted`)، وتكرر ذلك بعد طلب التشغيل خارج العزل. نجح البناء نفسه لاحقًا على Render، ثم وصل النشر إلى `live`.

1. تم التحقق من `live` ونجاح البناء، ولم يُرجع فحص سجلات الأخطاء أي أخطاء.
2. نجحت استجابة GET لـ`/ar`، واستجابات HEAD لـ`/en` و`/ar/login` و`/ar/signup` بحالة 200. تحقق المتصفح من تحويل `/ar/account` و`/ar/admin/guides` إلى `/ar/login` دون جلسة. استجابة HEAD وحدها لا تثبت هذا التحويل لأن Next.js قد يرسل صفحة متدفقة بحالة 200.
3. حُفظ Site URL وروابط الرجوع التالية، وتُحقق منها بعد إعادة تحميل اللوحة:

```text
https://nadeem-rkq4.onrender.com/ar/auth/callback
https://nadeem-rkq4.onrender.com/en/auth/callback
https://nadeem-rkq4.onrender.com/ar/auth/callback?next=/ar/update-password
https://nadeem-rkq4.onrender.com/en/auth/callback?next=/en/update-password
```

4. أكد المالك نجاح التسجيل وتسجيل الدخول. المتبقي: التحقق المنفصل من تأكيد البريد، والخروج ومنع الوصول للحساب بعده، واستعادة كلمة المرور ثم الدخول بالكلمة الجديدة. إعداد SMTP للإرسال الإنتاجي ما زال بندًا مستقلًا.

الخدمة المجانية تتوقف بعد 15 دقيقة من الخمول ويستغرق استئنافها نحو دقيقة؛ تناسب هذه النسخة التجريبية. راجع [قيود الخطة المجانية](https://render.com/docs/free). مرجع الأوامر: [نشر Next.js](https://render.com/docs/deploy-nextjs-app) و[متغيرات Render الافتراضية](https://render.com/docs/environment-variables).
