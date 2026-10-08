// Identify every LCP candidate over time, under a throttled phone profile.
// Usage: node scripts/seo/lcp-probe.mjs <url> [runs] [cpuThrottle]
import { chromium, devices } from 'playwright';

const URL_ = process.argv[2] ?? 'http://localhost:4329/';
const RUNS = Number(process.argv[3] ?? 3);
const CPU = Number(process.argv[4] ?? 4);

const probe = `
  new Promise((resolve) => {
    const seen = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const el = e.element;
        seen.push({
          time: Math.round(e.startTime),
          url: e.url || null,
          tag: el ? el.tagName : null,
          text: el ? (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40) : null,
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => resolve(seen), 5000);
  })
`;

const out = [];
for (let i = 0; i < RUNS; i++) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
  await page.goto(URL_, { waitUntil: 'load' });
  const seen = await page.evaluate(probe);
  const final = seen[seen.length - 1];
  out.push(final?.time ?? null);
  console.log(`run ${i + 1}: LCP ${final?.time}ms  <${final?.tag}> ${final?.text ?? final?.url ?? ''}`);
  if (seen.length > 1) for (const c of seen) console.log(`    candidate ${c.time}ms <${c.tag}> ${c.text ?? c.url ?? ''}`);
  await browser.close();
}
const ok = out.filter((x) => typeof x === 'number');
console.log(`\nLCP min ${Math.min(...ok)}ms  max ${Math.max(...ok)}ms  spread ${Math.max(...ok) - Math.min(...ok)}ms`);
