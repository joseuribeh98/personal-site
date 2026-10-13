import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { t, localizePath, type UiKey } from '../i18n/ui';
import { getProjects, getCaseStudySlugs, getPosts } from '../lib/sanity';

/**
 * llms.txt (https://llmstxt.org): a plain-Markdown map of the site for language models.
 * Google has said Search does not use it, and server-log studies show few AI search bots fetch
 * it; agents and coding tools do. It costs nothing to keep, so it is generated from the same
 * sources as the pages and can never drift from them.
 */
export const GET: APIRoute = async () => {
  const tr = t('es');
  const abs = (path: string) => new URL(path, site.url).href;
  const [projects, caseSlugs, posts] = await Promise.all([getProjects('es'), getCaseStudySlugs(), getPosts('es')]);

  const services = [1, 2, 3].map((n) => `- [${tr(`home.s${n}.title` as UiKey)}](${abs('/services')}): ${tr(`home.s${n}.text` as UiKey)}`);
  const work = projects
    .filter((p) => p.status === 'live')
    .map((p) => {
      const href = caseSlugs.includes(p.slug) ? abs(localizePath(`/work/${p.slug}`, 'es')) : p.url;
      const name = p.client ? `${p.title} (${p.client})` : p.title;
      return href ? `- [${name}](${href}): ${p.summary}` : `- ${name}: ${p.summary}`;
    });
  const blog = posts.map((p) => `- [${p.title}](${abs(localizePath(`/blog/${p.slug}`, 'es'))}): ${p.excerpt}`);

  const lines = [
    `# ${site.name}`,
    '',
    `> ${tr('home.metaDescription')}`,
    '',
    `Desarrollador web y de producto en Cali, Colombia. Trabaja en español, inglés y portugués, de forma remota. Contacto: ${site.email}. LinkedIn: ${site.linkedin}`,
    '',
    '## Servicios',
    '',
    ...services,
    '',
    '## Trabajo',
    '',
    ...work,
    ...(blog.length ? ['', '## Blog', '', ...blog] : []),
    '',
    '## Optional',
    '',
    `- [Sobre mí](${abs('/about')}): trayectoria y forma de trabajo`,
    `- [English version](${abs('/en/')}): the same site in English`,
    `- [Versão em português](${abs('/pt/')}): o mesmo site em português`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
