import { toHTML, type PortableTextComponents } from '@portabletext/to-html';
import { SITE_URL } from '../config/host';
import { iconSvg } from './icons';

type CodeBlock = { _type: 'code'; _key: string; language?: string; code: string; filename?: string };
type ImageBlock = { _type: 'image'; _key: string; alt?: string; asset: { _ref: string } };

export type RenderOptions = {
  highlight?: (code: string, lang: string) => Promise<string>;
  imageUrl?: (block: ImageBlock) => string;
  /** Screen-reader hint appended to links that open a new tab, e.g. "(opens in a new tab)". */
  newTabLabel?: string;
};

const OWN_HOST = new URL(SITE_URL).host;

type LinkKind = { href: string; external: boolean; host?: string } | null;

/**
 * Classifies a link href. External http(s) links open in a new tab so readers don't lose
 * the article; same-site, relative, anchor and mailto/tel links stay in the tab.
 * Anything else (javascript:, data:, malformed) is rejected and rendered as plain text.
 */
export function classifyLink(raw: unknown): LinkKind {
  if (typeof raw !== 'string') return null;
  const href = raw.trim();
  if (!href) return null;
  if (/^(\/(?!\/)|#|\?)/.test(href)) return { href, external: false };
  if (/^(mailto|tel):/i.test(href)) return { href, external: false };
  if (!/^https?:\/\//i.test(href)) return null;
  try {
    const u = new URL(href);
    const host = u.host.replace(/^www\./, '');
    if (host === OWN_HOST) return { href: u.pathname + u.search + u.hash, external: false };
    return { href: u.href, external: true, host };
  } catch {
    return null;
  }
}

async function defaultHighlight(code: string, lang: string): Promise<string> {
  const { codeToHtml } = await import('shiki');
  try {
    return await codeToHtml(code, { lang, theme: 'github-light' });
  } catch {
    return `<pre><code>${escape(code)}</code></pre>`;
  }
}

function defaultImageUrl(block: ImageBlock): string {
  // Lazy import avoids pulling sanity:client into unit tests.
  // In Astro this is replaced by passing `imageUrl: (b) => urlFor(b).width(1400).url()` from the caller.
  return `/_sanity-image-missing/${block.asset._ref}`;
}

// Attribute-safe escaper: encodes &, <, >, and both quote characters.
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Sanity asset refs encode intrinsic dimensions: image-<id>-<w>x<h>-<ext>.
// We render at a fixed 1400px width and derive height from the source aspect ratio
// so the browser can reserve layout space (prevents CLS) without a network round-trip.
const dims = (ref: string): { width: number; height: number } | null => {
  const m = /-(\d+)x(\d+)-/.exec(ref);
  return m ? { width: 1400, height: Math.round((1400 * Number(m[2])) / Number(m[1])) } : null;
};

export async function renderPortableText(blocks: unknown[], opts: RenderOptions = {}): Promise<string> {
  const highlight = opts.highlight ?? defaultHighlight;
  const imageUrl = opts.imageUrl ?? defaultImageUrl;
  const newTabLabel = opts.newTabLabel ?? '(opens in a new tab)';

  // Pre-render async pieces (code highlighting) because toHTML is synchronous.
  const prepared = await Promise.all(
    (blocks as Array<Record<string, unknown>>).map(async (b) => {
      if (b._type === 'code') {
        const c = b as CodeBlock;
        return { _type: 'html', _key: c._key, html: await highlight(c.code, c.language ?? 'text') };
      }
      return b;
    }),
  );

  const components: PortableTextComponents = {
    marks: {
      link: ({ children, value }) => {
        const link = classifyLink((value as { href?: unknown } | undefined)?.href);
        if (!link) return children;
        if (!link.external) return `<a href="${escape(link.href)}">${children}</a>`;
        // noopener: the new tab can't reach back into this page. No noreferrer on purpose —
        // cited sources should see joseuribe.dev as the referrer.
        return (
          `<a href="${escape(link.href)}" target="_blank" rel="noopener" data-source="${escape(link.host!)}">` +
          `${children}${iconSvg('external', 'ext-icon')}<span class="sr-only"> ${escape(newTabLabel)}</span></a>`
        );
      },
    },
    types: {
      html: ({ value }) => (value as { html: string }).html,
      image: ({ value }) => {
        const v = value as ImageBlock;
        const d = dims(v.asset._ref);
        const size = d ? ` width="${d.width}" height="${d.height}"` : '';
        return `<img src="${escape(imageUrl(v))}" alt="${escape(v.alt ?? '')}"${size} loading="lazy" decoding="async" />`;
      },
    },
  };

  // `prepared` mixes original unknown blocks with synthesized `html` nodes; toHTML's
  // generic can't infer a type covering both, so we widen at the boundary here.
  return toHTML(prepared as unknown as Parameters<typeof toHTML>[0], { components });
}
