// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://joseuribe.dev',
  output: 'static',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: false,
      fallbackType: 'redirect',
    },
    fallback: { es: 'en', pt: 'en' },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
      useCdn: false, // static build: fetch fresh content at build time
      // Studio is standalone in ../studio-personal-site — never embedded here
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', es: 'es', pt: 'pt-BR' },
      },
    }),
  ],
});
