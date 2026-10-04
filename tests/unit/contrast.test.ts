import assert from "node:assert/strict";
import test from "node:test";

const luminance = (hex: string) => {
  const linear = hex.match(/[a-f0-9]{2}/gi)!.map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

test("brand and semantic text pairings meet normal-text contrast of 4.5:1", () => {
  const pairs = [
    ["124a43", "f7f3ea"], ["24322e", "f7f3ea"], ["52645e", "f7f3ea"],
    ["52645e", "ffffff"], ["d9bb86", "124a43"], ["f7f3ea", "0d3832"],
    ["eef3ed", "101c19"], ["eef3ed", "1b2c27"], ["b4c6bd", "1b2c27"],
    ["9ed9c5", "101c19"], ["d2dfd7", "103d36"], ["efd6ab", "103d36"],
    ["124a43", "e5eee7"], ["654a1d", "f1e5ce"], ["24322e", "e9e7dc"],
  ];
  for (const [foreground, background] of pairs) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const ratio = (values[0] + .05) / (values[1] + .05);
    assert.ok(ratio >= 4.5, `${foreground} on ${background}: ${ratio}`);
  }
});
