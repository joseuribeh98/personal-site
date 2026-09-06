// Captures the live client sites to tmp/screenshots/<slug>.png (1440×900, above the fold).
// Run: node scripts/capture-screenshots.mjs
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));
const targets = projects.filter((p) => p.status === 'live' && p.url);
mkdirSync('tmp/screenshots', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'es-CO' });

for (const p of targets) {
  const page = await ctx.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 45_000 });
    if (p.slug === 'armony') {
      await page.click('button:has-text("Aceptar todo")', { timeout: 5_000 }).catch(() => {});
    }
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `tmp/screenshots/${p.slug}.png`, fullPage: false });
    console.log('✓', p.slug);
  } catch (e) {
    console.error('✗', p.slug, e.message);
  } finally {
    await page.close();
  }
}
await browser.close();
