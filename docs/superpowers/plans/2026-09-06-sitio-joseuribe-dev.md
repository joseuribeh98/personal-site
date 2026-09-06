# joseuribe.dev — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship joseuribe.dev — a static Astro 7 site with Sanity as CMS: portfolio of 12 projects, services, about, trilingual blog and a contact form — as the first live instance of the "WordPress replacement" product Jose sells.

**Architecture:** Astro 7 `output: 'static'` with native i18n (`en` at root, `/es`, `/pt`). Every page is a thin locale wrapper around a shared *view* component so page logic exists once. Content (projects, posts) lives in Sanity and is fetched at build time via the `sanity:client` virtual module; UI strings live in code (`src/i18n/ui.ts`). **Sanity Studio is standalone** in the sibling repo `../studio-personal-site` (hosted at `https://joseuribe.sanity.studio`), never embedded. Publishing in Sanity triggers a Vercel rebuild via webhook.

**Tech Stack:** Astro 7.3 · Tailwind CSS 4 (`@tailwindcss/vite`) · Sanity (`@sanity/astro` 3.5 for `sanity:client`, `@sanity/image-url`, `@portabletext/to-html`) · shiki · Vitest 5 · Playwright (screenshots only) · `@vercel/analytics` + GA4 · Web3Forms · Vercel. Studio (separate repo `../studio-personal-site`): Sanity 6, `@sanity/document-internationalization`, `sanity-plugin-internationalized-array`, `@sanity/code-input`.

**Spec:** `docs/superpowers/specs/2026-09-06-sitio-joseuribe-dev-design.md` (technical) and `docs/superpowers/specs/2026-09-06-marca-personal-joseuribe-design.md` (brand, copy direction, distribution). Read both.

## Global Constraints

- Astro **7.3.x**, `output: 'static'`. **No SSR adapter, no serverless functions, no custom backend.**
- **The Studio is standalone** in `../studio-personal-site` (own git repo, project `rkr2s9sc`, dataset `production`). The app never embeds it and never imports `sanity`; `@sanity/astro` is used only for the `sanity:client` virtual module.
- **Sanity localization (decided 2026-09-06 per `sanity-best-practices`):** `project.summary` and `project.caseStudy` are internationalized arrays — `[{ _key: 'en' | 'es' | 'pt', _type: 'internationalizedArray<Type>Value', value }]` — read with `coalesce(field[_key == $locale][0].value, field[_key == "en"][0].value)`. `post` is one document per language with a `language` field, linked by the plugin's `translation.metadata` documents. Never hand-link translations, never use localized `{en, es, pt}` objects.
- **Never set deterministic `_id`s** on ordinary documents (Sanity global rule). Scripts find by slug and create-or-patch.
- Locales: `en` (default, unprefixed), `es`, `pt`. Config already in `astro.config.mjs` — do not change `prefixDefaultLocale: false`.
- **English is the original copy.** ES and PT are adaptations. PT may lag behind on blog content, never on fixed pages.
- Voice: **first person singular**, direct, no agency jargon, no "we". Show the work, don't adjectivize it.
- Rule: **a project without a screenshot is not published.** The seed script enforces it.
- Zohara: `status: 'parked'`, `url: null` — card shows no link.
- UI strings live in `src/i18n/ui.ts`, **never** in Sanity. Content (projects, posts) lives in Sanity, **never** hardcoded in pages.
- Lighthouse mobile performance **≥ 95** on `/` and one `/work/[slug]` is a shipping requirement.
- No tests for Astro pages beyond build + HTML assertions. Vitest is for pure TypeScript (`src/i18n`, `src/lib`).
- Commit after every task with the exact message given. Never commit `.env`.
- Design tokens (fixed in Task 2): paper `#f5f1e8`, ink `#1b1713`, one accent `#b5482a`. Display font Fraunces, body font Geist. **Warm, editorial, one accent.** No pure black, no pure white, no blue.
- **Visual execution:** before styling in Task 2 and before laying out Tasks 5–8, load the `frontend-design` skill. Refine within the tokens above — never replace them. Projects' screenshots are the hero imagery; no illustrations, no stock.

## Prerequisites (Jose — not automatable)

Tasks 5–10 need real Sanity data, so **these must be done before Task 4 runs**:

1. Create the Sanity project at https://sanity.io/manage (or `npx sanity@latest init --bare`). Put the ID in `.env` as `PUBLIC_SANITY_PROJECT_ID` (replace the `placeholder` value) and in Vercel → Settings → Environment Variables.
2. Create a **write token** (Manage → API → Tokens → Editor) and put it in `.env` as `SANITY_API_TOKEN`. **Never** prefix it with `PUBLIC_`.
3. `npx sanity login` in a terminal (browser flow), then from `../studio-personal-site`: `npm run deploy-schema` (uploads the schema) and `npm run deploy` (hosts the Studio at `https://joseuribe.sanity.studio`; if the hostname is taken, change `studioHost` in `sanity.cli.ts`). Local editing works before that with `npm run dev` → http://localhost:3333.
4. Download the Upwork screenshots for **Klicana, Miami Trading Lab, Avgust, Zohara** into `tmp/screenshots/` named exactly `klicana.png`, `miami-trading-lab.png`, `avgust.png`, `zohara.png`.
5. A photo of Jose at `public/images/jose.jpg` (square or 4:5, ≥ 1200px). The About page renders it only if the file exists.
6. GA4 property → `PUBLIC_GA4_ID`. Web3Forms access key → `PUBLIC_WEB3FORMS_KEY`. Optional Cal.com link → `PUBLIC_CAL_URL`. All in `.env` and in Vercel.

---

## File Structure

```
src/
  config/site.ts                 site-wide constants (name, url, email, socials, cal url) — one place
  i18n/ui.ts                     Locale type, LOCALES, dictionary, t(), localizePath(), stripLocale()
  i18n/ui.test.ts
  lib/content.ts                 Project/Post types, GROQ queries, pickLocale() — pure, no I/O
  lib/content.test.ts
  lib/sanity.ts                  fetchers on top of sanity:client + urlFor() — I/O only
  lib/portable-text.ts           renderPortableText(blocks, {highlight}) → HTML string
  lib/portable-text.test.ts
  lib/seo.ts                     JSON-LD builders (person, article, creativeWork)
  lib/seo.test.ts
  lib/analytics.ts               track() → gtag, safe no-op
  lib/analytics.test.ts
  layouts/Base.astro             <html>, head (SEO, hreflang, OG, GA4, Vercel), Header, Footer
  components/Header.astro
  components/Footer.astro
  components/LangSwitch.astro
  components/SectionHeading.astro
  components/ProjectCard.astro
  components/ProjectGrid.astro   cards + kind filter (progressive, works without JS)
  components/PostCard.astro
  components/ContactForm.astro
  views/HomeView.astro           one view per page type; pages are locale wrappers
  views/WorkIndexView.astro
  views/WorkDetailView.astro
  views/ServicesView.astro
  views/AboutView.astro
  views/BlogIndexView.astro
  views/BlogPostView.astro
  pages/index.astro  work/index.astro  work/[slug].astro  services.astro  about.astro
        blog/index.astro  blog/[slug].astro  404.astro
  pages/es/…  pages/pt/…            same files, each 3–10 lines
  styles/global.css              Tailwind import + @theme tokens + fonts
  env.d.ts
../studio-personal-site/        standalone Studio (separate repo): schemaTypes/, structure.ts, sanity.config.ts, sanity.cli.ts
data/projects.json               the 12 projects, trilingual summaries, 4 EN case studies
scripts/capture-screenshots.mjs  Playwright → tmp/screenshots/<slug>.png
scripts/seed-projects.mjs        uploads screenshots + createOrReplace projects
scripts/make-og.mjs              sharp → public/og-default.png
public/robots.txt  vercel.json
```

---

### Task 1: Test runner + i18n core

**Files:**
- Create: `vitest.config.ts`, `src/i18n/ui.ts`, `src/i18n/ui.test.ts`
- Modify: `package.json` (scripts), `AGENTS.md`

**Interfaces:**
- Produces: `type Locale = 'en' | 'es' | 'pt'`; `const LOCALES: readonly Locale[]`; `const DEFAULT_LOCALE: Locale`; `t(locale): (key: UiKey) => string`; `localizePath(path: string, locale: Locale): string`; `stripLocale(path: string): { locale: Locale; path: string }`; `LANG_NAMES: Record<Locale,string>`.

- [ ] **Step 1: Install Vitest and add scripts**

```bash
npm i -D vitest
```

Add to `package.json` `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"check": "astro check"
```

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Write the failing tests**

`src/i18n/ui.test.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './ui'`

- [ ] **Step 5: Write `src/i18n/ui.ts`**

