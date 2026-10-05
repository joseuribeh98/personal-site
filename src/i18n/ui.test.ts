import { describe, it, expect } from 'vitest';
import { t, localizePath, stripLocale, LOCALES, DEFAULT_LOCALE, LANG_TAGS } from './ui';

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
