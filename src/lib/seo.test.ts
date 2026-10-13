import { describe, it, expect } from 'vitest';
import { personJsonLd, creativeWorkJsonLd, articleJsonLd, websiteJsonLd, metaDescription, professionalServiceJsonLd, externalLinks, PERSON_ID, BUSINESS_ID } from './seo';

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
  it('business lists each service as an offer and points at the person', () => {
    const b = professionalServiceJsonLd('en', 'D', [{ name: 'Sites', description: 'Fast sites' }, { name: 'AI', description: 'Tools' }]);
    expect(b['@type']).toBe('ProfessionalService');
    expect(b['@id']).toBe(BUSINESS_ID);
    expect(b.url).toBe('https://joseuribe.dev/en/services');
    expect(b.founder['@id']).toBe(PERSON_ID);
    expect(b.hasOfferCatalog.itemListElement).toHaveLength(2);
    expect(b.hasOfferCatalog.itemListElement[0].itemOffered).toMatchObject({ '@type': 'Service', name: 'Sites' });
  });
  it('externalLinks returns outside sources once, skipping own-site and mailto links', () => {
    const block = (...hrefs: string[]) => ({ _type: 'block', markDefs: hrefs.map((href, i) => ({ _type: 'link', _key: String(i), href })) });
    const body = [block('https://arxiv.org/abs/2311.09735', 'mailto:a@b.co'), block('https://joseuribe.dev/work', 'https://arxiv.org/abs/2311.09735', 'https://vercel.com/blog/x')];
    expect(externalLinks(body)).toEqual(['https://arxiv.org/abs/2311.09735', 'https://vercel.com/blog/x']);
    expect(externalLinks()).toEqual([]);
  });
  it('article cites the external links in its body and omits citation when there are none', () => {
    const base = { slug: 'x', title: 'T', excerpt: 'E', publishedAt: '2026-10-13T00:00:00Z' };
    const withSources = articleJsonLd({ ...base, body: [{ _type: 'block', markDefs: [{ _type: 'link', href: 'https://arxiv.org/abs/1' }] }] } as any, 'es', '/og/blog/es/x.png');
    expect(withSources.citation).toEqual(['https://arxiv.org/abs/1']);
    expect(withSources.image).toBe('https://joseuribe.dev/og/blog/es/x.png');
    expect(withSources.author['@id']).toBe(PERSON_ID);
    expect(articleJsonLd({ ...base, body: [] } as any, 'es')).not.toHaveProperty('citation');
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
