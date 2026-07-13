/**
 * Verification harness: visits each surface with headless Chromium,
 * captures console errors/warnings + page errors, and saves screenshots.
 *
 * Usage:
 *   node scripts/verify.mjs [--base http://localhost:3000] [--routes /,/signal]
 *                           [--out shots] [--scroll] [--mobile]
 *
 * Exits 1 if any console error or pageerror was seen.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
function flag(name, dflt) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const base = flag("base", "http://localhost:3000");
const routes = String(flag("routes", "/,/signal,/key,/halo,/prologue")).split(",");
const outDir = resolve(String(flag("out", "shots")));
const doScroll = flag("scroll", false) !== false;
const mobile = flag("mobile", false) !== false;

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const failures = [];

for (const route of routes) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  const warnings = [];
  page.on("console", (msg) => {
    const text = `${msg.type()}: ${msg.text()}`;
    if (msg.type() === "error") errors.push(text);
    else if (msg.type() === "warning") warnings.push(text);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => {
    const f = req.failure()?.errorText ?? "";
    if (!f.includes("ERR_ABORTED")) errors.push(`requestfailed: ${req.url()} ${f}`);
  });

  const slug = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
  const label = mobile ? `${slug}-mobile` : slug;
  try {
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${outDir}/${label}-top.png` });

    if (doScroll) {
      const height = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight
      );
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        await page.evaluate((y) => window.scrollTo({ top: y }), (height * i) / steps);
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `${outDir}/${label}-s${i}.png` });
      }
    }
  } catch (e) {
    errors.push(`navigation: ${e.message}`);
  }

  console.log(`\n=== ${route}${mobile ? " [mobile]" : ""} ===`);
  console.log(`errors: ${errors.length}, warnings: ${warnings.length}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  for (const w of warnings.slice(0, 5)) console.log(`  ⚠ ${w}`);
  if (errors.length) failures.push({ route, errors });
  await ctx.close();
}

await browser.close();

if (failures.length) {
  console.log(`\nFAILED: console errors on ${failures.map((f) => f.route).join(", ")}`);
  process.exit(1);
}
console.log("\nALL CLEAN: zero console errors across all routes.");
