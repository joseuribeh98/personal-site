import { describe, it, expect } from 'vitest';
import { renderPortableText } from './portable-text';

const p = (text: string) => ({ _type: 'block', _key: 'k' + text.length, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's', text, marks: [] }] });

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
