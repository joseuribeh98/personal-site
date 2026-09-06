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
    jobTitle: 'Full-stack developer',
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Cali', addressCountry: 'CO' },
    sameAs: [site.upwork, site.github, site.linkedin],
    knowsLanguage: ['en', 'es', 'pt'],
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
