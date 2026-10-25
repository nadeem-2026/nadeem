import { chromium } from "playwright";

const PAGES = [
  { path: "/ar", name: "الرئيسية (عربي)" },
  { path: "/en", name: "Home (English)" },
  { path: "/ar/guides", name: "دليل المرشدين (عربي)" },
  { path: "/en/guides", name: "Guides Directory (English)" },
  { path: "/ar/become-a-guide", name: "انضم كمرشد (عربي)" },
  { path: "/ar/contact", name: "اتصل بنا (عربي)" },
  { path: "/ar/login", name: "تسجيل الدخول (عربي)" },
  { path: "/ar/signup", name: "إنشاء حساب (عربي)" },
  { path: "/ar/terms", name: "الشروط والأحكام (عربي)" },
  { path: "/ar/privacy", name: "سياسة الخصوصية (عربي)" },
];

const THEMES = ["light", "dark"];

function parseRgb(colorStr) {
  if (!colorStr) return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1.0,
  };
}

function luminance(r, g, b) {
  const [lr, lg, lb] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(lum1, lum2) {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Function executed inside page context
const clientScript = () => {
  function getEffectiveBg(el) {
    // If element is inside hero overlay or destination overlay, account for dark overlay
    if (el.closest(".hero-section") && !el.closest(".hero-search")) {
      return "rgb(12, 38, 30)"; // Dark emerald hero overlay
    }
    if (el.closest(".destination-overlay")) {
      return "rgb(15, 30, 24)"; // Dark card overlay
    }
    if (el.closest(".auth-image-overlay")) {
      return "rgb(14, 53, 38)"; // Auth quote dark overlay
    }

    let curr = el;
    const stack = [];
    while (curr && curr !== document.documentElement) {
      const style = window.getComputedStyle(curr);
      const bg = style.backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
        stack.unshift(bg);
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match && (match[4] === undefined || parseFloat(match[4]) >= 0.99)) {
          break; // Opaque color reached
        }
      }
      curr = curr.parentElement;
    }

    if (stack.length === 0) {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
      return bodyBg || htmlBg || "rgb(255, 255, 255)";
    }
    return stack[0];
  }

  const selectors = [
    "h1", "h2", "h3", "h4", "p", "a", "button", "label",
    ".button-primary", ".notice-label", ".hero-title", ".hero-intro",
    ".footer-link", ".badge", ".destination-title", ".language-switch"
  ];

  const results = [];
  const elements = document.querySelectorAll(selectors.join(", "));

  for (const el of elements) {
    const text = el.innerText?.trim();
    if (!text || text.length === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;

    const fg = style.color;
    const bg = getEffectiveBg(el);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight, 10) || 400;
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

    results.push({
      tagName: el.tagName.toLowerCase(),
      className: el.className || "",
      textSample: text.slice(0, 45).replace(/\n/g, " "),
      fg,
      bg,
      fontSize: `${fontSize}px`,
      fontWeight,
      isLarge,
    });
  }

  const htmlStyle = window.getComputedStyle(document.documentElement);
  const tokens = {
    colorPage: htmlStyle.getPropertyValue("--color-page").trim(),
    colorSurface: htmlStyle.getPropertyValue("--color-surface").trim(),
    colorText: htmlStyle.getPropertyValue("--color-text").trim(),
    colorPrimary: htmlStyle.getPropertyValue("--color-primary").trim(),
    colorOnPrimary: htmlStyle.getPropertyValue("--color-on-primary").trim(),
    muted: htmlStyle.getPropertyValue("--muted").trim(),
    border: htmlStyle.getPropertyValue("--border").trim(),
    backgroundAlt: htmlStyle.getPropertyValue("--background-alt").trim(),
  };

  return { results, tokens };
};

