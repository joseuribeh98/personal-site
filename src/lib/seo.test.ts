import { describe, it, expect } from 'vitest';
import { personJsonLd, creativeWorkJsonLd, articleJsonLd } from './seo';

describe('JSON-LD builders', () => {
  it('person has the essentials', () => {
    const p = personJsonLd();
    expect(p['@type']).toBe('Person');
    expect(p.name).toBe('Jose Uribe');
    expect(p.url).toBe('https://joseuribe.dev');
    expect(p.sameAs).toContain('https://www.upwork.com/freelancers/joseuribeh');
  });
  it('creative work uses the summary and the localized case-study url', () => {
    const cw = creativeWorkJsonLd({ slug: 'armony', title: 'Armony', summary: 'ES' } as any, 'es');
    expect(cw['@type']).toBe('CreativeWork');
    expect(cw.description).toBe('ES');
    expect(cw.url).toBe('https://joseuribe.dev/es/work/armony');
    expect(cw.author['@type']).toBe('Person');
  });
  it('article uses locale url and published date', () => {
    const a = articleJsonLd({ slug: 'x', title: 'T', excerpt: 'E', publishedAt: '2026-09-06T00:00:00Z' } as any, 'en');
    expect(a['@type']).toBe('Article');
    expect(a.mainEntityOfPage).toBe('https://joseuribe.dev/blog/x');
    expect(a.datePublished).toBe('2026-09-06T00:00:00Z');
  });
});
