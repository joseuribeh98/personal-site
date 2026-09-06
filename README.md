# joseuribe.dev

Sitio personal de Jose Uribe: portafolio, servicios y blog. Astro 7 estático + Sanity como CMS. Es, además, la primera instancia del producto que vende: un sitio rápido con un CMS que el cliente edita sin miedo.

## Documentos de diseño

- [Plan de marca](docs/superpowers/specs/2026-09-06-marca-personal-joseuribe-design.md) — posicionamiento, audiencia, oferta, distribución
- [Diseño técnico del sitio](docs/superpowers/specs/2026-09-06-sitio-joseuribe-dev-design.md) — stack, rutas, modelo de contenido, criterios de aceptación

## Stack

Astro 7 (`output: 'static'`) · Tailwind CSS 4 · Sanity (Studio embebido en `/admin`) · i18n nativo `en` (raíz) / `es` / `pt` · `@astrojs/sitemap` · Vercel Analytics + GA4

## Puesta en marcha

```sh
npm install
cp .env.example .env   # y completar los valores
npm run dev            # http://localhost:4321  ·  Studio en /admin
npm run build
```

## Variables de entorno

| Variable | Dónde se obtiene |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | https://sanity.io/manage → crear proyecto |
| `PUBLIC_SANITY_DATASET` | `production` |
| `PUBLIC_GA4_ID` | Google Analytics → propiedad nueva |
| `PUBLIC_WEB3FORMS_KEY` | https://web3forms.com |

Las mismas variables van en Vercel → Project → Settings → Environment Variables.

## Contenido

Dos tipos en Sanity (`sanity/schema/`):

- **`project`** — un documento por proyecto; `summary` y `caseStudy` localizados a nivel de campo (`en`/`es`/`pt`). Regla: sin `screenshot` no se publica.
- **`post`** — un documento **por idioma**; `translationOf` enlaza las versiones para `hreflang`.

Los textos de interfaz (menú, botones, copy de páginas fijas) viven en código, en `src/i18n/`.

## Despliegue

Vercel conectado a `main`. El dominio `joseuribe.dev` ya está configurado. Pendiente: webhook de Sanity (on publish) → Deploy Hook de Vercel, para que publicar en el CMS reconstruya el sitio.
