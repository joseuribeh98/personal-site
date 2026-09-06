import { describe, it, expect } from 'vitest';
import { t, localizePath, stripLocale, LOCALES, DEFAULT_LOCALE } from './ui';

describe('i18n core', () => {
  it('exposes the three locales with en as default', () => {
    expect(LOCALES).toEqual(['en', 'es', 'pt']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('t() returns the localized string and falls back to English', () => {
    expect(t('es')('nav.work')).toBe('Trabajo');
    expect(t('pt')('nav.work')).toBe('Trabalho');
    expect(t('en')('nav.work')).toBe('Work');
  });

  it('localizePath prefixes non-default locales and leaves en at root', () => {
    expect(localizePath('/work', 'en')).toBe('/work');
    expect(localizePath('/work', 'es')).toBe('/es/work');
    expect(localizePath('/', 'pt')).toBe('/pt/');
    expect(localizePath('/es/work', 'pt')).toBe('/pt/work'); // re-localizes
    expect(localizePath('/pt/blog/x', 'en')).toBe('/blog/x');
  });

  it('stripLocale detects the locale prefix', () => {
    expect(stripLocale('/es/work')).toEqual({ locale: 'es', path: '/work' });
    expect(stripLocale('/pt/')).toEqual({ locale: 'pt', path: '/' });
    expect(stripLocale('/work')).toEqual({ locale: 'en', path: '/work' });
    expect(stripLocale('/estate')).toEqual({ locale: 'en', path: '/estate' }); // no false prefix match
  });
});
