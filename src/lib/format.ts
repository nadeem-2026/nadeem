import type { Locale } from "./i18n";
import { platform } from "./platform";

export type Currency = (typeof platform.supportedDisplayCurrencies)[number];
const numberLocale = { ar: "ar-SA-u-nu-latn", en: "en-SA" } as const;

/** Formats an already denominated amount. Never converts or supplies an FX rate. */
export function formatMoney(minorUnits: number, currency: Currency, locale: Locale) {
  if (!Number.isSafeInteger(minorUnits) || minorUnits < 0) {
    throw new RangeError("Amount must be a non-negative safe integer in minor units.");
  }
  if (!platform.supportedDisplayCurrencies.some((value) => value === currency)) {
    throw new RangeError("Unsupported currency.");
  }
  const formatter = new Intl.NumberFormat(numberLocale[locale], {
    style: "currency", currency, currencyDisplay: "code",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  // Keep the cents exact even near Number.MAX_SAFE_INTEGER; division into a
  // floating-point currency amount could otherwise lose a minor unit.
  const amount = BigInt(minorUnits);
  const fraction = (amount % 100n).toString().padStart(2, "0");
  return formatter.formatToParts(amount / 100n)
    .map((part) => part.type === "fraction" ? fraction : part.value).join("");
}

/** Inputs must identify an instant; parsing ambiguous local date strings is a caller error. */
export function formatRiyadhDateTime(instant: Date, locale: Locale) {
  if (!Number.isFinite(instant.getTime())) throw new RangeError("Invalid instant.");
  return new Intl.DateTimeFormat(numberLocale[locale], {
    timeZone: platform.timeZone,
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    timeZoneName: "short",
  }).format(instant);
}
