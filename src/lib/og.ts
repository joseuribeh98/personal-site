// Per-page Open Graph cards, rendered at build time (satori → SVG → sharp → PNG).
// The site is static, so every card is a file in dist/og/** and costs nothing at request time.
// Satori reads TTF/OTF/WOFF but not WOFF2, hence the static @fontsource packages next to the
// variable ones the pages use: same families, so the card matches the page it previews.
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const require = createRequire(import.meta.url);
const font = (file: string) => readFileSync(require.resolve(file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () =>
  (fonts ??= [
    { name: 'Archivo', data: font('@fontsource/archivo/files/archivo-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Archivo', data: font('@fontsource/archivo/files/archivo-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Mono', data: font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Schibsted', data: font('@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Schibsted', data: font('@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-600-normal.woff'), weight: 600, style: 'normal' },
  ]);

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; children?: Child | Child[] } & Record<string, unknown> };
type Child = Node | string | null | false;
const el = (type: string, style: Style, ...children: Child[]): Node => ({ type, props: { style, children: children.filter(Boolean) } });

async function toPng(tree: Node): Promise<Buffer> {
  const svg = await satori(tree as any, { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

/** Long headlines step down so a 90-character title still fits in three lines. */
export function titleSize(title: string): number {
  const n = title.length;
  if (n <= 32) return 84;
  if (n <= 52) return 72;
  if (n <= 75) return 60;
  return 50;
}

const brand = {
  paper: '#0b0c0f',
  grid: '#16181d',
  ink: '#f4f5f7',
  mut: '#b7bcc5',
  accent: '#ff5c2e',
};

/** Blog post card: the site's dark ground and accent, with the post title as the headline. */
export function blogOg({ title, eyebrow, foot }: { title: string; eyebrow: string; foot: string }) {
  return toPng(
    el('div', {
      width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden',
      backgroundColor: brand.paper, color: brand.ink, fontFamily: 'Archivo',
      backgroundImage: `linear-gradient(${brand.grid} 1px, transparent 1px), linear-gradient(90deg, ${brand.grid} 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
    },
      el('div', {
        position: 'absolute', right: -200, bottom: -320, width: 900, height: 700, borderRadius: 9999,
        backgroundImage: 'radial-gradient(circle, rgba(255,92,46,0.22) 0%, rgba(255,92,46,0) 60%)',
      }),
      el('div', { position: 'absolute', top: 72, left: 80, right: 80, bottom: 72, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
        el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
          el('div', { display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em' },
            el('div', { width: 16, height: 16, backgroundColor: brand.accent }),
            'joseuribe.dev',
          ),
          el('div', { display: 'flex', fontFamily: 'Mono', fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', color: brand.accent }, eyebrow),
        ),
        el('div', { display: 'flex', fontWeight: 800, fontSize: titleSize(title), lineHeight: 1.04, letterSpacing: '-0.04em', maxWidth: 1000 }, title),
        el('div', { display: 'flex', alignItems: 'center', gap: 18 },
          el('div', { width: 48, height: 4, backgroundColor: brand.accent, borderRadius: 2 }),
          el('div', { display: 'flex', fontFamily: 'Mono', fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.mut }, foot),
        ),
      ),
    ),
  );
}

const res = {
  paper: '#ffffff',
  ink: '#18262b',
  mut: '#4a5a60',
  line: '#cfe3e0',
  teal: '#0e6f68',
  peach: '#ffb48a',
};

/** SECOP research card: the printed poster's light palette and its headline finding. */
export function researchSecopOg() {
  const pill = (text: string, filled: boolean): Node =>
    el('div', {
      display: 'flex', padding: '8px 20px', borderRadius: 9999, fontSize: 22, fontWeight: 800, letterSpacing: '0.06em',
      ...(filled ? { backgroundColor: res.teal, color: res.paper } : { border: `2px solid ${res.line}`, color: res.teal }),
    }, text);
  return toPng(
    el('div', { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: res.paper, color: res.ink, fontFamily: 'Schibsted', borderTop: `14px solid ${res.teal}` },
      el('div', { display: 'flex', alignItems: 'center', gap: 12, padding: '44px 64px 0' },
        pill('V EISI 2026', true),
        pill('PÓSTER · SECOP II 2022-2025', false),
      ),
      el('div', { display: 'flex', flexDirection: 'column', margin: '30px 64px 0', padding: '34px 44px', borderRadius: 24, backgroundColor: res.teal, color: res.paper },
        el('div', { display: 'flex', alignItems: 'baseline', gap: 22 },
          el('div', { display: 'flex', fontSize: 112, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95 }, '7 de cada 10'),
        ),
        el('div', { display: 'flex', marginTop: 14, fontSize: 34, fontWeight: 600, lineHeight: 1.2, maxWidth: 980 },
          'convocatorias públicas abiertas a competencia son de mínima cuantía, con un plazo típico de',
        ),
        el('div', { display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 6 },
          el('div', { display: 'flex', fontSize: 72, fontWeight: 800, letterSpacing: '-0.03em', color: res.peach }, '5 días'),
          el('div', { display: 'flex', fontSize: 34, fontWeight: 600 }, 'para ofertar.'),
        ),
      ),
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 64px', marginTop: 'auto', marginBottom: 38, fontSize: 24, fontWeight: 600, color: res.mut },
        el('div', { display: 'flex' }, 'Mercado público para mipymes · Universidad Ean'),
        el('div', { display: 'flex', fontWeight: 800, color: res.teal }, 'joseuribe.dev'),
      ),
    ),
  );
}