```ts
export type Locale = 'en' | 'es' | 'pt';
export const LOCALES = ['en', 'es', 'pt'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'en';
export const LANG_NAMES: Record<Locale, string> = { en: 'English', es: 'Español', pt: 'Português' };

const en = {
  'nav.work': 'Work',
  'nav.services': 'Services',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.lang': 'Language',
  'nav.skip': 'Skip to content',
  'nav.primary': 'Primary',

  'footer.built': 'Built with Astro and Sanity — the same stack I sell.',
  'footer.location': 'Cali, Colombia · US Eastern hours',
  'footer.rights': 'All rights reserved.',

  'home.metaTitle': 'Jose Uribe — Full-stack developer · WordPress replacement in Astro',
  'home.eyebrow': 'Full-stack developer · Cali, Colombia',
  'home.h1': 'I build the site that replaces your WordPress.',
  'home.sub': 'Fast, secure, and editable without fear of breaking it. Astro plus a modern CMS, built by one developer you actually talk to — on US Eastern hours.',
  'home.ctaPrimary': 'See the work',
  'home.ctaSecondary': 'Get in touch',
  'home.featuredTitle': 'Selected work',
  'home.featuredAll': 'All projects',
  'home.servicesTitle': 'What I do',
  'home.proofTitle': 'Why this and not another agency',
  'home.proof1.title': 'Both sides of the argument',
  'home.proof1.text': "I've shipped WordPress sites and Astro sites. I can tell you exactly what you gain and what you lose — and when staying on WordPress is the right call.",
  'home.proof2.title': 'You talk to the person who writes the code',
  'home.proof2.text': 'No account managers, no handoffs. One developer, one conversation, from the first call to the last deploy.',
  'home.proof3.title': 'Same working hours as the US East Coast',
  'home.proof3.text': 'Cali is on US Eastern time. When you write, I answer today — not tomorrow.',
  'home.ctaTitle': "Tell me what's wrong with your site.",
  'home.ctaText': "Two paragraphs are enough. I'll reply within one business day with an honest read — including if you don't need me.",

  'work.title': 'Work',
  'work.lead': 'Twelve projects. Seven are live right now — open them. The rest are shown as they shipped.',
  'work.filterAll': 'All',
  'work.filterApp': 'Web apps',
  'work.filterSite': 'Astro sites',
  'work.filterWp': 'WordPress',
  'work.viewSite': 'View site',
  'work.caseStudy': 'Read the case study',
  'work.parked': 'Temporarily offline',
  'work.stack': 'Stack',
  'work.client': 'Client',
  'work.role': 'Role',
  'work.year': 'Year',
  'work.back': 'All work',
  'work.screenshotOf': 'Screenshot of',

  'services.title': 'Services',
  'services.lead': 'Fixed scope, fixed price, paid once. No monthly plan to get started.',
  'services.wp.title': 'WordPress replacement',
  'services.wp.desc': 'Your WordPress is slow, gets hacked, and charges you every month just to stay up. I rebuild it in Astro with Sanity: static, fast, and your team edits it visually — without breaking anything.',
  'services.wp.b1': 'Static site: nothing to hack, nothing to patch, no plugin roulette',
  'services.wp.b2': 'Sanity CMS: your team edits by email login, sees the page as they edit',
  'services.wp.b3': 'Lighthouse 95+ on mobile, measured on this very site',
  'services.apps.title': 'Custom web apps',
  'services.apps.desc': 'Contracting wizards, calculators that hand out a PDF, member portals, affiliate platforms. When your business needs a tool, not a page.',
  'services.apps.b1': 'Next.js, NestJS, Supabase, or WordPress as a backend when it makes sense',
  'services.apps.b2': 'Payments, PDFs, third-party APIs, authentication',
  'services.apps.b3': 'Shipped to production, not to a demo',
  'services.care.title': 'Care, after the launch',
  'services.care.desc': "Only for sites I built, and only once we've worked together. I don't sell maintenance at the door.",
  'services.cta': 'Start a conversation',

  'about.title': 'About',
  'about.p1': "I'm Jose Uribe, a full-stack developer based in Cali, Colombia. I build websites and web applications for businesses that need something faster and safer than what they have.",
  'about.p2': "I've shipped both sides of this argument: WordPress sites for companies in Colombia, and Astro sites and Next.js applications for clients in Ecuador, Brazil and the United States. That's why I can tell you when to leave WordPress — and when not to.",
  'about.p3': "I work in English, Spanish and Portuguese, on US Eastern hours. Ten jobs on Upwork with a 100% Job Success score. This site is built with what I sell: Astro, Sanity, and nothing running on a server.",
  'about.fact.location': 'Cali, Colombia',
  'about.fact.timezone': 'UTC−5 · US Eastern',
  'about.fact.languages': 'English · Español · Português',
  'about.fact.upwork': 'Upwork · 100% Job Success',

  'blog.title': 'Life after WordPress',
  'blog.lead': 'Migrations, performance, security, and the real cost of a website over three years. Measured, not theorized.',
  'blog.empty': 'First posts coming soon.',
  'blog.readMore': 'Read',
  'blog.back': 'All posts',
  'blog.alsoIn': 'Also available in',

  'contact.title': 'Contact',
  'contact.lead': "Tell me what's wrong with your site or what you need to build. I reply within one business day.",
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'What do you need?',
  'contact.send': 'Send',
  'contact.sending': 'Sending…',
  'contact.success': "Got it. I'll reply within one business day.",
  'contact.error': "That didn't go through. Email me directly at",
  'contact.book': 'Or book a 20-minute call',

  'notFound.title': 'Page not found',
  'notFound.text': "The page you're looking for doesn't exist or moved.",
  'notFound.home': 'Back home',
} as const;

export type UiKey = keyof typeof en;

const es: Record<UiKey, string> = {
  'nav.work': 'Trabajo',
  'nav.services': 'Servicios',
  'nav.blog': 'Blog',
  'nav.about': 'Sobre mí',
  'nav.contact': 'Contacto',
  'nav.menu': 'Menú',
  'nav.lang': 'Idioma',
  'nav.skip': 'Saltar al contenido',
  'nav.primary': 'Principal',

  'footer.built': 'Hecho con Astro y Sanity — el mismo stack que vendo.',
  'footer.location': 'Cali, Colombia · horario de la costa este de EE.UU.',
  'footer.rights': 'Todos los derechos reservados.',

  'home.metaTitle': 'Jose Uribe — Desarrollador full-stack · Reemplazo de WordPress en Astro',
  'home.eyebrow': 'Desarrollador full-stack · Cali, Colombia',
  'home.h1': 'Construyo el sitio que reemplaza tu WordPress.',
  'home.sub': 'Rápido, seguro y editable sin miedo a romperlo. Astro con un CMS moderno, hecho por un desarrollador con el que hablas de verdad.',
  'home.ctaPrimary': 'Ver el trabajo',
  'home.ctaSecondary': 'Escríbeme',
  'home.featuredTitle': 'Trabajo seleccionado',
  'home.featuredAll': 'Todos los proyectos',
  'home.servicesTitle': 'Qué hago',
  'home.proofTitle': 'Por qué esto y no otra agencia',
  'home.proof1.title': 'Los dos lados del argumento',
  'home.proof1.text': 'He construido sitios en WordPress y en Astro. Puedo decirte exactamente qué ganas y qué pierdes — y cuándo quedarte en WordPress es la decisión correcta.',
  'home.proof2.title': 'Hablas con quien escribe el código',
  'home.proof2.text': 'Sin ejecutivos de cuenta ni intermediarios. Un desarrollador, una conversación, desde la primera llamada hasta el último despliegue.',
  'home.proof3.title': 'Mismo horario que la costa este de EE.UU.',
  'home.proof3.text': 'Cali está en el huso de Nueva York. Si escribes hoy, respondo hoy.',
  'home.ctaTitle': 'Cuéntame qué le pasa a tu sitio.',
  'home.ctaText': 'Con dos párrafos basta. Respondo en un día hábil con una lectura honesta — incluso si no me necesitas.',

  'work.title': 'Trabajo',
  'work.lead': 'Doce proyectos. Siete están vivos ahora mismo — ábrelos. El resto se muestran tal como se entregaron.',
  'work.filterAll': 'Todos',
  'work.filterApp': 'Aplicaciones',
  'work.filterSite': 'Sitios en Astro',
  'work.filterWp': 'WordPress',
  'work.viewSite': 'Ver sitio',
  'work.caseStudy': 'Leer el caso',
  'work.parked': 'Temporalmente fuera de línea',
  'work.stack': 'Stack',
  'work.client': 'Cliente',
  'work.role': 'Rol',
  'work.year': 'Año',
  'work.back': 'Todo el trabajo',
  'work.screenshotOf': 'Captura de',

  'services.title': 'Servicios',
  'services.lead': 'Alcance cerrado, precio fijo, pago único. Sin mensualidad para empezar.',
  'services.wp.title': 'Reemplazo de WordPress',
  'services.wp.desc': 'Tu WordPress es lento, lo hackean y te cobra cada mes solo por seguir en pie. Lo reconstruyo en Astro con Sanity: estático, rápido, y tu equipo lo edita viendo la página — sin romper nada.',
  'services.wp.b1': 'Sitio estático: nada que hackear, nada que parchar, sin ruleta de plugins',
  'services.wp.b2': 'CMS Sanity: tu equipo entra con su email y edita viendo la página',
  'services.wp.b3': 'Lighthouse 95+ en móvil, medido en este mismo sitio',
  'services.apps.title': 'Aplicaciones web a medida',
  'services.apps.desc': 'Wizards de contratación, calculadoras que entregan un PDF, portales de miembros, plataformas de afiliados. Cuando tu negocio necesita una herramienta, no una página.',
  'services.apps.b1': 'Next.js, NestJS, Supabase, o WordPress como backend cuando tiene sentido',
  'services.apps.b2': 'Pagos, PDFs, APIs de terceros, autenticación',
  'services.apps.b3': 'Entregado a producción, no a un demo',
  'services.care.title': 'Cuidado, después del lanzamiento',
  'services.care.desc': 'Solo para sitios que construí, y solo cuando ya trabajamos juntos. No vendo mantenimiento en la puerta.',
  'services.cta': 'Empezar una conversación',

  'about.title': 'Sobre mí',
  'about.p1': 'Soy Jose Uribe, desarrollador full-stack en Cali, Colombia. Construyo sitios y aplicaciones web para negocios que necesitan algo más rápido y más seguro de lo que tienen.',
  'about.p2': 'He entregado los dos lados de este argumento: sitios en WordPress para empresas en Colombia, y sitios en Astro y aplicaciones en Next.js para clientes en Ecuador, Brasil y Estados Unidos. Por eso puedo decirte cuándo dejar WordPress — y cuándo no.',
  'about.p3': 'Trabajo en inglés, español y portugués, en horario de la costa este de EE.UU. Diez trabajos en Upwork con 100% de Job Success. Este sitio está hecho con lo que vendo: Astro, Sanity, y nada corriendo en un servidor.',
  'about.fact.location': 'Cali, Colombia',
  'about.fact.timezone': 'UTC−5 · costa este de EE.UU.',
  'about.fact.languages': 'English · Español · Português',
  'about.fact.upwork': 'Upwork · 100% Job Success',

  'blog.title': 'La vida después de WordPress',
  'blog.lead': 'Migraciones, rendimiento, seguridad y el costo real de un sitio a tres años. Medido, no teorizado.',
  'blog.empty': 'Primeros artículos, pronto.',
  'blog.readMore': 'Leer',
  'blog.back': 'Todos los artículos',
  'blog.alsoIn': 'También disponible en',

  'contact.title': 'Contacto',
  'contact.lead': 'Cuéntame qué le pasa a tu sitio o qué necesitas construir. Respondo en un día hábil.',
  'contact.name': 'Nombre',
  'contact.email': 'Email',
  'contact.message': '¿Qué necesitas?',
  'contact.send': 'Enviar',
  'contact.sending': 'Enviando…',
  'contact.success': 'Recibido. Respondo en un día hábil.',
  'contact.error': 'No se envió. Escríbeme directo a',
  'contact.book': 'O agenda una llamada de 20 minutos',

  'notFound.title': 'Página no encontrada',
  'notFound.text': 'La página que buscas no existe o se movió.',
  'notFound.home': 'Volver al inicio',
};

const pt: Record<UiKey, string> = {
  'nav.work': 'Trabalho',
  'nav.services': 'Serviços',
  'nav.blog': 'Blog',
  'nav.about': 'Sobre',
  'nav.contact': 'Contato',
  'nav.menu': 'Menu',
  'nav.lang': 'Idioma',
  'nav.skip': 'Pular para o conteúdo',
  'nav.primary': 'Principal',

  'footer.built': 'Feito com Astro e Sanity — a mesma stack que eu vendo.',
  'footer.location': 'Cali, Colômbia · horário da costa leste dos EUA',
  'footer.rights': 'Todos os direitos reservados.',

  'home.metaTitle': 'Jose Uribe — Desenvolvedor full-stack · Substituição do WordPress em Astro',
  'home.eyebrow': 'Desenvolvedor full-stack · Cali, Colômbia',
  'home.h1': 'Eu construo o site que substitui o seu WordPress.',
  'home.sub': 'Rápido, seguro e editável sem medo de quebrar. Astro com um CMS moderno, feito por um desenvolvedor com quem você fala de verdade.',
  'home.ctaPrimary': 'Ver o trabalho',
  'home.ctaSecondary': 'Fale comigo',
  'home.featuredTitle': 'Trabalhos selecionados',
  'home.featuredAll': 'Todos os projetos',
  'home.servicesTitle': 'O que eu faço',
  'home.proofTitle': 'Por que isto e não outra agência',
  'home.proof1.title': 'Os dois lados do argumento',
  'home.proof1.text': 'Já entreguei sites em WordPress e em Astro. Posso dizer exatamente o que você ganha e o que perde — e quando ficar no WordPress é a decisão certa.',
  'home.proof2.title': 'Você fala com quem escreve o código',
  'home.proof2.text': 'Sem gerentes de conta, sem intermediários. Um desenvolvedor, uma conversa, da primeira ligação ao último deploy.',
  'home.proof3.title': 'Mesmo horário da costa leste dos EUA',
  'home.proof3.text': 'Cali está no fuso de Nova York. Se você escreve hoje, eu respondo hoje.',
  'home.ctaTitle': 'Me conta o que está errado com o seu site.',
  'home.ctaText': 'Dois parágrafos bastam. Respondo em um dia útil com uma leitura honesta — inclusive se você não precisar de mim.',

  'work.title': 'Trabalho',
  'work.lead': 'Doze projetos. Sete estão no ar agora — abra. Os demais aparecem como foram entregues.',
  'work.filterAll': 'Todos',
  'work.filterApp': 'Aplicações',
  'work.filterSite': 'Sites em Astro',
  'work.filterWp': 'WordPress',
  'work.viewSite': 'Ver site',
  'work.caseStudy': 'Ler o caso',
  'work.parked': 'Temporariamente fora do ar',
  'work.stack': 'Stack',
  'work.client': 'Cliente',
  'work.role': 'Papel',
  'work.year': 'Ano',
  'work.back': 'Todo o trabalho',
  'work.screenshotOf': 'Captura de',

  'services.title': 'Serviços',
  'services.lead': 'Escopo fechado, preço fixo, pagamento único. Sem mensalidade para começar.',
  'services.wp.title': 'Substituição do WordPress',
  'services.wp.desc': 'Seu WordPress é lento, é invadido e cobra todo mês só para continuar no ar. Eu o reconstruo em Astro com Sanity: estático, rápido, e sua equipe edita vendo a página — sem quebrar nada.',
  'services.wp.b1': 'Site estático: nada para invadir, nada para corrigir, sem roleta de plugins',
  'services.wp.b2': 'CMS Sanity: sua equipe entra com o e-mail e edita vendo a página',
  'services.wp.b3': 'Lighthouse 95+ no celular, medido neste próprio site',
  'services.apps.title': 'Aplicações web sob medida',
  'services.apps.desc': 'Wizards de contratação, calculadoras que entregam um PDF, portais de membros, plataformas de afiliados. Quando seu negócio precisa de uma ferramenta, não de uma página.',
  'services.apps.b1': 'Next.js, NestJS, Supabase, ou WordPress como backend quando faz sentido',
  'services.apps.b2': 'Pagamentos, PDFs, APIs de terceiros, autenticação',
  'services.apps.b3': 'Entregue em produção, não em demo',
  'services.care.title': 'Cuidado, depois do lançamento',
  'services.care.desc': 'Só para sites que eu construí, e só depois de já termos trabalhado juntos. Não vendo manutenção na porta.',
  'services.cta': 'Começar uma conversa',

  'about.title': 'Sobre',
  'about.p1': 'Sou Jose Uribe, desenvolvedor full-stack em Cali, Colômbia. Construo sites e aplicações web para negócios que precisam de algo mais rápido e mais seguro do que têm.',
  'about.p2': 'Já entreguei os dois lados deste argumento: sites em WordPress para empresas na Colômbia, e sites em Astro e aplicações em Next.js para clientes no Equador, no Brasil e nos Estados Unidos. Por isso posso dizer quando sair do WordPress — e quando não.',
  'about.p3': 'Trabalho em inglês, espanhol e português, no horário da costa leste dos EUA. Dez trabalhos no Upwork com 100% de Job Success. Este site é feito com o que eu vendo: Astro, Sanity, e nada rodando em servidor.',
  'about.fact.location': 'Cali, Colômbia',
  'about.fact.timezone': 'UTC−5 · costa leste dos EUA',
  'about.fact.languages': 'English · Español · Português',
  'about.fact.upwork': 'Upwork · 100% Job Success',

  'blog.title': 'A vida depois do WordPress',
  'blog.lead': 'Migrações, desempenho, segurança e o custo real de um site em três anos. Medido, não teorizado.',
  'blog.empty': 'Primeiros artigos em breve.',
  'blog.readMore': 'Ler',
  'blog.back': 'Todos os artigos',
  'blog.alsoIn': 'Também disponível em',

  'contact.title': 'Contato',
  'contact.lead': 'Me conta o que está errado com o seu site ou o que você precisa construir. Respondo em um dia útil.',
  'contact.name': 'Nome',
  'contact.email': 'E-mail',
  'contact.message': 'Do que você precisa?',
  'contact.send': 'Enviar',
  'contact.sending': 'Enviando…',
  'contact.success': 'Recebido. Respondo em um dia útil.',
  'contact.error': 'Não foi enviado. Me escreva direto em',
  'contact.book': 'Ou agende uma conversa de 20 minutos',

  'notFound.title': 'Página não encontrada',
  'notFound.text': 'A página que você procura não existe ou foi movida.',
  'notFound.home': 'Voltar ao início',
};

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, es, pt };

export function t(locale: Locale) {
  const dict = dictionaries[locale] ?? en;
  return (key: UiKey): string => dict[key] ?? en[key];
}

const PREFIX = /^\/(es|pt)(?=\/|$)/;

export function stripLocale(path: string): { locale: Locale; path: string } {
  const m = path.match(PREFIX);
  if (!m) return { locale: 'en', path };
  const rest = path.slice(m[0].length);
  return { locale: m[1] as Locale, path: rest === '' ? '/' : rest };
}

export function localizePath(path: string, locale: Locale): string {
  const { path: bare } = stripLocale(path);
  if (locale === DEFAULT_LOCALE) return bare;
  return `/${locale}${bare === '/' ? '/' : bare}`;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (4 tests)

- [ ] **Step 7: Document conventions in `AGENTS.md`**

Append to `AGENTS.md`:

```markdown
## Conventions (joseuribe.dev)

