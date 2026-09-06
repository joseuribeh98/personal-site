# joseuribe.dev — Seguimientos después del primer lanzamiento

Backlog surgido de las revisiones por tarea y de la revisión final de la rama `feat/site-v1` (2026-09-06). Nada de esto bloquea la fusión; están ordenados por valor.

## Acciones del dueño (antes o justo después de fusionar a `main`)

1. Vercel → Environment Variables (Preview + Production): `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_GA4_ID`, `PUBLIC_WEB3FORMS_KEY`, opcional `PUBLIC_CAL_URL`. No hace falta ningún token en Vercel.
2. Deploy Hook en Vercel + webhook en Sanity (README → "Rebuild al publicar").
3. Crear el buzón `hello@joseuribe.dev` (footer, JSON-LD y error del formulario lo usan) y configurar el destinatario en Web3Forms.
4. Las 4 capturas de Upwork en `tmp/screenshots/` (`klicana`, `miami-trading-lab`, `avgust`, `zohara`) y `node --env-file=.env scripts/seed-projects.mjs`.
5. `public/images/jose.jpg` (4:5, ≥1200 px). El spec §6 pedía foto también en la home — decisión pendiente.
6. Confirmar los handles de Upwork/GitHub/LinkedIn en `src/config/site.ts`.
7. Cuando se apague overnatic.us, pasar el proyecto Overnatic a `status: offline` en el Studio.
8. Correr la prueba de humo de producción (plan, Tarea 10, paso 5) tras el primer deploy a `main`.

## Código — pequeños, cuando se toque el archivo

- `Base.astro`: neutralizar `</script>` en el JSON-LD (`JSON.stringify(...).replace(/</g,'\\u003c')`); `og:type` = `article` en posts; `articleJsonLd` con `image` cuando hay portada; omitir canonical/alternates cuando `noindex`.
- `Header.astro`: `data-cta="nav-contact"` en el botón Contact (hoy el CTA más visible no se mide).
- `vercel.json`: añadir `X-Frame-Options: DENY`.
- `global.css`: borrar `.btn` (sin uso); revisar `'opsz' 144, 'SOFT' 50` — la build por defecto de `@fontsource-variable/fraunces` no trae esos ejes (importar `full.css` y re-medir Lighthouse, o quitar la línea); `motion-safe:`/`prefers-reduced-motion` para el scroll suave y el zoom de las tarjetas; estilizar `summary:focus-visible` con el acento.
- `ProjectCard.astro`: etiqueta singular para el eyebrow (hoy reutiliza "Web apps" en plural).
- `content.ts` / `sanity.ts`: borrar `getPostBySlug`/`POST_BY_SLUG_QUERY` (sin uso; además no filtra `publishedAt <= now()`); estrechar el tipo de `otherTranslations` a `slug: string`; memo de `getCaseStudySlugs()` si el build crece.
- `WorkDetailView` / `BlogPostView`: quitar el `as any` en `urlFor(b as any)` exportando `ImageBlock`.
- `seed-projects.mjs`: `url: undefined` no des-setea una URL borrada del JSON (usar `unset(['url'])`); el seed sobrescribe ediciones hechas en el Studio — es fuente de verdad solo hasta que lleguen las capturas de Upwork; comentar que `year` es aproximado.
- `capture-screenshots.mjs`: fallback a `waitUntil: 'load'` tras timeout de `networkidle` para todos los slugs.
- `make-og.mjs`: comentar que depende de fuentes del sistema (no meterlo en el build de Vercel).
- Textos: "Jose Uribe" como `site.name` en Header/Footer; sufijo `— Jose Uribe` de los títulos centralizado en `Base`.

## Documentación

- README: tabla de variables completa (`PUBLIC_CAL_URL`, `SANITY_API_TOKEN`), flujo capturas → seed, y que `publishedAt` futuro solo aparece en el siguiente deploy (no hay rebuild programado).
- Avisos de build `/es` vs `/es/`: ya documentados como benignos.

## Proceso

- Convertir las aserciones de build del plan en `scripts/assert-build.mjs` + `npm run verify` (test + check + build + assert) y un GitHub Action que lo corra en PRs.
- Extraer la lógica de alternates/selector de idioma a `src/i18n/alternates.ts` con tests para los tres casos — el único bug funcional de la revisión final vivía justo ahí.
- Snapshot test opcional del formato de fecha (`toLocaleDateString`) para fijar la dependencia del ICU.
