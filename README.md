# joseuribe.dev

Sitio personal de Jose Uribe: portafolio, servicios y blog. Astro 7 estático + Sanity como CMS. Es, además, la primera instancia del producto que vende: un sitio rápido con un CMS que el cliente edita sin miedo.

## Documentos de diseño

- [Plan de marca](docs/superpowers/specs/2026-09-06-marca-personal-joseuribe-design.md) — posicionamiento, audiencia, oferta, distribución
- [Diseño técnico del sitio](docs/superpowers/specs/2026-09-06-sitio-joseuribe-dev-design.md) — stack, rutas, modelo de contenido, criterios de aceptación

## Stack

Astro 7 (`output: 'static'`) · Tailwind CSS 4 · Sanity (Studio standalone en el repo hermano `../studio-personal-site`, hospedado en https://joseuribe.sanity.studio) · i18n nativo `en` (raíz) / `es` / `pt` · `@astrojs/sitemap` · Vercel Analytics + GA4

## Puesta en marcha

```sh
npm install
cp .env.example .env   # y completar los valores
npm run dev            # http://localhost:4321  ·  Studio: cd ../studio-personal-site && npm run dev → http://localhost:3333
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

Dos tipos en Sanity (definidos en `../studio-personal-site/schemaTypes/`):

- **`project`** — un documento por proyecto; `summary` y `caseStudy` son arrays internacionalizados (plugin `sanity-plugin-internationalized-array`, una entrada por idioma). Regla: sin `screenshot` no se publica.
- **`post`** — un documento **por idioma**; las traducciones se enlazan con el plugin `@sanity/document-internationalization` (documentos `translation.metadata`), que el sitio usa para `hreflang`.

Los textos de interfaz (menú, botones, copy de páginas fijas) viven en código, en `src/i18n/`.

## Despliegue

Vercel conectado a `main`. El dominio `joseuribe.dev` ya está configurado.

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
