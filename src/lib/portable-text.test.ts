import { describe, it, expect } from 'vitest';
import { renderPortableText } from './portable-text';

const p = (text: string) => ({ _type: 'block', _key: 'k' + text.length, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's', text, marks: [] }] });

const linked = (href: string) => ({
  _type: 'block', _key: 'l', style: 'normal',
  markDefs: [{ _type: 'link', _key: 'm', href }],
  children: [{ _type: 'span', _key: 's', text: 'source', marks: ['m'] }],
});

describe('links', () => {
  it('opens external links in a new tab with noopener, an icon and a screen-reader hint', async () => {
    const html = await renderPortableText([linked('https://arxiv.org/abs/1')], { newTabLabel: '(abre en una pestaña nueva)' });
    expect(html).toContain('href="https://arxiv.org/abs/1"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain('data-source="arxiv.org"');
    expect(html).toContain('<span class="sr-only"> (abre en una pestaña nueva)</span>');
    expect(html).toContain('<svg class="ext-icon"');
    expect(html).not.toMatch(/[\u2190-\u21FF\u2600-\u27BF]|\p{Extended_Pictographic}/u);
  });

  it('keeps same-site absolute links in the tab and makes them relative', async () => {
    for (const href of ['https://joseuribe.dev/blog/x', 'https://www.joseuribe.dev/blog/x']) {
      const html = await renderPortableText([linked(href)]);
      expect(html).toBe('<p><a href="/blog/x">source</a></p>');
    }
  });

  it('keeps relative, anchor and mailto links in the tab', async () => {
    for (const href of ['/services', '#intro', 'mailto:jose@overnatic.us']) {
      const html = await renderPortableText([linked(href)]);
      expect(html).not.toContain('target=');
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('drops unsafe or malformed hrefs and keeps the text', async () => {
    for (const href of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', 'nope']) {
      const html = await renderPortableText([linked(href)]);
      expect(html).toBe('<p>source</p>');
    }
  });
});

describe('renderPortableText', () => {
  it('renders paragraphs', async () => {
    const html = await renderPortableText([p('Hello')]);
    expect(html).toBe('<p>Hello</p>');
  });

  it('renders code blocks through the injected highlighter', async () => {
    const html = await renderPortableText(
      [{ _type: 'code', _key: 'c', language: 'ts', code: 'const a = 1' }],
      { highlight: async (code, lang) => `<pre data-lang="${lang}">${code}</pre>` },
    );
    expect(html).toBe('<pre data-lang="ts">const a = 1</pre>');
  });

  it('renders images with alt text via the image url builder', async () => {
    const html = await renderPortableText(
      [{ _type: 'image', _key: 'i', alt: 'A chart', asset: { _ref: 'image-abc123-800x600-png' } }],
      { imageUrl: () => 'https://cdn.example/abc.png' },
    );
    expect(html).toContain('<img');
    expect(html).toContain('src="https://cdn.example/abc.png"');
    expect(html).toContain('alt="A chart"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="1400"');
    expect(html).toContain('height="1050"');
  });

  it('omits width/height when the asset ref has no encoded dimensions', async () => {
    const html = await renderPortableText(
      [{ _type: 'image', _key: 'i', alt: 'A chart', asset: { _ref: 'image-abc123-png' } }],
      { imageUrl: () => 'https://cdn.example/abc.png' },
    );
    expect(html).not.toContain('width=');
  });

  it('escapes quotes and ampersands in alt text and image urls (attribute context)', async () => {
    const html = await renderPortableText(
      [{ _type: 'image', _key: 'i', alt: 'She said "hi" & left', asset: { _ref: 'image-abc123-800x600-png' } }],
      { imageUrl: () => 'https://cdn.example/a.png?w=1&h=2' },
    );
    expect(html).toContain('alt="She said &quot;hi&quot; &amp; left"');
    expect(html).toContain('src="https://cdn.example/a.png?w=1&amp;h=2"');
    expect(html).not.toContain('"hi"');
  });
});
