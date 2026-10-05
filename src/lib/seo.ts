import { site } from '../config/site';
import { localizePath, LANG_TAGS, type Locale } from '../i18n/ui';
import type { Project, Post } from './content';

const abs = (path: string, locale: Locale) => new URL(localizePath(path, locale), site.url).href;

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
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
    publisher: { '@type': 'Person', name: site.name, url: site.url },
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

export function articleJsonLd(post: Post, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    inLanguage: LANG_TAGS[locale],
    mainEntityOfPage: abs(`/blog/${post.slug}`, locale),
    author: { '@type': 'Person', name: site.name, url: site.url },
  };
}

/** Search snippets cut around 160 characters; trim on a word boundary so the cut never lands mid-word. */
export function metaDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—-]+$/, '') + '…';
}