- Pages are thin locale wrappers; logic lives in `src/views/*View.astro`. Never duplicate a view.
- UI strings: `src/i18n/ui.ts` (`t(locale)('key')`). Content: Sanity via `src/lib/sanity.ts`.
- Links between pages: `localizePath('/work', locale)`. Never hardcode `/es/` or `/pt/`.
- Tests: `npm test` (Vitest, pure TS only). Pages are verified with `npm run build`.
- Design tokens live in `src/styles/global.css` `@theme`. Use `bg-paper`, `text-ink`, `text-accent`, `font-display`, `font-body`. No arbitrary hex values in components.
- Scripts under `scripts/` run with `node --env-file=.env scripts/<name>.mjs`.
```

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts src/i18n package.json package-lock.json AGENTS.md
git commit -m "feat(i18n): locale core with dictionary, localizePath and Vitest setup"
```

---

### Task 2: Design tokens, fonts, Base layout, Header/Footer, 404

**Files:**
- Create: `src/config/site.ts`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/LangSwitch.astro`, `src/components/SectionHeading.astro`, `src/pages/404.astro`
- Modify: `src/styles/global.css`, `src/pages/index.astro` (temporary — replaced in Task 6)

**Interfaces:**
- Consumes: `t`, `localizePath`, `stripLocale`, `LOCALES`, `LANG_NAMES`, `Locale` from `src/i18n/ui.ts`
- Produces: `Base.astro` props `{ locale: Locale; title: string; description: string; alternates?: Partial<Record<Locale, string>>; ogImage?: string; noindex?: boolean; jsonLd?: object | object[] }`. `site` object from `src/config/site.ts`: `{ name, url, email, upwork, github, linkedin, calUrl, ga4Id, web3formsKey }`.

- [ ] **Step 1: Install fonts and Vercel analytics is already present**

```bash
npm i @fontsource-variable/fraunces @fontsource-variable/geist
```

- [ ] **Step 2: Write `src/config/site.ts`**

```ts
export const site = {
  name: 'Jose Uribe',
  url: 'https://joseuribe.dev',
  email: 'hello@joseuribe.dev',
  upwork: 'https://www.upwork.com/freelancers/joseuribeh',
  github: 'https://github.com/joseuribeh98',
  linkedin: 'https://www.linkedin.com/in/joseuribeh',
  calUrl: import.meta.env.PUBLIC_CAL_URL ?? '',
  ga4Id: import.meta.env.PUBLIC_GA4_ID ?? '',
  web3formsKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
} as const;
```

Add `PUBLIC_CAL_URL=` to `.env.example` with the comment `# Cal.com booking link, optional — the button only renders if set`.

> Email `hello@joseuribe.dev` must exist before launch (Jose: set up the mailbox or an alias on the domain).

- [ ] **Step 3: Write design tokens in `src/styles/global.css`**

```css
@import 'tailwindcss';
@import '@fontsource-variable/fraunces';
@import '@fontsource-variable/geist';

@theme {
  --color-paper: #f5f1e8;
  --color-paper-2: #ece6d9;
  --color-paper-pure: #fbf9f4;
  --color-ink: #1b1713;
  --color-ink-2: #2a241d;
  --color-ink-mut: #5f574c;
  --color-ink-soft: #8c8476;
  --color-accent: #b5482a;
  --color-accent-hover: #963a21;
  --color-accent-soft: #f1d9cf;
  --color-line: rgb(27 23 19 / 0.12);
  --color-line-2: rgb(27 23 19 / 0.07);

  --font-display: 'Fraunces Variable', Georgia, 'Times New Roman', serif;
  --font-body: 'Geist Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --text-display-xl: clamp(2.75rem, 6vw, 5rem);
  --text-display-lg: clamp(2rem, 4vw, 3.25rem);
  --text-display-md: clamp(1.5rem, 2.6vw, 2.125rem);
}

@layer base {
  html { scroll-behavior: smooth; }
  body {
    @apply bg-paper text-ink font-body antialiased;
    font-feature-settings: 'ss01', 'cv11';
  }
  h1, h2, h3 { @apply font-display tracking-tight; font-variation-settings: 'opsz' 144, 'SOFT' 50; }
  ::selection { @apply bg-accent-soft text-ink; }
  a:focus-visible, button:focus-visible { @apply outline-2 outline-offset-2 outline-accent; }
}

@layer components {
  .wrap { @apply mx-auto w-full max-w-6xl px-5 sm:px-8; }
  .btn { @apply inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition; }
  .btn-primary { @apply inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition bg-accent text-paper-pure hover:bg-accent-hover; }
  .btn-ghost { @apply inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition border border-line text-ink hover:border-ink; }
  .eyebrow { @apply text-xs font-medium uppercase tracking-[0.18em] text-ink-mut; }
  .prose-site { @apply max-w-prose text-lg leading-relaxed text-ink-2; }
  .prose-site p + p { @apply mt-5; }
  .prose-site h2 { @apply mt-12 mb-4 text-display-md; }
  .prose-site h3 { @apply mt-8 mb-3 text-xl; }
  .prose-site a { @apply text-accent underline underline-offset-4 hover:text-accent-hover; }
  .prose-site ul { @apply my-5 list-disc pl-6; }
  .prose-site pre { @apply my-6 overflow-x-auto rounded-lg border border-line bg-paper-pure p-4 text-sm; }
  .prose-site code:not(pre code) { @apply rounded bg-paper-2 px-1.5 py-0.5 text-[0.9em]; }
  .prose-site img { @apply my-8 rounded-lg; }
  .prose-site blockquote { @apply my-6 border-l-2 border-accent pl-5 italic text-ink-mut; }
}
```

- [ ] **Step 4: Write `src/components/LangSwitch.astro`**

```astro
---
import { LOCALES, LANG_NAMES, localizePath, stripLocale, t, type Locale } from '../i18n/ui';
interface Props { locale: Locale; alternates?: Partial<Record<Locale, string>> }
const { locale, alternates = {} } = Astro.props;
const { path } = stripLocale(Astro.url.pathname);
const hrefFor = (l: Locale) => alternates[l] ?? localizePath(path, l);
---
<nav aria-label={t(locale)('nav.lang')} class="flex items-center gap-1 text-xs">
  {LOCALES.map((l, i) => (
    <>
      {i > 0 && <span class="text-ink-soft" aria-hidden="true">·</span>}
      <a
        href={hrefFor(l)}
        hreflang={l}
        aria-current={l === locale ? 'true' : undefined}
        class:list={['rounded px-1.5 py-1 uppercase tracking-wider', l === locale ? 'text-ink font-semibold' : 'text-ink-mut hover:text-ink']}
        title={LANG_NAMES[l]}
      >{l}</a>
    </>
  ))}
</nav>
```

- [ ] **Step 5: Write `src/components/Header.astro`**

```astro
---
import { t, localizePath, type Locale } from '../i18n/ui';
import LangSwitch from './LangSwitch.astro';
interface Props { locale: Locale; alternates?: Partial<Record<Locale, string>> }
const { locale, alternates } = Astro.props;
const tr = t(locale);
const items = [
  ['/work', tr('nav.work')],
  ['/services', tr('nav.services')],
  ['/blog', tr('nav.blog')],
  ['/about', tr('nav.about')],
] as const;
const current = Astro.url.pathname;
const isActive = (href: string) => current === localizePath(href, locale) || current.startsWith(localizePath(href, locale) + '/');
---
<header class="wrap flex items-center justify-between py-6">
  <a href={localizePath('/', locale)} class="font-display text-xl tracking-tight">Jose Uribe</a>
  <nav aria-label={tr('nav.primary')} class="hidden items-center gap-7 text-sm md:flex">
    {items.map(([href, label]) => (
      <a href={localizePath(href, locale)} class:list={['hover:text-ink', isActive(href) ? 'text-ink font-medium' : 'text-ink-mut']} aria-current={isActive(href) ? 'page' : undefined}>{label}</a>
    ))}
    <a href={localizePath('/#contact', locale)} class="btn-primary py-2!">{tr('nav.contact')}</a>
    <LangSwitch {locale} {alternates} />
  </nav>
  <details class="md:hidden">
    <summary class="btn-ghost cursor-pointer list-none py-2!">{tr('nav.menu')}</summary>
    <nav aria-label={tr('nav.primary')} class="absolute inset-x-0 z-20 mt-3 flex flex-col gap-1 border-y border-line bg-paper px-5 py-4 text-base">
      {items.map(([href, label]) => (
        <a href={localizePath(href, locale)} class="py-2">{label}</a>
      ))}
      <a href={localizePath('/#contact', locale)} class="py-2 text-accent">{tr('nav.contact')}</a>
      <div class="pt-3"><LangSwitch {locale} {alternates} /></div>
    </nav>
  </details>
</header>
```

- [ ] **Step 6: Write `src/components/Footer.astro` and `SectionHeading.astro`**

`Footer.astro`:

```astro
---
import { t, type Locale } from '../i18n/ui';
import { site } from '../config/site';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const year = new Date().getFullYear();
---
<footer class="mt-24 border-t border-line">
  <div class="wrap flex flex-col gap-6 py-10 text-sm text-ink-mut md:flex-row md:items-center md:justify-between">
    <div>
      <p class="font-display text-lg text-ink">Jose Uribe</p>
      <p>{tr('footer.location')}</p>
    </div>
    <p class="max-w-md">{tr('footer.built')}</p>
    <ul class="flex gap-5">
      <li><a href={`mailto:${site.email}`} class="hover:text-ink">Email</a></li>
      <li><a href={site.upwork} rel="me noopener" target="_blank" class="hover:text-ink" data-outbound="upwork">Upwork</a></li>
      <li><a href={site.github} rel="me noopener" target="_blank" class="hover:text-ink" data-outbound="github">GitHub</a></li>
      <li><a href={site.linkedin} rel="me noopener" target="_blank" class="hover:text-ink" data-outbound="linkedin">LinkedIn</a></li>
    </ul>
  </div>
  <div class="wrap pb-8 text-xs text-ink-soft">© {year} Jose Uribe. {tr('footer.rights')}</div>
</footer>
```

`SectionHeading.astro`:

```astro
---
interface Props { eyebrow?: string; title: string; lead?: string; as?: 'h1' | 'h2' }
const { eyebrow, title, lead, as: Tag = 'h2' } = Astro.props;
---
<div class="max-w-2xl">
  {eyebrow && <p class="eyebrow mb-3">{eyebrow}</p>}
  <Tag class:list={[Tag === 'h1' ? 'text-display-lg' : 'text-display-md']}>{title}</Tag>
  {lead && <p class="mt-4 text-lg text-ink-mut">{lead}</p>}
</div>
```

- [ ] **Step 7: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Analytics from '@vercel/analytics/astro';
import { LOCALES, DEFAULT_LOCALE, localizePath, stripLocale, t, type Locale } from '../i18n/ui';
import { site } from '../config/site';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  locale: Locale;
  title: string;
  description: string;
  alternates?: Partial<Record<Locale, string>>;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}
const { locale, title, description, alternates, ogImage = '/og-default.png', noindex = false, jsonLd } = Astro.props;

