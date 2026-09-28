import { headers } from "next/headers";
import { defaultLocale, isLocale } from "./i18n";

export async function getRequestLocale() {
  const value = (await headers()).get("x-nadeem-locale") ?? "";
  return isLocale(value) ? value : defaultLocale;
}
