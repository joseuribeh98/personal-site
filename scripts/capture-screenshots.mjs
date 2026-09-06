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
    if (p.slug === 'siamo') {
      // networkidle never fires here: an embedded YouTube video and the HubSpot
      // chat widget keep background network activity going indefinitely.
      await page.goto(p.url, { waitUntil: 'load', timeout: 45_000 });
      await page.waitForTimeout(2000);
    } else {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 45_000 });
    }
    if (p.slug === 'armony') {
      await page.click('button:has-text("Aceptar todo")', { timeout: 5_000 }).catch(() => {});
    }
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    if (p.slug === 'siamo') {
      // Dismiss the HubSpot chat widget's welcome popup ("¡Hola! Bienvenido(a) a
      // SIAMO Servicios...") which otherwise overlaps the headline. The widget is
      // a cross-origin iframe (app.hubspot.com) inside #hubspot-messages-iframe-container;
      // try its close button first, then hide the whole container as a fallback so the
      // launcher bubble/popup never appears in the screenshot either way.
      await page
        .frameLocator('#hubspot-messages-iframe-container iframe')
        .getByRole('button', { name: 'Cerrar página de bienvenida' })
        .click({ timeout: 5_000 })
        .catch(() => {});
      await page.addStyleTag({ content: '#hubspot-messages-iframe-container{display:none!important}' });
    }
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
