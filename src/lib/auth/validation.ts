import type { Locale } from "../i18n";

export type RegistrationRole = "tourist" | "guide";
export function registrationRole(value: unknown): RegistrationRole | null {
  return value === "tourist" || value === "guide" ? value : null;
}
export function emailValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function passwordValid(value: unknown): value is string {
  return typeof value === "string" && value.length >= 12 && value.length <= 128;
}
export function shortText(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}
export function callbackDestination(locale: Locale, next: string | null) {
  return next === `/${locale}/update-password` ? next : `/${locale}/account`;
}
