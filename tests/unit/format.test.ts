import assert from "node:assert/strict";
import test from "node:test";
import { formatMoney, formatRiyadhDateTime, type Currency } from "../../src/lib/format";
import { direction, isLocale, localeFromPath } from "../../src/lib/i18n";
import { getMessages } from "../../src/content/messages";

test("locale routing accepts only whole, supported path segments", () => {
  assert.equal(localeFromPath("/en"), "en");
  assert.equal(localeFromPath("/en/missing"), "en");
  assert.equal(localeFromPath("/english"), "ar");
  assert.equal(localeFromPath("/fr"), "ar");
  assert.equal(isLocale("AR"), false);
  assert.equal(direction("ar"), "rtl");
  assert.equal(direction("en"), "ltr");
});

test("currency formatter preserves minor units without inventing conversion", () => {
  assert.match(formatMoney(12345, "SAR", "en"), /SAR.*123\.45/);
  assert.match(formatMoney(12345, "USD", "en"), /USD.*123\.45/);
  assert.match(formatMoney(1, "SAR", "ar"), /0\.01/);
  assert.match(formatMoney(0, "SAR", "en"), /0\.00/);
  assert.match(formatMoney(Number.MAX_SAFE_INTEGER, "SAR", "en"), /90,071,992,547,409\.91/);
  for (const invalid of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => formatMoney(invalid, "SAR", "en"), RangeError);
  }
  assert.throws(() => formatMoney(100, "EUR" as Currency, "en"), RangeError);
});

test("Riyadh date crosses UTC midnight correctly and is timezone explicit", () => {
  const instant = new Date("2026-09-28T22:30:00.000Z");
  const result = formatRiyadhDateTime(instant, "en");
  assert.match(result, /29/);
  assert.match(result, /01:30/);
  assert.match(result, /GMT\+3/);
  assert.match(formatRiyadhDateTime(instant, "ar"), /01:30/);
  assert.throws(() => formatRiyadhDateTime(new Date(NaN), "en"), RangeError);
});

test("all localized text has a corresponding non-empty translation", () => {
  const walk = (a: unknown, b: unknown): void => {
    assert.equal(typeof a, typeof b);
    if (typeof a === "string") { assert.ok(a.trim()); assert.ok((b as string).trim()); return; }
    if (Array.isArray(a)) {
      assert.ok(Array.isArray(b)); assert.equal(a.length, b.length);
      a.forEach((item, i) => walk(item, b[i])); return;
    }
    assert.deepEqual(Object.keys(a as object).sort(), Object.keys(b as object).sort());
    for (const key of Object.keys(a as object)) walk((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
  };
  walk(getMessages("ar"), getMessages("en"));
});
