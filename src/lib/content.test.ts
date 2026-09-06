import { describe, it, expect } from 'vitest';
import { otherTranslations, PROJECTS_QUERY, POSTS_QUERY, type Post } from './content';

const post = (language: 'en' | 'es' | 'pt', translations: Post['translations']): Post =>
  ({ _id: 'x', title: 't', slug: 's', language, excerpt: '', body: [], publishedAt: '', translations }) as Post;

describe('otherTranslations', () => {
  it('drops the current language and unpublished translations', () => {
    const p = post('en', [
      { language: 'en', slug: 'hello' },
      { language: 'es', slug: 'hola' },
      { language: 'pt', slug: null },
    ]);
    expect(otherTranslations(p, 'en')).toEqual([{ language: 'es', slug: 'hola' }]);
  });
  it('returns an empty list when there are no translations', () => {
    expect(otherTranslations(post('es', []), 'es')).toEqual([]);
  });
});

describe('queries', () => {
  it('project query resolves localized summary with English fallback and orders by order', () => {
    expect(PROJECTS_QUERY).toContain('"slug": slug.current');
    expect(PROJECTS_QUERY).toContain('order(order asc)');
    expect(PROJECTS_QUERY).toContain('coalesce(summary[language == $locale || _key == $locale][0].value, summary[language == "en" || _key == "en"][0].value)');
  });
  it('posts query filters by language, excludes drafts, and resolves translations via metadata', () => {
    expect(POSTS_QUERY).toContain('language == $locale');
    expect(POSTS_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(POSTS_QUERY).toContain('_type == "translation.metadata"');
  });
});