const { path } = stripLocale(Astro.url.pathname);
const altHref = (l: Locale) => new URL(alternates?.[l] ?? localizePath(path, l), site.url).href;
const canonical = altHref(locale);
const ogLocale = { en: 'en_US', es: 'es_CO', pt: 'pt_BR' }[locale];
const ga4 = site.ga4Id;
const tr = t(locale);
---
<!doctype html>
<html lang={locale === 'pt' ? 'pt-BR' : locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex" />}
    {LOCALES.map((l) => <link rel="alternate" hreflang={l === 'pt' ? 'pt-BR' : l} href={altHref(l)} />)}
    <link rel="alternate" hreflang="x-default" href={altHref(DEFAULT_LOCALE)} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:locale" content={ogLocale} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, site.url).href} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#f5f1e8" />
    {jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
    {ga4 && (
      <>
        <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}></script>
        <script is:inline define:vars={{ ga4 }}>
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', ga4, { anonymize_ip: true });
        </script>
      </>
    )}
  </head>
  <body class="min-h-dvh">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">{tr('nav.skip')}</a>
    <Header {locale} {alternates} />
    <main id="main">
      <slot />
    </main>
    <Footer {locale} />
    <Analytics />
  </body>
</html>
```

- [ ] **Step 8: Write `src/pages/404.astro` and a temporary `index.astro`**

`404.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import { t } from '../i18n/ui';
const tr = t('en');
---
<Base locale="en" title={`${tr('notFound.title')} — Jose Uribe`} description={tr('notFound.text')} noindex>
  <section class="wrap py-24 text-center">
    <p class="eyebrow">404</p>
    <h1 class="mt-3 text-display-lg">{tr('notFound.title')}</h1>
    <p class="mt-4 text-ink-mut">{tr('notFound.text')}</p>
    <a href="/" class="btn-primary mt-8">{tr('notFound.home')}</a>
  </section>
</Base>
```

Temporary `src/pages/index.astro` (Task 6 replaces it):

```astro
---
import Base from '../layouts/Base.astro';
import { t } from '../i18n/ui';
const tr = t('en');
---
<Base locale="en" title="Jose Uribe — Full-stack developer" description={tr('home.sub')}>
  <section class="wrap py-24">
    <p class="eyebrow">{tr('home.eyebrow')}</p>
    <h1 class="mt-4 max-w-4xl text-display-xl">{tr('home.h1')}</h1>
    <p class="mt-6 max-w-2xl text-xl text-ink-mut">{tr('home.sub')}</p>
  </section>
</Base>
```

- [ ] **Step 9: Build and assert the head is correct**

Run:

```bash
npm run build && node -e "
const fs=require('fs');const h=fs.readFileSync('dist/index.html','utf8');
const must=['<html lang=\"en\"','hreflang=\"es\"','hreflang=\"pt-BR\"','hreflang=\"x-default\"','rel=\"canonical\" href=\"https://joseuribe.dev/\"','og:image'];
const miss=must.filter(s=>!h.includes(s));
if(miss.length){console.error('MISSING:',miss);process.exit(1)}
const css=fs.readdirSync('dist/_astro').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync('dist/_astro/'+f,'utf8')).join('');
if(!/Fraunces/.test(css)||!/Geist/.test(css)){console.error('fonts not in CSS');process.exit(1)}
console.log('head OK')"
```

Expected: `head OK`. Also run `npx astro check` — expected 0 errors.

- [ ] **Step 10: Commit**

```bash
git add src/config src/styles src/layouts src/components src/pages/404.astro src/pages/index.astro .env.example package.json package-lock.json
git commit -m "feat(layout): design tokens, fonts, Base layout with SEO head, header/footer, 404"
```

---

### Task 3: Sanity data layer and Portable Text renderer

**Files:**
- Create: `src/env.d.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`, `src/lib/sanity.ts`, `src/lib/portable-text.ts`, `src/lib/portable-text.test.ts`

**Interfaces:**
- Produces (from `content.ts`): types `ProjectKind = 'app'|'site'|'wordpress'`, `ProjectStatus = 'live'|'offline'|'parked'`, `SanityImage = { _type:'image'; asset:{ _ref:string }; hotspot?:unknown; crop?:unknown }`, `Project` (with `summary: string` and `caseStudy: unknown[] | null` **already resolved for the requested locale by GROQ**), `Post`, `PostTranslation = { language: Locale; slug: string | null }`; `otherTranslations(post, locale): PostTranslation[]`; GROQ constants `PROJECTS_QUERY`, `FEATURED_PROJECTS_QUERY`, `PROJECT_BY_SLUG_QUERY`, `PROJECT_SLUGS_WITH_CASE_QUERY`, `POSTS_QUERY`, `POST_BY_SLUG_QUERY` — every project query takes `$locale`.
- Produces (from `sanity.ts`): `getProjects(locale): Promise<Project[]>`, `getFeaturedProjects(locale): Promise<Project[]>`, `getProjectBySlug(locale, slug): Promise<Project|null>`, `getCaseStudySlugs(): Promise<string[]>`, `getPosts(locale): Promise<Post[]>`, `getPostBySlug(locale, slug): Promise<Post|null>`, `urlFor(src: SanityImage)` (image-url builder).
- Produces (from `portable-text.ts`): `renderPortableText(blocks: unknown[], opts?: { highlight?: (code:string, lang:string)=>Promise<string> }): Promise<string>`.

- [ ] **Step 1: Install runtime deps**

```bash
npm i @sanity/image-url @portabletext/to-html shiki
```

- [ ] **Step 2: Write `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_WEB3FORMS_KEY?: string;
  readonly PUBLIC_CAL_URL?: string;
}
```

- [ ] **Step 3: Write failing tests for `content.ts`**

`src/lib/content.test.ts`:

```ts
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
    expect(PROJECTS_QUERY).toContain('coalesce(summary[_key == $locale][0].value, summary[_key == "en"][0].value)');
  });
  it('posts query filters by language, excludes drafts, and resolves translations via metadata', () => {
    expect(POSTS_QUERY).toContain('language == $locale');
    expect(POSTS_QUERY).toContain('!(_id in path("drafts.**"))');
    expect(POSTS_QUERY).toContain('_type == "translation.metadata"');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './content'`

- [ ] **Step 5: Write `src/lib/content.ts`**

```ts
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Write `src/lib/sanity.ts`** (I/O only, no tests)

```ts
import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { Locale } from '../i18n/ui';
import {
  type Project, type Post, type SanityImage,
  PROJECTS_QUERY, FEATURED_PROJECTS_QUERY, PROJECT_BY_SLUG_QUERY, PROJECT_SLUGS_WITH_CASE_QUERY,
  POSTS_QUERY, POST_BY_SLUG_QUERY,
} from './content';

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (src: SanityImage) => builder.image(src).auto('format');

export const getProjects = (locale: Locale) => sanityClient.fetch<Project[]>(PROJECTS_QUERY, { locale });
export const getFeaturedProjects = (locale: Locale) => sanityClient.fetch<Project[]>(FEATURED_PROJECTS_QUERY, { locale });
export const getProjectBySlug = (locale: Locale, slug: string) => sanityClient.fetch<Project | null>(PROJECT_BY_SLUG_QUERY, { locale, slug });
export const getCaseStudySlugs = () => sanityClient.fetch<string[]>(PROJECT_SLUGS_WITH_CASE_QUERY);
export const getPosts = (locale: Locale) => sanityClient.fetch<Post[]>(POSTS_QUERY, { locale });
export const getPostBySlug = (locale: Locale, slug: string) => sanityClient.fetch<Post | null>(POST_BY_SLUG_QUERY, { locale, slug });
```

- [ ] **Step 8: Write failing tests for the Portable Text renderer**

`src/lib/portable-text.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderPortableText } from './portable-text';

const p = (text: string) => ({ _type: 'block', _key: 'k' + text.length, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's', text, marks: [] }] });

describe('renderPortableText', () => {
  it('renders paragraphs', async () => {
    const html = await renderPortableText([p('Hello')]);
    expect(html).toBe('<p>Hello</p>');
  });

  it('renders code blocks through the injected highlighter', async () => {
    const html = await renderPortableText(
      [{ _type: 'code', _key: 'c', language: 'ts', code: 'const a = 1' }],
      { highlight: async (code, lang) => `<pre data-lang="${lang}">${code}</pre>` },
    );
    expect(html).toBe('<pre data-lang="ts">const a = 1</pre>');
  });

  it('renders images with alt text via the image url builder', async () => {
    const html = await renderPortableText(
      [{ _type: 'image', _key: 'i', alt: 'A chart', asset: { _ref: 'image-abc123-800x600-png' } }],
      { imageUrl: () => 'https://cdn.example/abc.png' },
    );
    expect(html).toContain('<img');
    expect(html).toContain('src="https://cdn.example/abc.png"');
    expect(html).toContain('alt="A chart"');
    expect(html).toContain('loading="lazy"');
  });

  it('escapes quotes and ampersands in alt text and image urls (attribute context)', async () => {
    const html = await renderPortableText(
      [{ _type: 'image', _key: 'i', alt: 'She said "hi" & left', asset: { _ref: 'image-abc123-800x600-png' } }],
      { imageUrl: () => 'https://cdn.example/a.png?w=1&h=2' },
    );
    expect(html).toContain('alt="She said &quot;hi&quot; &amp; left"');
    expect(html).toContain('src="https://cdn.example/a.png?w=1&amp;h=2"');
    expect(html).not.toContain('"hi"');
  });
});
```

- [ ] **Step 9: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './portable-text'`

- [ ] **Step 10: Write `src/lib/portable-text.ts`**

```ts
import { toHTML, type PortableTextComponents } from '@portabletext/to-html';

type CodeBlock = { _type: 'code'; _key: string; language?: string; code: string; filename?: string };
type ImageBlock = { _type: 'image'; _key: string; alt?: string; asset: { _ref: string } };

export type RenderOptions = {
  highlight?: (code: string, lang: string) => Promise<string>;
  imageUrl?: (block: ImageBlock) => string;
};

async function defaultHighlight(code: string, lang: string): Promise<string> {
  const { codeToHtml } = await import('shiki');
  try {
    return await codeToHtml(code, { lang, theme: 'github-light' });
  } catch {
    return `<pre><code>${escape(code)}</code></pre>`;
  }
}

function defaultImageUrl(block: ImageBlock): string {
  // Lazy import avoids pulling sanity:client into unit tests.
  // In Astro this is replaced by passing `imageUrl: (b) => urlFor(b).width(1400).url()` from the caller.
  return `/_sanity-image-missing/${block.asset._ref}`;
}

// Attribute-safe escaper: encodes &, <, >, and both quote characters.
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function renderPortableText(blocks: unknown[], opts: RenderOptions = {}): Promise<string> {
  const highlight = opts.highlight ?? defaultHighlight;
  const imageUrl = opts.imageUrl ?? defaultImageUrl;

  // Pre-render async pieces (code highlighting) because toHTML is synchronous.
  const prepared = await Promise.all(
    (blocks as Array<Record<string, unknown>>).map(async (b) => {
      if (b._type === 'code') {
        const c = b as CodeBlock;
        return { _type: 'html', _key: c._key, html: await highlight(c.code, c.language ?? 'text') };
      }
      return b;
    }),
  );

  const components: PortableTextComponents = {
    types: {
      html: ({ value }) => (value as { html: string }).html,
      image: ({ value }) => {
        const v = value as ImageBlock;
        return `<img src="${escape(imageUrl(v))}" alt="${escape(v.alt ?? '')}" loading="lazy" decoding="async" />`;
      },
    },
  };

  return toHTML(prepared, { components });
}
```

- [ ] **Step 11: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all)

- [ ] **Step 12: Build and type-check**

Run: `npx astro check && npm run build`
Expected: 0 errors; build completes.

- [ ] **Step 13: Commit**

```bash
git add src/env.d.ts src/lib package.json package-lock.json
git commit -m "feat(content): Sanity types, GROQ queries, fetchers, Portable Text renderer"
```

---

### Task 4: Project data, screenshots and seed script

> **Gate:** Prerequisites 1–2 done (`PUBLIC_SANITY_PROJECT_ID` real, `SANITY_API_TOKEN` set). The four Upwork screenshots are **optional for now** (decision 2026-09-06): projects without a screenshot are skipped by the seed and appear once the PNGs are dropped into `tmp/screenshots/` and the seed is re-run — it patches by slug.

**Files:**
- Create: `data/projects.json`, `scripts/capture-screenshots.mjs`, `scripts/seed-projects.mjs`
- Modify: `.gitignore` (add `tmp/`), `.env.example` (add `SANITY_API_TOKEN=`)

**Interfaces:**
- Produces: 12 published `project` documents in Sanity (Sanity-generated `_id`s; re-runs find them by slug and patch); the four with an English `caseStudy` are `armony`, `avgust`, `klicana`, `enlace`.

- [ ] **Step 1: Install Playwright (dev) and its Chromium**

```bash
npm i -D playwright && npx playwright install chromium
echo "tmp/" >> .gitignore
```

Add to `.env.example`:

```
# Sanity write token (Manage → API → Tokens, role Editor). Only for scripts/. NEVER PUBLIC_.
SANITY_API_TOKEN=
```

- [ ] **Step 2: Write `data/projects.json`**

`year` is derived from when each project was published to Upwork; **Jose corrects it in the Studio after seeding.** Order and `featured` follow the brand spec.

```json
[
  {
    "slug": "armony",
    "title": "Armony — Plan contracting wizard",
    "kind": "app",
    "client": "Funeraria Armony · Ecuador",
    "role": "Full Stack Developer",
    "year": 2026,
    "stack": ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Server Actions"],
    "url": "https://planes.armony.com.ec/",
    "status": "live",
    "featured": true,
    "order": 1,
    "summary": {
      "en": "A multi-step wizard for buying funeral service plans online, modeled after flight-booking flows: clear progress, plan selection, and a payment summary at checkout. Next.js Server Actions with Supabase as the backend.",
      "es": "Un wizard de varios pasos para contratar planes exequiales en línea, inspirado en los flujos de reserva de vuelos: progreso claro, selección de plan y resumen de pago al final. Next.js Server Actions con Supabase como backend.",
      "pt": "Um wizard em várias etapas para contratar planos funerários online, inspirado nos fluxos de reserva de voos: progresso claro, seleção de plano e resumo de pagamento no final. Next.js Server Actions com Supabase como backend."
    },
    "caseStudy": {
      "en": [
        "Armony sells funeral service plans in Ecuador. Their sales happened by phone and in person, and every plan had variables — coverage, number of beneficiaries, payment schedule — that made a simple form useless. They needed something closer to booking a flight than to filling a contact form.",
        "I designed the purchase as a multi-step wizard: pick a plan, add beneficiaries, choose how to pay, review a summary, pay. Each step validates on the server with Next.js Server Actions so the client never holds pricing logic. Supabase stores drafts, so a customer can leave and come back without losing progress.",
        "The result is a checkout that a first-time visitor completes without talking to a salesperson, and that the company's team can follow from the same database. It is approaching production launch."
      ]
    }
  },
  {
    "slug": "avgust",
    "title": "Avgust — Carbon footprint calculator with PDF certificate",
    "kind": "app",
    "client": "Avgust · sustainability consultancy",
    "role": "Full Stack Developer",
    "year": 2023,
    "stack": ["Vue.js", "Vuetify", "Tailwind CSS", "Client-side PDF"],
    "url": null,
    "status": "offline",
    "featured": true,
    "order": 2,
    "summary": {
      "en": "A calculator that lets visitors measure their CO₂ emissions and download a certificate with the result as a PDF, generated in the browser. The company uses it as a lead magnet and as the entry point to its sustainability services.",
      "es": "Una calculadora que permite a los visitantes medir sus emisiones de CO₂ y descargar un certificado con el resultado en PDF, generado en el navegador. La empresa la usa como imán de leads y puerta de entrada a sus servicios de sostenibilidad.",
      "pt": "Uma calculadora que permite aos visitantes medir suas emissões de CO₂ e baixar um certificado com o resultado em PDF, gerado no navegador. A empresa a usa como isca de leads e porta de entrada para seus serviços de sustentabilidade."
    },
    "caseStudy": {
      "en": [
        "Avgust advises companies on sustainability. Their problem was the top of the funnel: people were curious about their footprint but had no reason to leave their contact details.",
        "The calculator gives each visitor a concrete number plus guidance on how to reduce it, and then offers a downloadable certificate. The PDF is generated entirely client-side — no server, no queue, instant. Built with Vue.js and Vuetify, styled with Tailwind CSS.",
        "A result someone can share is a result someone will share. The tool became the company's main lead source and the natural first step into a paid engagement."
      ]
    }
  },
  {
    "slug": "klicana",
    "title": "Klicana — Affiliate marketing platform",
    "kind": "app",
    "client": "Klicana",
    "role": "Full Stack Developer",
    "year": 2023,
    "stack": ["Next.js 13", "React", "WordPress REST API", "JWT", "WooCommerce"],
    "url": null,
    "status": "offline",
    "featured": true,
    "order": 3,
    "summary": {
      "en": "An affiliate marketing platform in the vein of ClickBank and Hotmart: a Next.js app running on top of an existing WordPress install. Custom REST endpoints feed the app and JWT issued by WordPress keeps a single user base for both halves. Shipped to a closed beta.",
      "es": "Una plataforma de marketing de afiliados al estilo de ClickBank y Hotmart: una app en Next.js corriendo sobre un WordPress existente. Endpoints REST a medida alimentan la app y JWT emitido por WordPress mantiene una sola base de usuarios. Lanzada en beta cerrada.",
      "pt": "Uma plataforma de marketing de afiliados no estilo ClickBank e Hotmart: um app em Next.js rodando sobre um WordPress existente. Endpoints REST sob medida alimentam o app e JWT emitido pelo WordPress mantém uma única base de usuários. Lançada em beta fechado."
    },
    "caseStudy": {
      "en": [
        "Klicana wanted a marketplace where sellers list digital products and affiliates promote them for a commission — the ClickBank model — but they already had a WordPress site with users, products and WooCommerce orders they could not throw away.",
        "Instead of rebuilding everything, I built the platform as a Next.js 13 app on top of WordPress. I extended the WordPress REST API with custom endpoints for products, affiliate links and commissions, and wired authentication through JWT issued by WordPress so a seller logs in once and exists in both systems.",
        "The platform shipped to a closed beta with a controlled group of sellers. It is also the clearest example of why I don't treat WordPress as the enemy: sometimes the right move is to keep it as the backend and build the experience on top."
      ]
    }
  },
  {
    "slug": "enlace",
    "title": "Enlace — Research NGO institutional site",
    "kind": "site",
    "client": "Enlace · Rio de Janeiro",
    "role": "Full Stack Developer",
    "year": 2026,
    "stack": ["Astro", "Tailwind CSS", "TypeScript"],
    "url": "https://www.enlacepesquisa.org/",
    "status": "live",
    "featured": true,
    "order": 4,
    "summary": {
      "en": "The institutional site for a Rio de Janeiro civil society organization working in research, training and advocacy. Eight sections in Brazilian Portuguese, an abstract network illustration instead of stock photography, fully static and tuned for Core Web Vitals.",
      "es": "El sitio institucional de una organización de la sociedad civil de Río de Janeiro dedicada a investigación, formación e incidencia. Ocho secciones en portugués de Brasil, una ilustración abstracta de red en lugar de fotos de stock, totalmente estático y afinado para Core Web Vitals.",
      "pt": "O site institucional de uma organização da sociedade civil do Rio de Janeiro que atua em pesquisa, formação e advocacy. Oito seções em português do Brasil, uma ilustração abstrata de rede no lugar de fotos de banco, totalmente estático e ajustado para Core Web Vitals."
    },
    "caseStudy": {
      "en": [
        "Enlace does research, training and social advocacy in Rio de Janeiro. They needed a site that looked serious to funders and institutions, loaded fast on the phones their audience actually uses, and could be handed to a small team without a maintenance contract.",
        "I built it in Astro with Tailwind CSS: eight sections covering the three programme areas, projects, events, publications, transparency and contact. Instead of stock photography I used an abstract network illustration with restrained motion — it reads as institutional without looking like every other NGO site.",
        "Fully static, no plugins, nothing to update. It is live at enlacepesquisa.org and it is the clearest before-and-after I can show for what 'leaving WordPress' means in practice."
      ]
    }
  },
  {
    "slug": "miami-trading-lab",
    "title": "Miami Trading Lab — Trading e-learning platform",
    "kind": "app",
    "client": "Miami Trading Lab · United States",
    "role": "Full Stack Developer",
    "year": 2023,
    "stack": ["WordPress", "Elementor", "Thinkific", "Financial Modeling Prep API", "Payment gateways"],
    "url": null,
    "status": "offline",
    "featured": false,
    "order": 5,
    "summary": {
      "en": "An e-learning platform for Spanish-speaking students in the US learning to trade. WordPress and Elementor for the content, Thinkific as the LMS, payment gateways connected end to end, and an automated financial news section fed by the Financial Modeling Prep API.",
      "es": "Una plataforma de e-learning para estudiantes hispanohablantes en EE.UU. que aprenden a operar en bolsa. WordPress y Elementor para el contenido, Thinkific como LMS, pasarelas de pago conectadas de punta a punta y una sección de noticias financieras automatizada con la API de Financial Modeling Prep.",
      "pt": "Uma plataforma de e-learning para estudantes hispanofalantes nos EUA que aprendem a operar na bolsa. WordPress e Elementor para o conteúdo, Thinkific como LMS, gateways de pagamento conectados de ponta a ponta e uma seção de notícias financeiras automatizada com a API do Financial Modeling Prep."
    }
  },
  {
    "slug": "stephania-lopez",
    "title": "Stephania López — Branding designer portfolio",
    "kind": "site",
    "client": "Stephania López · Medellín",
    "role": "Developer",
    "year": 2025,
    "stack": ["Astro", "Tailwind CSS", "TypeScript"],
    "url": "https://stephanialopez.co",
    "status": "live",
    "featured": false,
    "order": 6,
    "summary": {
      "en": "A portfolio for a branding and packaging designer with nine years in hospitality and lifestyle brands. Visual-first layout, static, fast, and built to her aesthetic — no templates.",
      "es": "Un portafolio para una diseñadora de marca y empaque con nueve años en marcas de hospitalidad y estilo de vida. Diseño visual primero, estático, rápido y hecho a su estética — sin plantillas.",
      "pt": "Um portfólio para uma designer de marca e embalagem com nove anos em marcas de hospitalidade e lifestyle. Layout visual em primeiro lugar, estático, rápido e feito para a estética dela — sem templates."
    }
  },
  {
    "slug": "serendipia",
    "title": "Serendipia — Corporate wellness brand site",
    "kind": "site",
    "client": "Serendipia",
    "role": "Developer",
    "year": 2025,
    "stack": ["Astro", "Tailwind CSS", "TypeScript"],
    "url": "https://serendipialight.com",
    "status": "live",
    "featured": false,
    "order": 7,
    "summary": {
      "en": "A site for a yoga instructor and corporate wellness provider selling emotional well-being programs to organizations. Calm and professional, aimed at HR and leadership, with a content-first structure.",
      "es": "Un sitio para una instructora de yoga y proveedora de bienestar corporativo que vende programas de bienestar emocional a organizaciones. Calmado y profesional, dirigido a RR.HH. y liderazgo, con una estructura que prioriza el contenido.",
      "pt": "Um site para uma instrutora de yoga e provedora de bem-estar corporativo que vende programas de bem-estar emocional para organizações. Calmo e profissional, voltado a RH e liderança, com estrutura que prioriza o conteúdo."
    }
  },
  {
    "slug": "hablo-portugues",
    "title": "Hablo Portugués — Language learning site",
    "kind": "wordpress",
    "client": "Hablo Portugués",
    "role": "Full Stack Developer",
    "year": 2025,
    "stack": ["WordPress", "Elementor"],
    "url": "https://habloportugues.com/",
    "status": "live",
    "featured": false,
    "order": 8,
    "summary": {
      "en": "A WordPress site for a Portuguese language educator targeting Spanish speakers, positioned around cultural immersion rather than grammar drills. Clean, content-driven, optimized for readability and lead capture.",
      "es": "Un sitio en WordPress para una educadora de portugués dirigida a hispanohablantes, posicionado en la inmersión cultural más que en la gramática. Limpio, centrado en el contenido, optimizado para lectura y captura de leads.",
      "pt": "Um site em WordPress para uma educadora de português voltada a hispanofalantes, posicionado na imersão cultural em vez da gramática. Limpo, centrado no conteúdo, otimizado para leitura e captação de leads."
    }
  },
  {
    "slug": "affine",
    "title": "Affine — Corporate site",
    "kind": "wordpress",
    "client": "Affine · Colombia",
    "role": "Developer",
    "year": 2025,
    "stack": ["WordPress", "Elementor", "Performance optimization"],
    "url": "https://affine.com.co",
    "status": "live",
    "featured": false,
    "order": 9,
    "summary": {
      "en": "A corporate WordPress site for a Colombian company: custom layout focused on brand presentation and lead generation, optimized for mobile and page speed.",
      "es": "Un sitio corporativo en WordPress para una empresa colombiana: diseño a medida centrado en presentación de marca y generación de leads, optimizado para móvil y velocidad.",
      "pt": "Um site corporativo em WordPress para uma empresa colombiana: layout sob medida focado em apresentação de marca e geração de leads, otimizado para celular e velocidade."
    }
  },
  {
    "slug": "siamo",
    "title": "SIAMO — Corporate services site",
    "kind": "wordpress",
    "client": "SIAMO · Colombia",
    "role": "Developer",
    "year": 2025,
    "stack": ["WordPress", "Elementor", "Custom theme"],
    "url": "https://siamoservicios.com",
    "status": "live",
    "featured": false,
    "order": 10,
    "summary": {
      "en": "A WordPress site for a Colombian outsourced business services company. Clean, professional layout that communicates the value proposition to mid-size clients; custom theme with performance and mobile optimization.",
      "es": "Un sitio en WordPress para una empresa colombiana de servicios empresariales tercerizados. Diseño limpio y profesional que comunica la propuesta de valor a clientes medianos; tema a medida con optimización de rendimiento y móvil.",
      "pt": "Um site em WordPress para uma empresa colombiana de serviços empresariais terceirizados. Layout limpo e profissional que comunica a proposta de valor a clientes de médio porte; tema sob medida com otimização de desempenho e celular."
    }
  },
  {
    "slug": "zohara",
    "title": "Zohara — Villa rental catalog with WhatsApp pre-booking",
    "kind": "wordpress",
    "client": "Zohara · Colombia",
    "role": "Full Stack Developer",
    "year": 2023,
    "stack": ["WordPress", "Crocoblock", "JetEngine", "JetBooking"],
    "url": null,
    "status": "parked",
    "featured": false,
    "order": 11,
    "summary": {
      "en": "A villa rental catalog with a pre-booking flow that routes each enquiry into WhatsApp already carrying the quote for the selected villa. WordPress with Crocoblock, JetEngine and JetBooking, mobile-first because most traffic arrives from social media.",
      "es": "Un catálogo de alquiler de villas con un flujo de pre-reserva que lleva cada consulta a WhatsApp con la cotización de la villa elegida ya incluida. WordPress con Crocoblock, JetEngine y JetBooking, mobile-first porque casi todo el tráfico llega desde redes sociales.",
      "pt": "Um catálogo de aluguel de vilas com um fluxo de pré-reserva que leva cada consulta ao WhatsApp já com o orçamento da vila escolhida. WordPress com Crocoblock, JetEngine e JetBooking, mobile-first porque quase todo o tráfego chega das redes sociais."
    }
  },
  {
    "slug": "overnatic",
    "title": "Overnatic — Web development agency site",
    "kind": "site",
    "client": "Overnatic (own brand, 2026)",
    "role": "Founder & Developer",
    "year": 2026,
    "stack": ["Astro", "TypeScript", "GSAP", "Vercel"],
    "url": "https://overnatic.us",
    "status": "live",
    "featured": false,
    "order": 12,
    "summary": {
      "en": "The site for a web development brand I ran in 2026: fully static Astro, multilingual (ES/EN/PT), custom OG images, and a WhatsApp-first contact flow. Retired in favor of this site — the lessons from it are on the blog.",
      "es": "El sitio de una marca de desarrollo web que operé en 2026: Astro totalmente estático, multilingüe (ES/EN/PT), imágenes OG a medida y contacto por WhatsApp. Retirado a favor de este sitio — las lecciones están en el blog.",
      "pt": "O site de uma marca de desenvolvimento web que operei em 2026: Astro totalmente estático, multilíngue (ES/EN/PT), imagens OG sob medida e contato via WhatsApp. Aposentado em favor deste site — as lições estão no blog."
    }
  }
]
```

- [ ] **Step 3: Write `scripts/capture-screenshots.mjs`**

```js
// Captures the live client sites to tmp/screenshots/<slug>.png (1440×900, above the fold).
// Run: node scripts/capture-screenshots.mjs
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));
const targets = projects.filter((p) => p.status === 'live' && p.url);
mkdirSync('tmp/screenshots', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'es-CO' });

