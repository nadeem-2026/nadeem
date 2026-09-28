import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("supplied brand assets are unchanged and public copies match their originals", async () => {
  const base = new URL("../../nadeem-brand-kit/", import.meta.url);
  const hashes = JSON.parse(await readFile(new URL("SHA256SUMS.json", base), "utf8")) as Record<string, string>;
  for (const [file, expected] of Object.entries(hashes)) {
    const actual = createHash("sha256").update(await readFile(new URL(file, base))).digest("hex");
    assert.equal(actual, expected, `Original asset changed: ${file}`);
  }
  for (const name of ["nadeem-logo-primary.svg", "nadeem-logo-reverse.svg", "nadeem-symbol-reverse.svg"]) {
    assert.deepEqual(await readFile(new URL(`../../public/brand/${name}`, import.meta.url)), await readFile(new URL(`svg/${name}`, base)));
  }
  for (const name of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) {
    assert.deepEqual(await readFile(new URL(`../../public/${name}`, import.meta.url)), await readFile(new URL(`favicon/${name}`, base)));
  }
  assert.deepEqual(await readFile(new URL("../../NADEEM_BRAND_GUIDE.md", import.meta.url)), await readFile(new URL("docs/NADEEM_BRAND_GUIDE.md", base)));
});
