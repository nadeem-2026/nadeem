# دمج هوية نديم في الموقع

1. انسخ ملفات الشعار من `svg` إلى `public/brand`.
2. انسخ محتويات `favicon` إلى `public`.
3. أضف رموز `nadeem-tokens.css` إلى CSS المشروع وحمّل الخطوط بصورة مستقلة.
4. اختر `nadeem-logo-primary.svg` للخلفية الفاتحة و`nadeem-logo-reverse.svg` للداكنة.

مثال HTML عام، بعد نسخ الملفات إلى المسارات المذكورة:

```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48 64x64">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<img src="/brand/nadeem-logo-primary.svg" alt="نديم — منصة حجز المرشدين السياحيين" width="220" style="height:auto">
```

في Next.js طبّق إعداد الأيقونات بأسلوب metadata أو الملفات المناسب لنسخة المشروع، ولا تكرر تسجيلها عبر آليتين. لا تقلب صورة الشعار عند تطبيق RTL.

المقاسات 192 و512 متاحة لاستخدامات الويب المستقبلية؛ لا توجد إضافة تلقائية لتثبيت PWA أو تطبيقات أصلية.