for (const p of targets) {
  const page = await ctx.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `tmp/screenshots/${p.slug}.png`, fullPage: false });
    console.log('✓', p.slug);
  } catch (e) {
    console.error('✗', p.slug, e.message);
  } finally {
    await page.close();
  }
}
await browser.close();
```

- [ ] **Step 4: Run it and check the output**

Run: `node scripts/capture-screenshots.mjs && ls tmp/screenshots/`
Expected: 8 files — `armony.png enlace.png stephania-lopez.png serendipia.png hablo-portugues.png affine.png siamo.png overnatic.png`. Open two of them and confirm they show the actual site, not a cookie banner or an error page. If a site shows a cookie banner, add a `page.click()` for its accept button inside the try block for that slug.

The four Upwork files (`klicana.png`, `miami-trading-lab.png`, `avgust.png`, `zohara.png`) are added by Jose whenever available; their absence is expected today and produces explicit `skip` lines in the next step.

- [ ] **Step 5: Write `scripts/seed-projects.mjs`**

```js
// Uploads screenshots and creates/replaces the 12 project documents.
// Run: node --env-file=.env scripts/seed-projects.mjs
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const { PUBLIC_SANITY_PROJECT_ID: projectId, PUBLIC_SANITY_DATASET: dataset = 'production', SANITY_API_TOKEN: token } = process.env;
if (!projectId || projectId === 'placeholder' || !token) {
  console.error('Set PUBLIC_SANITY_PROJECT_ID (real) and SANITY_API_TOKEN in .env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-09-01', useCdn: false });
const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));

