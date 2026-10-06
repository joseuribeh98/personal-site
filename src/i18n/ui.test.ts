import { describe, it, expect } from 'vitest';
import { t, localizePath, stripLocale, LOCALES, DEFAULT_LOCALE, LANG_TAGS, type UiKey } from './ui';
import { metaDescription } from '../lib/seo';

describe('i18n core', () => {
  it('exposes the three locales with es as default', () => {
    expect(LOCALES).toEqual(['es', 'en', 'pt']);
    expect(DEFAULT_LOCALE).toBe('es');
  });

  it('LANG_TAGS uses BCP-47 pt-BR for Portuguese', () => {
    expect(LANG_TAGS).toEqual({ en: 'en', es: 'es', pt: 'pt-BR' });
  });

  it('t() returns the localized string and falls back to English', () => {
    expect(t('es')('nav.work')).toBe('Trabajo');
    expect(t('pt')('nav.work')).toBe('Trabalho');
    expect(t('en')('nav.work')).toBe('Work');
  });

  it('localizePath prefixes non-default locales and leaves es at root', () => {
    expect(localizePath('/work', 'es')).toBe('/work');
    expect(localizePath('/work', 'en')).toBe('/en/work');
    expect(localizePath('/', 'pt')).toBe('/pt/');
    expect(localizePath('/en/work', 'pt')).toBe('/pt/work'); // re-localizes
    expect(localizePath('/pt/blog/x', 'es')).toBe('/blog/x');
  });

  it('stripLocale detects the locale prefix', () => {
    expect(stripLocale('/en/work')).toEqual({ locale: 'en', path: '/work' });
    expect(stripLocale('/pt/')).toEqual({ locale: 'pt', path: '/' });
    expect(stripLocale('/work')).toEqual({ locale: 'es', path: '/work' });
    expect(stripLocale('/english')).toEqual({ locale: 'es', path: '/english' }); // no false prefix match
  });
});

// Every indexable page owns a title and a description written for the SERP, not reused
// from on-page copy. The bounds are the budget Google actually renders: titles get cut
// around 60 characters, descriptions around 160. The lower bound is the real regression
// risk — scaffold titles like "Blog — Jose Uribe" (17) threw away two thirds of the line.
describe('page meta', () => {
  const PAGES = ['home', 'about', 'services', 'work', 'blog'] as const;

  it.each(LOCALES)('%s titles use the SERP line without overflowing it', (locale) => {
    for (const page of PAGES) {
      const title = t(locale)(`${page}.metaTitle` as UiKey);
      expect(title.length, `${locale} ${page}.metaTitle: "${title}"`).toBeGreaterThanOrEqual(35);
      expect(title.length, `${locale} ${page}.metaTitle: "${title}"`).toBeLessThanOrEqual(60);
    }
  });

  it.each(LOCALES)('%s descriptions pass through metaDescription() uncut', (locale) => {
    for (const page of PAGES) {
      const text = t(locale)(`${page}.metaDescription` as UiKey);
      expect(text.length, `${locale} ${page}.metaDescription: "${text}"`).toBeLessThanOrEqual(160);
      expect(metaDescription(text), `${locale} ${page}.metaDescription is truncated`).toBe(text);
    }
  });

  it('gives each page a distinct title per locale', () => {
    for (const locale of LOCALES) {
      const titles = PAGES.map((p) => t(locale)(`${p}.metaTitle` as UiKey));
      expect(new Set(titles).size, `${locale} has duplicate titles`).toBe(PAGES.length);
    }
  });
});
