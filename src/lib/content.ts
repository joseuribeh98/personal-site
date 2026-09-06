import type { Locale } from '../i18n/ui';

export type ProjectKind = 'app' | 'site' | 'wordpress';
export type ProjectStatus = 'live' | 'offline' | 'parked';
export type SanityImage = { _type: 'image'; asset: { _ref: string }; hotspot?: unknown; crop?: unknown };

export type Project = {
  _id: string;
  title: string;
  slug: string;
  kind: ProjectKind;
  client?: string;
  role?: string;
  year?: number;
  stack?: string[];
  url?: string | null;
  status: ProjectStatus;
  screenshot: SanityImage;
  featured?: boolean;
  order?: number;
  /** Already resolved for $locale by GROQ, with English fallback. */
  summary: string;
  /** Portable Text for $locale (English fallback), or null when the project has no case study. */
  caseStudy: unknown[] | null;
};

/** `slug` is null when that translation exists only as a draft. */
export type PostTranslation = { language: Locale; slug: string | null };

export type Post = {
  _id: string;
  title: string;
  slug: string;
  language: Locale;
  excerpt: string;
  body: unknown[];
  cover?: SanityImage;
  publishedAt: string;
  /** Every language version linked by translation.metadata, including this document's own. */
  translations: PostTranslation[];
};

/** The other published language versions of a post — for hreflang and the "also available in" line. */
export function otherTranslations(post: Post, locale: Locale): PostTranslation[] {
  return post.translations.filter((t) => t.language !== locale && t.slug !== null);
}

// Internationalized arrays (sanity-plugin-internationalized-array): [{ _key: locale, value }].
const i18n = (field: string) => `coalesce(${field}[_key == $locale][0].value, ${field}[_key == "en"][0].value)`;

const PROJECT_FIELDS = `
  _id, title, "slug": slug.current, kind, client, role, year, stack, url, status,
  screenshot, featured, order,
  "summary": ${i18n('summary')},
  "caseStudy": ${i18n('caseStudy')}
`;

export const PROJECTS_QUERY = `*[_type == "project" && !(_id in path("drafts.**")) && defined(screenshot)] | order(order asc) { ${PROJECT_FIELDS} }`;
export const FEATURED_PROJECTS_QUERY = `*[_type == "project" && !(_id in path("drafts.**")) && defined(screenshot) && featured == true] | order(order asc) [0...4] { ${PROJECT_FIELDS} }`;
export const PROJECT_BY_SLUG_QUERY = `*[_type == "project" && !(_id in path("drafts.**")) && slug.current == $slug][0] { ${PROJECT_FIELDS} }`;
export const PROJECT_SLUGS_WITH_CASE_QUERY = `*[_type == "project" && !(_id in path("drafts.**")) && defined(screenshot) && count(caseStudy[_key == "en"][0].value) > 0].slug.current`;

// Translations come from the @sanity/document-internationalization metadata document.
// `value->slug.current` is null for translations that exist only as drafts.
const POST_FIELDS = `
  _id, title, "slug": slug.current, language, excerpt, body, cover, publishedAt,
  "translations": coalesce(
    *[_type == "translation.metadata" && references(^._id)][0].translations[] { "language": _key, "slug": value->slug.current },
    []
  )
`;

export const POSTS_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && language == $locale && publishedAt <= now()] | order(publishedAt desc) { ${POST_FIELDS} }`;
export const POST_BY_SLUG_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && language == $locale && slug.current == $slug][0] { ${POST_FIELDS} }`;