const key = () => randomUUID().slice(0, 12);
const toBlocks = (paragraphs) =>
  paragraphs.map((text) => ({
    _type: 'block', _key: key(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }));

// sanity-plugin-internationalized-array shapes: [{ _key: locale, _type: 'internationalizedArray<Type>Value', value }]
const i18nText = (obj) => Object.entries(obj).map(([lang, value]) => ({ _key: lang, _type: 'internationalizedArrayTextValue', value }));
const i18nRich = (obj) => Object.entries(obj).map(([lang, paragraphs]) => ({ _key: lang, _type: 'internationalizedArrayRichTextValue', value: toBlocks(paragraphs) }));

let published = 0;
for (const p of projects) {
  const file = `tmp/screenshots/${p.slug}.png`;
  if (!existsSync(file)) {
    console.warn(`skip ${p.slug}: no screenshot at ${file} (rule: no screenshot, no publish)`);
    continue;
  }
  const asset = await client.assets.upload('image', createReadStream(file), { filename: `${p.slug}.png` });
  const fields = {
    title: p.title,
    slug: { _type: 'slug', current: p.slug },
    kind: p.kind,
    client: p.client,
    role: p.role,
    year: p.year,
    stack: p.stack,
    url: p.url ?? undefined,
    status: p.status,
    featured: p.featured,
    order: p.order,
    screenshot: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    summary: i18nText(p.summary),
    caseStudy: p.caseStudy ? i18nRich(p.caseStudy) : undefined,
  };
  // Sanity rule: never invent _ids. Find by slug; patch if it exists, create otherwise.
  const existingId = await client.fetch('*[_type == "project" && slug.current == $slug][0]._id', { slug: p.slug });
  if (existingId) {
    await client.patch(existingId).set(fields).unset(p.caseStudy ? [] : ['caseStudy']).commit();
    console.log('↻', p.slug, '(updated)');
  } else {
    await client.create({ _type: 'project', ...fields });
    console.log('✓', p.slug);
  }
  published++;
}
console.log(`${published}/${projects.length} projects published`);
```

- [ ] **Step 6: Run the seed and verify in the Studio**

Run: `node --env-file=.env scripts/seed-projects.mjs`
Expected: `N/12 projects published` where N equals the number of PNGs in `tmp/screenshots/` (8 today), with one explicit `skip` line per missing screenshot.

Then in `../studio-personal-site` run `npm run dev`, open http://localhost:3333, log in, open **Projects**: one document per seeded project (8 today), in manual order, each with a screenshot and a language tab bar on Summary. Open Armony: the Case study field shows three paragraphs under EN and empty ES/PT tabs.

- [ ] **Step 7: Commit**

```bash
git add data scripts .gitignore .env.example package.json package-lock.json
git commit -m "feat(content): 12 projects dataset, screenshot capture and Sanity seed scripts"
```

---

### Task 5: Work index and case-study pages (three locales)

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/ProjectGrid.astro`, `src/views/WorkIndexView.astro`, `src/views/WorkDetailView.astro`, `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/pages/work/index.astro`, `src/pages/work/[slug].astro`, `src/pages/es/work/index.astro`, `src/pages/es/work/[slug].astro`, `src/pages/pt/work/index.astro`, `src/pages/pt/work/[slug].astro`

**Interfaces:**
- Consumes: `getProjects(locale)`, `getProjectBySlug(locale, slug)`, `getCaseStudySlugs()`, `urlFor` (sanity.ts); `Project` (content.ts — `summary` and `caseStudy` already localized); `renderPortableText`; `t`, `localizePath`.
- Produces: `seo.ts` → `personJsonLd()`, `creativeWorkJsonLd(project, locale)`, `articleJsonLd(post, locale)`; `ProjectCard` props `{ project: Project; locale: Locale; eager?: boolean }`; `ProjectGrid` props `{ projects: Project[]; locale: Locale; filter?: boolean }`.

- [ ] **Step 1: Failing tests for `seo.ts`**

`src/lib/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { personJsonLd, creativeWorkJsonLd, articleJsonLd } from './seo';

describe('JSON-LD builders', () => {
  it('person has the essentials', () => {
    const p = personJsonLd();
    expect(p['@type']).toBe('Person');
    expect(p.name).toBe('Jose Uribe');
    expect(p.url).toBe('https://joseuribe.dev');
    expect(p.sameAs).toContain('https://www.upwork.com/freelancers/joseuribeh');
  });
  it('creative work uses the summary and the localized case-study url', () => {
    const cw = creativeWorkJsonLd({ slug: 'armony', title: 'Armony', summary: 'ES' } as any, 'es');
    expect(cw['@type']).toBe('CreativeWork');
    expect(cw.description).toBe('ES');
    expect(cw.url).toBe('https://joseuribe.dev/es/work/armony');
    expect(cw.author['@type']).toBe('Person');
  });
  it('article uses locale url and published date', () => {
    const a = articleJsonLd({ slug: 'x', title: 'T', excerpt: 'E', publishedAt: '2026-09-06T00:00:00Z' } as any, 'en');
    expect(a['@type']).toBe('Article');
    expect(a.mainEntityOfPage).toBe('https://joseuribe.dev/blog/x');
    expect(a.datePublished).toBe('2026-09-06T00:00:00Z');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` — Expected: FAIL, `Cannot find module './seo'`

- [ ] **Step 3: Write `src/lib/seo.ts`**

```ts
import { site } from '../config/site';
import { localizePath, type Locale } from '../i18n/ui';
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
    inLanguage: locale === 'pt' ? 'pt-BR' : locale,
    mainEntityOfPage: abs(`/blog/${post.slug}`, locale),
    author: { '@type': 'Person', name: site.name, url: site.url },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` — Expected: PASS

- [ ] **Step 5: Write `ProjectCard.astro`**

```astro
---
import { t, localizePath, type Locale } from '../i18n/ui';
import type { Project } from '../lib/content';
import { urlFor } from '../lib/sanity';
interface Props { project: Project; locale: Locale; eager?: boolean; hasCase?: boolean }
const { project: p, locale, eager = false, hasCase = false } = Astro.props;
const tr = t(locale);
const img = urlFor(p.screenshot).width(1200).height(750).fit('crop').url();
const img2x = urlFor(p.screenshot).width(2400).height(1500).fit('crop').url();
const kindLabel = { app: tr('work.filterApp'), site: tr('work.filterSite'), wordpress: tr('work.filterWp') }[p.kind];
const caseHref = hasCase ? localizePath(`/work/${p.slug}`, locale) : null;
const live = p.status === 'live' && p.url;
// No destination → no anchor. An <a> without href is unfocusable and confusing to assistive tech.
const Wrapper = caseHref || live ? 'a' : 'div';
const alt = `${tr('work.screenshotOf')} ${p.title}`;
---
<article class="group flex flex-col gap-4" data-kind={p.kind}>
  <Wrapper href={caseHref ?? (live ? p.url! : undefined)} target={caseHref ? undefined : live ? '_blank' : undefined} rel={caseHref ? undefined : live ? 'noopener' : undefined} class="block overflow-hidden rounded-xl border border-line bg-paper-pure shadow-sm" data-outbound={!caseHref && live ? p.slug : undefined}>
    <img src={img} srcset={`${img} 1200w, ${img2x} 2400w`} sizes="(min-width: 768px) 50vw, 100vw" width="1200" height="750" alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" class="aspect-[8/5] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" />
  </Wrapper>
  <div>
    <p class="eyebrow">{kindLabel}{p.year ? ` · ${p.year}` : ''}</p>
    <h3 class="mt-1 text-xl">{p.title}</h3>
    <p class="mt-2 text-ink-mut">{p.summary}</p>
    <div class="mt-3 flex flex-wrap gap-4 text-sm">
      {caseHref && <a href={caseHref} class="text-accent underline underline-offset-4">{tr('work.caseStudy')}</a>}
      {live && <a href={p.url!} target="_blank" rel="noopener" class="text-ink-mut hover:text-ink" data-outbound={p.slug}>{tr('work.viewSite')} ↗</a>}
      {p.status === 'parked' && <span class="text-ink-soft">{tr('work.parked')}</span>}
    </div>
  </div>
</article>
```

- [ ] **Step 6: Write `ProjectGrid.astro`** (filter works with and without JS: without JS all cards show)

```astro
---
import { t, type Locale } from '../i18n/ui';
import type { Project } from '../lib/content';
import ProjectCard from './ProjectCard.astro';
interface Props { projects: Project[]; locale: Locale; filter?: boolean; caseSlugs?: string[] }
const { projects, locale, filter = false, caseSlugs = [] } = Astro.props;
const tr = t(locale);
const filters = [['all', tr('work.filterAll')], ['app', tr('work.filterApp')], ['site', tr('work.filterSite')], ['wordpress', tr('work.filterWp')]] as const;
---
{filter && (
  <div class="mb-8 flex flex-wrap gap-2" role="group" aria-label={tr('work.title')} data-filters>
    {filters.map(([k, label], i) => (
      <button type="button" data-filter={k} aria-pressed={i === 0 ? 'true' : 'false'} class="btn-ghost py-2! text-sm aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper">{label}</button>
    ))}
  </div>
)}
<div class="grid gap-10 md:grid-cols-2" data-grid>
  {projects.map((p, i) => <ProjectCard project={p} {locale} eager={i < 2} hasCase={caseSlugs.includes(p.slug)} />)}
</div>
<script>
    const root = document.querySelector('[data-filters]');
    const cards = [...document.querySelectorAll<HTMLElement>('[data-grid] [data-kind]')];
    root?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
      if (!btn) return;
      const k = btn.dataset.filter;
      root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      cards.forEach((c) => { c.hidden = k !== 'all' && c.dataset.kind !== k; });
    });
</script>
```

- [ ] **Step 7: Write the two views**

`src/views/WorkIndexView.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ProjectGrid from '../components/ProjectGrid.astro';
import { t, type Locale } from '../i18n/ui';
import { getProjects, getCaseStudySlugs } from '../lib/sanity';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const [projects, caseSlugs] = await Promise.all([getProjects(locale), getCaseStudySlugs()]);
---
<Base {locale} title={`${tr('work.title')} — Jose Uribe`} description={tr('work.lead')}>
  <section class="wrap py-16 md:py-24">
    <SectionHeading as="h1" title={tr('work.title')} lead={tr('work.lead')} />
    <div class="mt-12">
      <ProjectGrid {projects} {locale} filter caseSlugs={caseSlugs} />
    </div>
  </section>
</Base>
```

`src/views/WorkDetailView.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import { t, localizePath, type Locale } from '../i18n/ui';
import type { Project } from '../lib/content';
import { urlFor } from '../lib/sanity';
import { renderPortableText } from '../lib/portable-text';
import { creativeWorkJsonLd } from '../lib/seo';
interface Props { locale: Locale; project: Project }
const { locale, project: p } = Astro.props;
const tr = t(locale);
const html = await renderPortableText(p.caseStudy ?? [], { imageUrl: (b) => urlFor(b as any).width(1400).url() });
const hero = urlFor(p.screenshot).width(1600).height(1000).fit('crop').url();
const summary = p.summary;
const alt = `${tr('work.screenshotOf')} ${p.title}`;
const live = p.status === 'live' && p.url;
---
<Base {locale} title={`${p.title} — Jose Uribe`} description={summary} ogImage={urlFor(p.screenshot).width(1200).height(630).fit('crop').url()} jsonLd={creativeWorkJsonLd(p, locale)}>
  <article class="wrap py-16 md:py-24">
    <a href={localizePath('/work', locale)} class="text-sm text-ink-mut hover:text-ink">← {tr('work.back')}</a>
    <h1 class="mt-6 max-w-3xl text-display-lg">{p.title}</h1>
    <p class="mt-4 max-w-2xl text-xl text-ink-mut">{summary}</p>
    <dl class="mt-8 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-4">
      {p.client && <div><dt class="eyebrow">{tr('work.client')}</dt><dd class="mt-1">{p.client}</dd></div>}
      {p.role && <div><dt class="eyebrow">{tr('work.role')}</dt><dd class="mt-1">{p.role}</dd></div>}
      {p.year && <div><dt class="eyebrow">{tr('work.year')}</dt><dd class="mt-1">{p.year}</dd></div>}
      {p.stack && p.stack.length > 0 && <div class="col-span-2 md:col-span-1"><dt class="eyebrow">{tr('work.stack')}</dt><dd class="mt-1">{p.stack.join(' · ')}</dd></div>}
    </dl>
    <img src={hero} width="1600" height="1000" alt={alt} loading="eager" decoding="async" class="mt-12 w-full rounded-xl border border-line" />
    <div class="prose-site mt-12" set:html={html} />
    {live && <p class="mt-10"><a href={p.url!} target="_blank" rel="noopener" class="btn-primary" data-outbound={p.slug}>{tr('work.viewSite')} ↗</a></p>}
  </article>
</Base>
```

- [ ] **Step 8: Write the six page files**

`src/pages/work/index.astro`:

```astro
---
import WorkIndexView from '../../views/WorkIndexView.astro';
---
<WorkIndexView locale="en" />
```

`src/pages/es/work/index.astro` and `src/pages/pt/work/index.astro`: identical with `locale="es"` / `locale="pt"` and one more `../` in the import path (`../../../views/WorkIndexView.astro`).

`src/pages/work/[slug].astro`:

```astro
---
import WorkDetailView from '../../views/WorkDetailView.astro';
import { getCaseStudySlugs, getProjectBySlug } from '../../lib/sanity';
export async function getStaticPaths() {
  const slugs = await getCaseStudySlugs();
  return Promise.all(slugs.map(async (slug) => ({ params: { slug }, props: { project: (await getProjectBySlug('en', slug))! } })));
}
const { project } = Astro.props;
---
<WorkDetailView locale="en" {project} />
```

`src/pages/es/work/[slug].astro` and `src/pages/pt/work/[slug].astro`: identical with `getProjectBySlug('es', slug)` / `getProjectBySlug('pt', slug)`, `locale="es"` / `locale="pt"`, and `../../../` import paths.

- [ ] **Step 9: Build and assert** (expectations derive from which screenshots exist, so the same check holds with 8 projects today and 12 later)

```bash
npm run build && node -e "
const fs=require('fs');
const all=JSON.parse(fs.readFileSync('data/projects.json','utf8'));
const seeded=all.filter(p=>fs.existsSync('tmp/screenshots/'+p.slug+'.png'));
const withCase=seeded.filter(p=>p.caseStudy).map(p=>p.slug);
const idx=fs.readFileSync('dist/work/index.html','utf8');
const cards=(idx.match(/data-kind=/g)||[]).length; if(cards!==seeded.length){console.error('expected',seeded.length,'cards, got',cards);process.exit(1)}
if(seeded.some(p=>p.slug==='zohara')){ if(!/Temporarily offline/.test(idx)){console.error('Zohara parked label missing');process.exit(1)} if(/href=\"https:\/\/zohara/.test(idx)){console.error('Zohara must not link out');process.exit(1)} }
for(const sl of withCase){ for(const l of ['','es/','pt/']){ const p='dist/'+l+'work/'+sl+'/index.html'; if(!fs.existsSync(p)){console.error('missing',p);process.exit(1)} } }
for(const p of seeded.filter(p=>!p.caseStudy)){ if(fs.existsSync('dist/work/'+p.slug+'/index.html')){console.error(p.slug,'must not have a case page');process.exit(1)} }
const es=fs.readFileSync('dist/es/work/index.html','utf8'); if(!es.includes('Ver sitio')){console.error('ES copy missing');process.exit(1)}
console.log('work OK —',seeded.length,'projects,',withCase.length,'case pages')"
```

Expected: `work OK — 8 projects, 2 case pages` today (`12 … 4` once the Upwork screenshots are seeded).

- [ ] **Step 10: Commit**

```bash
git add src/components/ProjectCard.astro src/components/ProjectGrid.astro src/views/Work*.astro src/lib/seo.ts src/lib/seo.test.ts src/pages/work src/pages/es/work src/pages/pt/work
git commit -m "feat(work): project grid with filter and case-study pages in en/es/pt"
```

---

### Task 6: Home (three locales)

**Files:**
- Create: `src/views/HomeView.astro`, `src/pages/es/index.astro`, `src/pages/pt/index.astro`
- Modify: `src/pages/index.astro` (replace the Task 2 temporary content)

**Interfaces:**
- Consumes: `getFeaturedProjects(locale)`, `getCaseStudySlugs`, `ProjectGrid`, `SectionHeading`, `personJsonLd`, `t`, `localizePath`. The contact section is a placeholder `<section id="contact">` that Task 9 fills with `ContactForm`.

- [ ] **Step 1: Write `src/views/HomeView.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ProjectGrid from '../components/ProjectGrid.astro';
import { t, localizePath, type Locale } from '../i18n/ui';
import { getFeaturedProjects, getCaseStudySlugs } from '../lib/sanity';
import { personJsonLd } from '../lib/seo';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const [featured, caseSlugs] = await Promise.all([getFeaturedProjects(locale), getCaseStudySlugs()]);
const services = [
  ['wp', tr('services.wp.title'), tr('services.wp.desc')],
  ['apps', tr('services.apps.title'), tr('services.apps.desc')],
  ['care', tr('services.care.title'), tr('services.care.desc')],
] as const;
const proofs = (['home.proof1', 'home.proof2', 'home.proof3'] as const).map((k) => [tr(`${k}.title`), tr(`${k}.text`)]);
---
<Base {locale} title={tr('home.metaTitle')} description={tr('home.sub')} jsonLd={personJsonLd()}>
  <section class="wrap py-20 md:py-32">
    <p class="eyebrow">{tr('home.eyebrow')}</p>
    <h1 class="mt-5 max-w-4xl text-display-xl leading-[1.02]">{tr('home.h1')}</h1>
    <p class="mt-7 max-w-2xl text-xl text-ink-mut">{tr('home.sub')}</p>
    <div class="mt-10 flex flex-wrap gap-3">
      <a href={localizePath('/work', locale)} class="btn-primary" data-cta="hero-work">{tr('home.ctaPrimary')}</a>
      <a href={localizePath('/#contact', locale)} class="btn-ghost" data-cta="hero-contact">{tr('home.ctaSecondary')}</a>
    </div>
  </section>

  <section class="wrap py-16">
    <div class="flex items-end justify-between gap-6">
      <SectionHeading title={tr('home.featuredTitle')} />
      <a href={localizePath('/work', locale)} class="text-sm text-accent underline underline-offset-4">{tr('home.featuredAll')} →</a>
    </div>
    <div class="mt-10"><ProjectGrid projects={featured} {locale} caseSlugs={caseSlugs} /></div>
  </section>

  <section class="wrap py-16">
    <SectionHeading title={tr('home.servicesTitle')} />
    <div class="mt-10 grid gap-8 md:grid-cols-3">
      {services.map(([key, title, desc]) => (
        <a href={localizePath(`/services#${key}`, locale)} class="rounded-xl border border-line bg-paper-pure p-6 transition hover:border-ink">
          <h3 class="text-xl">{title}</h3>
          <p class="mt-3 text-ink-mut">{desc}</p>
        </a>
      ))}
    </div>
  </section>

  <section class="wrap py-16">
    <SectionHeading title={tr('home.proofTitle')} />
    <dl class="mt-10 grid gap-10 md:grid-cols-3">
      {proofs.map(([title, text]) => (
        <div>
          <dt class="text-lg font-medium">{title}</dt>
          <dd class="mt-2 text-ink-mut">{text}</dd>
        </div>
      ))}
    </dl>
  </section>

  <section id="contact" class="wrap py-16 md:py-24">
    <SectionHeading title={tr('home.ctaTitle')} lead={tr('home.ctaText')} />
    <slot name="contact" />
  </section>
