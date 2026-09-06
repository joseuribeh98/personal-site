import { toHTML, type PortableTextComponents } from '@portabletext/to-html';

type CodeBlock = { _type: 'code'; _key: string; language?: string; code: string; filename?: string };
type ImageBlock = { _type: 'image'; _key: string; alt?: string; asset: { _ref: string } };

export type RenderOptions = {
  highlight?: (code: string, lang: string) => Promise<string>;
  imageUrl?: (block: ImageBlock) => string;
};

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

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function renderPortableText(blocks: unknown[], opts: RenderOptions = {}): Promise<string> {
  const highlight = opts.highlight ?? defaultHighlight;
  const imageUrl = opts.imageUrl ?? defaultImageUrl;

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
    types: {
      html: ({ value }) => (value as { html: string }).html,
      image: ({ value }) => {
        const v = value as ImageBlock;
        return `<img src="${imageUrl(v)}" alt="${escape(v.alt ?? '')}" loading="lazy" decoding="async" />`;
      },
    },
  };

  // `prepared` mixes original unknown blocks with synthesized `html` nodes; toHTML's
  // generic can't infer a type covering both, so we widen at the boundary here.
  return toHTML(prepared as unknown as Parameters<typeof toHTML>[0], { components });
}