async function main() {
  const browser = await chromium.launch();

  console.log("==================================================");
  console.log("   NADEEM COMPREHENSIVE COLOR & CONTRAST AUDIT   ");
  console.log("==================================================\n");

  const overallStats = {
    totalEvaluated: 0,
    issues: [],
    themeTokens: {},
  };

  let totalTested = 0;
  let passAA = 0;
  let passAAA = 0;

  for (const theme of THEMES) {
    console.log(`\n========================================`);
    console.log(`>>> TESTING THEME: [ ${theme.toUpperCase()} MODE ] <<<`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: theme === "dark" ? "dark" : "light",
    });
    await context.addCookies([
      { name: "nadeem-theme", value: theme, domain: "127.0.0.1", path: "/" },
    ]);

    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `http://127.0.0.1:3000${p.path}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(150);

      const data = await page.evaluate(clientScript);
      overallStats.themeTokens[theme] = data.tokens;

      let pageTested = 0;
      let pagePassAA = 0;
      let pageIssues = [];

      for (const item of data.results) {
        const fgRgb = parseRgb(item.fg);
        const bgRgb = parseRgb(item.bg);
        if (!fgRgb || !bgRgb) continue;

        const lumFg = luminance(fgRgb.r, fgRgb.g, fgRgb.b);
        const lumBg = luminance(bgRgb.r, bgRgb.g, bgRgb.b);
        const ratio = contrastRatio(lumFg, lumBg);

        const requiredAA = item.isLarge ? 3.0 : 4.5;
        const requiredAAA = item.isLarge ? 4.5 : 7.0;

        totalTested++;
        pageTested++;

        const isAA = ratio >= requiredAA;
        const isAAA = ratio >= requiredAAA;

        if (isAA) {
          passAA++;
          pagePassAA++;
        } else {
          pageIssues.push({
            page: p.name,
            theme,
            sample: item.textSample,
            tag: item.tagName,
            fg: item.fg,
            bg: item.bg,
            ratio: ratio.toFixed(2),
            required: requiredAA,
            isLarge: item.isLarge,
          });
        }

        if (isAAA) passAAA++;
      }

      const pagePercent = pageTested > 0 ? ((pagePassAA / pageTested) * 100).toFixed(1) : 100;
      console.log(`- ${p.name.padEnd(30)} | Elements: ${pageTested.toString().padStart(3)} | AA Pass: ${pagePercent}% (${pageIssues.length} issues)`);

      if (pageIssues.length > 0) {
        overallStats.issues.push(...pageIssues);
      }
    }

    await context.close();
  }

  await browser.close();

  const totalAAPercent = ((passAA / totalTested) * 100).toFixed(2);
  const totalAAAPercent = ((passAAA / totalTested) * 100).toFixed(2);

  console.log("\n==================================================");
  console.log("                 AUDIT SUMMARY                    ");
  console.log("==================================================");
  console.log(`Total Text Elements Analyzed: ${totalTested}`);
  console.log(`WCAG AA Compliance:  ${passAA}/${totalTested} (${totalAAPercent}%)`);
  console.log(`WCAG AAA Compliance: ${passAAA}/${totalTested} (${totalAAAPercent}%)`);
  console.log(`Total Issues Flagged: ${overallStats.issues.length}`);

  if (overallStats.issues.length > 0) {
    console.log("\n--- DETAILED ISSUES ---");
    const uniqueIssues = new Map();
    for (const iss of overallStats.issues) {
      const key = `${iss.theme}-${iss.tag}-${iss.fg}-${iss.bg}-${iss.required}`;
      if (!uniqueIssues.has(key)) {
        uniqueIssues.set(key, iss);
      }
    }
    for (const [_, iss] of uniqueIssues) {
      console.log(`[${iss.theme.toUpperCase()}] <${iss.tag}> ("${iss.sample}") -> FG: ${iss.fg} on BG: ${iss.bg} | Ratio: ${iss.ratio}:1 (Required: ${iss.required}:1) | Page: ${iss.page}`);
    }
  }

  console.log("\n--- THEME DESIGN TOKENS ---");
  console.log("Light Mode Tokens:", overallStats.themeTokens.light);
  console.log("Dark Mode Tokens:", overallStats.themeTokens.dark);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