</Base>
```

- [ ] **Step 2: Write the three page files**

`src/pages/index.astro` (replace entirely):

```astro
---
import HomeView from '../views/HomeView.astro';
---
<HomeView locale="en" />
```

`src/pages/es/index.astro`: same with `locale="es"` and `../../views/HomeView.astro`. `src/pages/pt/index.astro`: `locale="pt"`.

- [ ] **Step 3: Build and assert**

```bash
npm run build && node -e "
const fs=require('fs');
const all=JSON.parse(fs.readFileSync('data/projects.json','utf8'));
const want=Math.min(4, all.filter(p=>p.featured&&fs.existsSync('tmp/screenshots/'+p.slug+'.png')).length);
for(const [f,h1] of [['dist/index.html','I build the site that replaces your WordPress.'],['dist/es/index.html','Construyo el sitio que reemplaza tu WordPress.'],['dist/pt/index.html','Eu construo o site que substitui o seu WordPress.']]){
  const s=fs.readFileSync(f,'utf8');
  if(!s.includes(h1)){console.error(f,'h1 missing');process.exit(1)}
  const n=(s.match(/data-kind=/g)||[]).length; if(n!==want){console.error(f,'expected',want,'featured, got',n);process.exit(1)}
  if(!s.includes('\"@type\":\"Person\"')){console.error(f,'Person JSON-LD missing');process.exit(1)}
}
console.log('home OK —',want,'featured')"
```

Expected: `home OK — 2 featured` today (`4` once Avgust and Klicana are seeded).

- [ ] **Step 4: Commit**

```bash
git add src/views/HomeView.astro src/pages/index.astro src/pages/es/index.astro src/pages/pt/index.astro
git commit -m "feat(home): hero, featured work, services, proof and contact anchor in en/es/pt"
```

---

### Task 7: Services and About (three locales)

**Files:**
- Create: `src/views/ServicesView.astro`, `src/views/AboutView.astro`, `src/pages/services.astro`, `src/pages/about.astro`, `src/pages/es/services.astro`, `src/pages/es/about.astro`, `src/pages/pt/services.astro`, `src/pages/pt/about.astro`

- [ ] **Step 1: Write `src/views/ServicesView.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import { t, localizePath, type Locale } from '../i18n/ui';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const blocks = [
  { id: 'wp', title: tr('services.wp.title'), desc: tr('services.wp.desc'), bullets: [tr('services.wp.b1'), tr('services.wp.b2'), tr('services.wp.b3')] },
  { id: 'apps', title: tr('services.apps.title'), desc: tr('services.apps.desc'), bullets: [tr('services.apps.b1'), tr('services.apps.b2'), tr('services.apps.b3')] },
  { id: 'care', title: tr('services.care.title'), desc: tr('services.care.desc'), bullets: [] },
];
---
<Base {locale} title={`${tr('services.title')} — Jose Uribe`} description={tr('services.lead')}>
  <section class="wrap py-16 md:py-24">
    <SectionHeading as="h1" title={tr('services.title')} lead={tr('services.lead')} />
    <div class="mt-14 grid gap-14">
      {blocks.map((b, i) => (
        <section id={b.id} class="grid gap-6 border-t border-line pt-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p class="eyebrow">0{i + 1}</p>
            <h2 class="mt-2 text-display-md">{b.title}</h2>
          </div>
          <div>
            <p class="text-lg text-ink-2">{b.desc}</p>
            {b.bullets.length > 0 && (
              <ul class="mt-6 grid gap-3 text-ink-mut">
                {b.bullets.map((x) => <li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span><span>{x}</span></li>)}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
    <p class="mt-16"><a href={localizePath('/#contact', locale)} class="btn-primary" data-cta="services-contact">{tr('services.cta')}</a></p>
  </section>
</Base>
```

- [ ] **Step 2: Write `src/views/AboutView.astro`** (photo renders only if the file exists)

```astro
---
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import { t, type Locale } from '../i18n/ui';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
// process.cwd() is the project root during `astro build`; import.meta.url would point at the compiled chunk.
const hasPhoto = existsSync(join(process.cwd(), 'public/images/jose.jpg'));
const facts = [tr('about.fact.location'), tr('about.fact.timezone'), tr('about.fact.languages'), tr('about.fact.upwork')];
---
<Base {locale} title={`${tr('about.title')} — Jose Uribe`} description={tr('about.p1')}>
  <section class="wrap grid gap-12 py-16 md:grid-cols-[2fr_1fr] md:py-24">
    <div>
      <SectionHeading as="h1" title={tr('about.title')} />
      <div class="prose-site mt-8">
        <p>{tr('about.p1')}</p>
        <p>{tr('about.p2')}</p>
        <p>{tr('about.p3')}</p>
      </div>
    </div>
    <aside>
      {hasPhoto && <img src="/images/jose.jpg" alt="Jose Uribe" width="800" height="1000" loading="eager" decoding="async" class="aspect-[4/5] w-full rounded-xl object-cover" />}
      <ul class="mt-6 grid gap-2 text-sm text-ink-mut">
        {facts.map((f) => <li class="border-t border-line pt-2">{f}</li>)}
      </ul>
    </aside>
  </section>
</Base>
```

- [ ] **Step 3: Write the six page files**

`src/pages/services.astro`: `import ServicesView from '../views/ServicesView.astro';` → `<ServicesView locale="en" />`. `src/pages/about.astro` likewise with `AboutView`. ES/PT versions under `src/pages/es/` and `src/pages/pt/` with `../../views/...` and their locale.

- [ ] **Step 4: Build and assert**

```bash
npm run build && node -e "
const fs=require('fs');
const s=fs.readFileSync('dist/services/index.html','utf8');
for(const id of ['id=\"wp\"','id=\"apps\"','id=\"care\"']) if(!s.includes(id)){console.error('missing',id);process.exit(1)}
const a=fs.readFileSync('dist/pt/about/index.html','utf8'); if(!a.includes('Sou Jose Uribe')){console.error('PT about missing');process.exit(1)}
console.log('services/about OK')"
```

Expected: `services/about OK`

- [ ] **Step 5: Commit**

```bash
git add src/views/ServicesView.astro src/views/AboutView.astro src/pages/services.astro src/pages/about.astro src/pages/es/services.astro src/pages/es/about.astro src/pages/pt/services.astro src/pages/pt/about.astro
git commit -m "feat(pages): services and about in en/es/pt"
```

---

### Task 8: Blog (three locales, empty state, translations via hreflang)

**Files:**
- Create: `src/components/PostCard.astro`, `src/views/BlogIndexView.astro`, `src/views/BlogPostView.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/es/blog/index.astro`, `src/pages/es/blog/[slug].astro`, `src/pages/pt/blog/index.astro`, `src/pages/pt/blog/[slug].astro`

**Interfaces:**
- Consumes: `getPosts`, `getPostBySlug`, `urlFor`, `renderPortableText`, `articleJsonLd`, `Post`, `otherTranslations`.

- [ ] **Step 1: Write `PostCard.astro`**

```astro
---
import { t, localizePath, type Locale } from '../i18n/ui';
import type { Post } from '../lib/content';
interface Props { post: Post; locale: Locale }
const { post, locale } = Astro.props;
const tr = t(locale);
const date = new Date(post.publishedAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale, { year: 'numeric', month: 'long', day: 'numeric' });
---
<article class="border-t border-line py-8">
  <p class="eyebrow">{date}</p>
  <h2 class="mt-2 text-2xl"><a href={localizePath(`/blog/${post.slug}`, locale)} class="hover:text-accent">{post.title}</a></h2>
  <p class="mt-3 max-w-2xl text-ink-mut">{post.excerpt}</p>
  <a href={localizePath(`/blog/${post.slug}`, locale)} class="mt-4 inline-block text-sm text-accent underline underline-offset-4">{tr('blog.readMore')} →</a>
</article>
```

- [ ] **Step 2: Write `BlogIndexView.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import PostCard from '../components/PostCard.astro';
import { t, type Locale } from '../i18n/ui';
import { getPosts } from '../lib/sanity';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const posts = await getPosts(locale);
---
<Base {locale} title={`${tr('blog.title')} — Jose Uribe`} description={tr('blog.lead')}>
  <section class="wrap py-16 md:py-24">
    <SectionHeading as="h1" title={tr('blog.title')} lead={tr('blog.lead')} />
    <div class="mt-12 max-w-3xl">
      {posts.length === 0 ? <p class="text-ink-mut" data-empty>{tr('blog.empty')}</p> : posts.map((post) => <PostCard {post} {locale} />)}
    </div>
  </section>
</Base>
```

- [ ] **Step 3: Write `BlogPostView.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { t, localizePath, LANG_NAMES, type Locale } from '../i18n/ui';
import { otherTranslations, type Post } from '../lib/content';
import { urlFor } from '../lib/sanity';
import { renderPortableText } from '../lib/portable-text';
import { articleJsonLd } from '../lib/seo';
interface Props { locale: Locale; post: Post }
const { locale, post } = Astro.props;
const tr = t(locale);
const html = await renderPortableText(post.body, { imageUrl: (b) => urlFor(b as any).width(1400).url() });
const others = otherTranslations(post, locale);
const alternates: Partial<Record<Locale, string>> = { [locale]: localizePath(`/blog/${post.slug}`, locale) };
for (const o of others) alternates[o.language] = localizePath(`/blog/${o.slug}`, o.language);
const date = new Date(post.publishedAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale, { year: 'numeric', month: 'long', day: 'numeric' });
const og = post.cover ? urlFor(post.cover).width(1200).height(630).fit('crop').url() : undefined;
---
<Base {locale} title={`${post.title} — Jose Uribe`} description={post.excerpt} {alternates} ogImage={og} jsonLd={articleJsonLd(post, locale)}>
  <article class="wrap max-w-3xl py-16 md:py-24">
    <a href={localizePath('/blog', locale)} class="text-sm text-ink-mut hover:text-ink">← {tr('blog.back')}</a>
    <p class="eyebrow mt-8">{date}</p>
    <h1 class="mt-3 text-display-lg">{post.title}</h1>
    <p class="mt-4 text-xl text-ink-mut">{post.excerpt}</p>
    {others.length > 0 && (
      <p class="mt-4 text-sm text-ink-soft">{tr('blog.alsoIn')} {others.map((o, i) => <><a href={alternates[o.language]} hreflang={o.language} class="underline">{LANG_NAMES[o.language]}</a>{i < others.length - 1 ? ', ' : ''}</>)}</p>
    )}
    {post.cover && <img src={urlFor(post.cover).width(1400).height(788).fit('crop').url()} alt="" width="1400" height="788" loading="eager" decoding="async" class="mt-10 w-full rounded-xl" />}
    <div class="prose-site mt-10" set:html={html} />
  </article>
</Base>
```

> Note on hreflang: `Base` only emits alternates it is given plus computed defaults. For a post that has no translation in a locale, the computed default would point to a non-existent URL. To prevent that, the post view passes explicit `alternates` **and** `Base` must skip locales that are not in `alternates` when `alternates` is provided. Modify `Base.astro`: replace the two `hreflang` lines with

```astro
{(alternates ? (Object.keys(alternates) as Locale[]) : LOCALES).map((l) => <link rel="alternate" hreflang={l === 'pt' ? 'pt-BR' : l} href={altHref(l)} />)}
{(!alternates || alternates.en) && <link rel="alternate" hreflang="x-default" href={altHref(DEFAULT_LOCALE)} />}
```

- [ ] **Step 4: Write the six page files**

`src/pages/blog/index.astro`: `<BlogIndexView locale="en" />` (import from `../../views/BlogIndexView.astro`). ES/PT under their folders with `../../../views/...`.

`src/pages/blog/[slug].astro`:

```astro
---
import BlogPostView from '../../views/BlogPostView.astro';
import { getPosts } from '../../lib/sanity';
export async function getStaticPaths() {
  const posts = await getPosts('en');
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}
const { post } = Astro.props;
---
<BlogPostView locale="en" {post} />
```

ES/PT: same with `getPosts('es')` / `getPosts('pt')`, `locale="es"` / `"pt"`, and `../../../` imports.

- [ ] **Step 5: Build with zero posts and assert the empty state**

```bash
npm run build && node -e "
const fs=require('fs');
for(const f of ['dist/blog/index.html','dist/es/blog/index.html','dist/pt/blog/index.html']){ const s=fs.readFileSync(f,'utf8'); if(!s.includes('data-empty')){console.error(f,'empty state missing');process.exit(1)} }
console.log('blog empty OK')"
```

Expected: `blog empty OK`

- [ ] **Step 6: Manual acceptance — publish a real post**

In `../studio-personal-site` run `npm run dev` → http://localhost:3333 → *Posts · English* → **New post (en)** (the language is pre-set by the template): title "Why I stopped selling WordPress maintenance", slug auto, excerpt one sentence, body two paragraphs plus one code block (`language: bash`, `code: npm create astro@latest`), publishedAt now. **Publish.** Optionally use the *Translations* menu in the document header to create the ES version and publish it too. Then:

Run: `npm run build && ls dist/blog/ && grep -c "shiki" dist/blog/why-i-stopped-selling-wordpress-maintenance/index.html`
Expected: the slug folder exists and the count is ≥ 1 (highlighted code block rendered).

- [ ] **Step 7: Commit**

```bash
git add src/components/PostCard.astro src/views/Blog*.astro src/pages/blog src/pages/es/blog src/pages/pt/blog src/layouts/Base.astro
git commit -m "feat(blog): index and post pages per language with translations, empty state and code highlighting"
```

---

### Task 9: Contact form, analytics events, Cal.com

**Files:**
- Create: `src/lib/analytics.ts`, `src/lib/analytics.test.ts`, `src/components/ContactForm.astro`, `src/scripts/events.ts`
- Modify: `src/views/HomeView.astro` (render `ContactForm` in the `#contact` section), `src/layouts/Base.astro` (load `events.ts`)

**Interfaces:**
- Produces: `track(name: string, params?: Record<string, string | number | boolean>): void`. Events: `contact_submit`, `cta_click {location}`, `project_outbound {project}`, `book_call`.

- [ ] **Step 1: Failing tests for `analytics.ts`**

`src/lib/analytics.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { track } from './analytics';

afterEach(() => { delete (globalThis as any).gtag; });

describe('track', () => {
  it('is a no-op when gtag is not present', () => {
    expect(() => track('contact_submit')).not.toThrow();
  });
  it('forwards to gtag when present', () => {
    const g = vi.fn();
    (globalThis as any).gtag = g;
    track('cta_click', { location: 'hero' });
    expect(g).toHaveBeenCalledWith('event', 'cta_click', { location: 'hero' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` — Expected: FAIL, `Cannot find module './analytics'`

- [ ] **Step 3: Write `src/lib/analytics.ts`**

```ts
type Params = Record<string, string | number | boolean>;

export function track(name: string, params: Params = {}): void {
  const g = (globalThis as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof g === 'function') g('event', name, params);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` — Expected: PASS

- [ ] **Step 5: Write `src/scripts/events.ts`** (delegated listeners for CTA and outbound clicks)

```ts
import { track } from '../lib/analytics';

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cta],[data-outbound],[data-book]');
  if (!el) return;
  if (el.dataset.cta) track('cta_click', { location: el.dataset.cta });
  if (el.dataset.outbound) track('project_outbound', { project: el.dataset.outbound });
  if (el.dataset.book !== undefined) track('book_call');
});
```

In `Base.astro`, before `</body>` add:

```astro
<script>
  import '../scripts/events.ts';
</script>
```

- [ ] **Step 6: Write `ContactForm.astro`** (works without JS via Web3Forms redirect; with JS submits inline and tracks)

```astro
---
import { t, localizePath, type Locale } from '../i18n/ui';
import { site } from '../config/site';
interface Props { locale: Locale }
const { locale } = Astro.props;
const tr = t(locale);
const redirect = new URL(localizePath('/?sent=1#contact', locale), site.url).href;
---
<form action="https://api.web3forms.com/submit" method="POST" class="mt-10 grid max-w-xl gap-5" data-contact>
  <input type="hidden" name="access_key" value={site.web3formsKey} />
  <input type="hidden" name="subject" value="joseuribe.dev — new message" />
  <input type="hidden" name="from_name" value="joseuribe.dev" />
  <input type="hidden" name="redirect" value={redirect} />
  <input type="checkbox" name="botcheck" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
  <label class="grid gap-1 text-sm">
    <span>{tr('contact.name')}</span>
    <input name="name" required autocomplete="name" class="rounded-lg border border-line bg-paper-pure px-3 py-2.5" />
  </label>
  <label class="grid gap-1 text-sm">
    <span>{tr('contact.email')}</span>
    <input name="email" type="email" required autocomplete="email" class="rounded-lg border border-line bg-paper-pure px-3 py-2.5" />
  </label>
  <label class="grid gap-1 text-sm">
    <span>{tr('contact.message')}</span>
    <textarea name="message" required rows="5" class="rounded-lg border border-line bg-paper-pure px-3 py-2.5"></textarea>
  </label>
  <div class="flex flex-wrap items-center gap-4">
    <button type="submit" class="btn-primary" data-submit>{tr('contact.send')}</button>
    {site.calUrl && <a href={site.calUrl} target="_blank" rel="noopener" class="text-sm text-accent underline underline-offset-4" data-book>{tr('contact.book')} ↗</a>}
  </div>
  <p class="hidden text-sm" data-status role="status" aria-live="polite"></p>
</form>

<script define:vars={{ ok: tr('contact.success'), err: tr('contact.error'), sending: tr('contact.sending'), send: tr('contact.send'), email: site.email }}>
  const form = document.querySelector('[data-contact]');
  const status = form.querySelector('[data-status]');
  const btn = form.querySelector('[data-submit]');
  if (new URLSearchParams(location.search).get('sent') === '1') { status.textContent = ok; status.classList.remove('hidden'); }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = sending;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = ok;
      window.gtag?.('event', 'contact_submit');
    } catch {
      status.innerHTML = `${err} <a class="underline" href="mailto:${email}">${email}</a>`;
    } finally {
      status.classList.remove('hidden');
      btn.disabled = false; btn.textContent = send;
    }
  });
</script>
```

- [ ] **Step 7: Mount it in `HomeView.astro`**

Replace `<slot name="contact" />` with:

```astro
<ContactForm {locale} />
```

and add `import ContactForm from '../components/ContactForm.astro';` to the view's frontmatter.

- [ ] **Step 8: Build and assert**

```bash
npm run build && node -e "
const fs=require('fs');const s=fs.readFileSync('dist/index.html','utf8');
for(const x of ['api.web3forms.com/submit','name=\"botcheck\"','name=\"access_key\"','data-cta=\"hero-work\"']) if(!s.includes(x)){console.error('missing',x);process.exit(1)}
console.log('contact OK')"
```

Expected: `contact OK`. Then with `npm run dev`, submit the form once with a real `PUBLIC_WEB3FORMS_KEY` and confirm the email arrives.

- [ ] **Step 9: Commit**

```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts src/scripts src/components/ContactForm.astro src/views/HomeView.astro src/layouts/Base.astro
git commit -m "feat(contact): Web3Forms contact form, GA4 event tracking, Cal.com link"
```

---

### Task 10: SEO/ops — robots, security headers, OG image, Lighthouse gate, webhook, Studio deploy

**Files:**
- Create: `public/robots.txt`, `vercel.json`, `scripts/make-og.mjs`, `public/og-default.png` (generated)
- Modify: `README.md` (ops section)

- [ ] **Step 1: `robots.txt` and `vercel.json`**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://joseuribe.dev/sitemap-index.xml
```

`vercel.json`:

```json
{
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
    ] }
  ]
}
```

- [ ] **Step 2: Generate the default OG image with sharp** (already a dependency of Astro)

`scripts/make-og.mjs`:

```js
// Run: node scripts/make-og.mjs → public/og-default.png (1200×630)
import sharp from 'sharp';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f5f1e8"/>
  <rect x="0" y="0" width="14" height="630" fill="#b5482a"/>
  <text x="90" y="250" font-family="Georgia, serif" font-size="72" fill="#1b1713">Jose Uribe</text>
  <text x="90" y="330" font-family="Georgia, serif" font-size="44" fill="#5f574c">I build the site that replaces</text>
  <text x="90" y="386" font-family="Georgia, serif" font-size="44" fill="#5f574c">your WordPress.</text>
  <text x="90" y="540" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#8c8476" letter-spacing="4">JOSEURIBE.DEV · CALI, COLOMBIA · US EASTERN HOURS</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('public/og-default.png written');
```

Run: `node scripts/make-og.mjs && file public/og-default.png`
Expected: `PNG image data, 1200 x 630`.

- [ ] **Step 3: Lighthouse gate (mobile performance ≥ 95)**

```bash
mkdir -p tmp && npm run build && (npx astro preview --port 4321 & echo $! > tmp/preview.pid) && sleep 3
export CHROME_PATH=$(node -e "console.log(require('playwright').chromium.executablePath())")
for p in / /work/armony; do
  npx lighthouse "http://localhost:4321$p" --only-categories=performance --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --chrome-flags="--headless=new" --quiet --output=json --output-path=tmp/lh$(echo $p | tr / _).json
  node -e "const r=require('./tmp/lh$(echo $p | tr / _).json');const s=Math.round(r.categories.performance.score*100);console.log('$p →',s);if(s<95)process.exit(1)"
done
kill $(cat tmp/preview.pid)
```

Expected: both lines print a score ≥ 95. If below: the usual culprits are un-sized images (check every `<img>` has `width`/`height`), font loading (confirm `@fontsource-variable` files are `woff2` and only two families load), and third-party scripts loading eagerly (GA4 must stay `async`; nothing from Sanity ships to the browser).

- [ ] **Step 4: Webhook — content publish rebuilds the site (Jose, in two dashboards)**

Document in `README.md` under **Despliegue**, replacing the "Pendiente" sentence:

```markdown
### Rebuild al publicar

1. Vercel → Project → Settings → Git → **Deploy Hooks** → Create Hook (`sanity-publish`, branch `main`). Copy the URL.
2. Sanity → https://sanity.io/manage → project → API → **Webhooks** → Create:
   - URL: the Deploy Hook URL
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - Filter: `_type in ["project", "post"]`
   - HTTP method: POST
3. Publish any document in the Studio and confirm a new deployment appears in Vercel within a minute.

### Avisos de build conocidos

`npm run build` imprime dos avisos sobre prioridad de rutas (`/es` vs `/es/`, `/pt` vs `/pt/`). Son un caso límite benigno de Astro con `i18n.fallback` + `prefixDefaultLocale: false` en la ruta raíz: la página real gana sobre el fallback y la salida es correcta. No configurar `prerenderConflictBehavior: 'ignore'` — silenciaría colisiones reales.
```

- [ ] **Step 5: Final smoke on production**

After Vercel deploys `main`:

```bash
for p in / /es/ /pt/ /work /work/armony /services /about /blog /robots.txt /sitemap-index.xml /og-default.png; do
  printf "%-22s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://joseuribe.dev$p)"
done
curl -s -o /dev/null -w 'studio %{http_code}\n' https://joseuribe.sanity.studio/
```

Expected: all `200`. Open `https://joseuribe.sanity.studio`, log in, and confirm the Studio loads with the 12 projects. (If the Studio is not deployed yet: `cd ../studio-personal-site && npm run deploy` after `npx sanity login`.)

- [ ] **Step 6: Commit**

```bash
git add public/robots.txt public/og-default.png vercel.json scripts/make-og.mjs README.md
git commit -m "chore(ops): robots, security headers, OG image, Lighthouse gate, publish webhook docs"
git push
```

---

## Acceptance checklist (from the spec §9)

- [ ] Every project with a screenshot is published (8 today, 12 once the Upwork PNGs are seeded); case-study pages for those with an English case study; Zohara without a link — Task 5 assertion.
- [ ] A post published in the Studio appears after rebuild without touching code — Task 8 Step 6 + Task 10 Step 4.
- [ ] Home, work, services, about, blog in EN and ES; PT fixed pages — Tasks 5–8 build all three locales.
- [ ] Contact form delivers email and fires `contact_submit` — Task 9 Step 8 (manual send) + GA4 DebugView.
- [ ] Lighthouse mobile ≥ 95 on `/` and a case page — Task 10 Step 3.
- [ ] Valid `hreflang` on all three versions — Task 2 Step 9 assertion; blog alternates in Task 8.
- [ ] The standalone Studio is deployed at joseuribe.sanity.studio and logs in — Task 10 Step 5.

## Deliberately not in this plan

SSR/adapters, custom MCP, migration from overnatic.us, newsletter, comments, search, dark mode, the Overnatic sector demos, embedding the Studio in the app. See spec §10.
