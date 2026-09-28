export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}

export function direction(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
