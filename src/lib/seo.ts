import { site } from '../config/site';
import { localizePath, LANG_TAGS, type Locale } from '../i18n/ui';
import type { Project, Post } from './content';

const abs = (path: string, locale: Locale) => new URL(localizePath(path, locale), site.url).href;

/** Stable node ids so every JSON-LD block on the site points at the same Person and business. */
export const PERSON_ID = `${site.url}/#person`;
export const BUSINESS_ID = `${site.url}/#business`;

type Block = { _type?: string; markDefs?: Array<{ _type?: string; href?: string }> };

/** External URLs a post links to, in order and deduplicated — its sources, for `citation`. */
export function externalLinks(body: unknown[] = []): string[] {
  const own = new URL(site.url).host;
  const out: string[] = [];
  for (const b of body as Block[]) {
    for (const d of b.markDefs ?? []) {
      if (d._type !== 'link' || !d.href || !/^https?:\/\//.test(d.href)) continue;
      if (new URL(d.href).host === own || out.includes(d.href)) continue;
      out.push(d.href);
    }
  }
  return out;
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    url: site.url,
    jobTitle: 'Web developer',
    email: site.email,
    image: new URL('/og-es.png', site.url).href,
    knowsAbout: ['Next.js', 'NestJS', 'Astro', 'TypeScript', 'PostgreSQL', 'Azure', 'Product development'],
    address: { '@type': 'PostalAddress', addressLocality: 'Cali', addressCountry: 'CO' },
    sameAs: [site.upwork, site.github, site.linkedin],
    knowsLanguage: ['es', 'en', 'pt'],
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'joseuribe.dev',
    url: abs('/', locale),
    inLanguage: LANG_TAGS[locale],
    publisher: { '@type': 'Person', '@id': PERSON_ID, name: site.name, url: site.url },
  };
}

export type ServiceItem = { name: string; description: string };

/**
 * The business behind the site: who sells what, from where, in which languages. Answer engines
 * need this stated explicitly to recommend someone for a job, not just to know the person exists.
 */
export function professionalServiceJsonLd(locale: Locale, description: string, services: ServiceItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: site.name,
    url: abs('/services', locale),
    description,
    email: site.email,
    image: new URL(`/og-${locale}.png`, site.url).href,
    address: { '@type': 'PostalAddress', addressLocality: 'Cali', addressCountry: 'CO' },
    founder: { '@type': 'Person', '@id': PERSON_ID, name: site.name },
    availableLanguage: ['es', 'en', 'pt'],
    sameAs: [site.linkedin, site.github, site.upwork],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: site.name,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.description, provider: { '@id': BUSINESS_ID } },
      })),
    },
  };
}

export function creativeWorkJsonLd(project: Project, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: abs(`/work/${project.slug}`, locale),
    author: { '@type': 'Person', name: site.name, url: site.url },
    ...(project.year ? { dateCreated: String(project.year) } : {}),
  };
}

export function articleJsonLd(post: Post, locale: Locale, image?: string) {
  const url = abs(`/blog/${post.slug}`, locale);
  const citation = externalLinks(post.body);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    inLanguage: LANG_TAGS[locale],
    mainEntityOfPage: url,
    ...(image ? { image: new URL(image, site.url).href } : {}),
    author: { '@type': 'Person', '@id': PERSON_ID, name: site.name, url: site.url },
    publisher: { '@type': 'Person', '@id': PERSON_ID, name: site.name, url: site.url },
    ...(citation.length ? { citation } : {}),
  };
}

/** Search snippets cut around 160 characters; trim on a word boundary so the cut never lands mid-word. */
export function metaDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—-]+$/, '') + '…';
}
