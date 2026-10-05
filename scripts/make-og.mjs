// Brand images, rendered with the site's own fonts so they match the pages.
// Run: node scripts/make-og.mjs
//   public/og-es.png, og-en.png, og-pt.png  (1200×630, one per locale)
//   public/favicon.ico (32×32 PNG), apple-touch-icon.png (180), icon-192.png, icon-512.png
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const font = (path) => `data:font/woff2;base64,${readFileSync(new URL(`../node_modules/${path}`, import.meta.url)).toString('base64')}`;
const archivo = font('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
const mono = font('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2');

const copy = {
  es: { pre: 'Convierto', mark: 'ideas', post: 'en productos que la gente usa.', foot: 'Jose Uribe · Desarrollador web · Cali, Colombia' },
  en: { pre: 'I turn', mark: 'ideas', post: 'into products people use.', foot: 'Jose Uribe · Web developer · Cali, Colombia' },
  pt: { pre: 'Transformo', mark: 'ideias', post: 'em produtos que as pessoas usam.', foot: 'Jose Uribe · Desenvolvedor web · Cali, Colômbia' },
};

const page = ({ pre, mark, post, foot }) => `<!doctype html><html><head><style>
  @font-face { font-family: Archivo; src: url(${archivo}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
  @font-face { font-family: Mono; src: url(${mono}) format('woff2'); font-weight: 100 800; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0b0c0f; color: #f4f5f7; font-family: Archivo; position: relative; overflow: hidden;
    background-image: linear-gradient(#16181d 1px, transparent 1px), linear-gradient(90deg, #16181d 1px, transparent 1px); background-size: 40px 40px; }
  .glow { position: absolute; right: -200px; bottom: -320px; width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(255,92,46,.22) 0%, rgba(255,92,46,0) 60%); }
  .wrap { position: absolute; inset: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 30px; letter-spacing: -0.03em; }
  .logo i { width: 16px; height: 16px; background: #ff5c2e; display: block; }
  h1 { font-weight: 800; font-size: 84px; line-height: 1; letter-spacing: -0.045em; max-width: 960px; }
  .m { position: relative; display: inline-block; }
  .m svg { position: absolute; left: -4%; bottom: -0.14em; width: 108%; height: 0.32em; overflow: visible; }
  .foot { font-family: Mono; font-size: 22px; letter-spacing: .06em; text-transform: uppercase; color: #b7bcc5; }
</style></head><body><div class="glow"></div><div class="wrap">
  <div class="logo"><i></i>joseuribe.dev</div>
  <h1>${pre} <span class="m">${mark}<svg viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M6 30 C 70 8, 150 6, 294 22" fill="none" stroke="#ff5c2e" stroke-width="7" stroke-linecap="round"/></svg></span> ${post}</h1>
  <div class="foot">${foot}</div>
</div></body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [locale, c] of Object.entries(copy)) {
  await tab.setContent(page(c), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `public/og-${locale}.png` });
  console.log(`public/og-${locale}.png`);
}
await browser.close();

// Icons from the same mark as the header logo: an accent square on the dark ground.
const icon = readFileSync(new URL('../public/favicon.svg', import.meta.url));
for (const [file, size] of [['favicon.ico', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(icon, { density: 512 }).resize(size, size).png().toFile(`public/${file}`);
  console.log(`public/${file}`);
}
