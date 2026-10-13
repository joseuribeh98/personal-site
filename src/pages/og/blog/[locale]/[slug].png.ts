import type { APIRoute, GetStaticPaths } from 'astro';
import { LOCALES, LANG_TAGS, type Locale } from '../../../../i18n/ui';
import { getPosts } from '../../../../lib/sanity';
import { blogOg } from '../../../../lib/og';
import type { Post } from '../../../../lib/content';

export const getStaticPaths = (async () => {
  const perLocale = await Promise.all(LOCALES.map(async (locale) => (await getPosts(locale)).map((post) => ({ params: { locale, slug: post.slug }, props: { locale, post } }))));
  return perLocale.flat();
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { locale, post } = props as { locale: Locale; post: Post };
  const date = new Date(post.publishedAt).toLocaleDateString(LANG_TAGS[locale], { year: 'numeric', month: 'short', day: 'numeric' });
  const png = await blogOg({ title: post.title, eyebrow: `Blog · ${date}`, foot: 'Jose Uribe' });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
