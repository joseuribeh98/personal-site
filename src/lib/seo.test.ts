import { describe, it, expect } from 'vitest';
import { personJsonLd, creativeWorkJsonLd, articleJsonLd, websiteJsonLd, metaDescription } from './seo';

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
    expect(cw.url).toBe('https://joseuribe.dev/work/armony');
    expect(cw.author['@type']).toBe('Person');
  });
  it('article uses locale url and published date', () => {
    const a = articleJsonLd({ slug: 'x', title: 'T', excerpt: 'E', publishedAt: '2026-09-06T00:00:00Z' } as any, 'en');
    expect(a['@type']).toBe('Article');
    expect(a.mainEntityOfPage).toBe('https://joseuribe.dev/en/blog/x');
    expect(a.datePublished).toBe('2026-09-06T00:00:00Z');
  });
  it('person describes the current role and skills', () => {
    const p = personJsonLd();
    expect(p.jobTitle).toBe('Web developer');
    expect(p.email).toBe('jose@overnatic.us');
    expect(p.knowsAbout).toContain('Next.js');
  });
  it('website is localized and points at the person', () => {
    const w = websiteJsonLd('en');
    expect(w['@type']).toBe('WebSite');
    expect(w.url).toBe('https://joseuribe.dev/en/');
    expect(w.inLanguage).toBe('en');
    expect(w.publisher['@type']).toBe('Person');
    expect(websiteJsonLd('es').url).toBe('https://joseuribe.dev/');
  });
  it('metaDescription keeps short text and trims long text on a word boundary', () => {
    expect(metaDescription('Corto y claro.')).toBe('Corto y claro.');
    const long = 'palabra '.repeat(40).trim();
    const out = metaDescription(long);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});
