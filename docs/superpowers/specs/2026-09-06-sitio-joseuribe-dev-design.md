# joseuribe.dev — Diseño técnico del sitio

**Fecha:** 2026-09-06
**Estado:** diseño para implementación
**Depende de:** `2026-09-06-marca-personal-joseuribe-design.md` (posicionamiento, contenido, distribución)
**Repo:** `/Users/jose/Dev/joseuribe-dev` → https://github.com/joseuribeh98/personal-site · Dominio `joseuribe.dev` ya comprado y configurado en Vercel

---

## 1. Qué se construye

El sitio personal de Jose Uribe: portafolio de 12 proyectos, blog autogestionable en tres idiomas, y páginas de servicios y contacto orientadas al mercado angloparlante.

**El sitio es la primera instancia del producto que vende:** un sitio en Astro, 100% estático, con Sanity como CMS. Todo lo que se decida aquí debe poder repetirse para un cliente.

---

## 2. Stack (decidido)

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Astro 7** (7.3.1 al 2026-09-06), `output: 'static'` | Lo que vende. Instalado con `npm create astro@latest --template minimal` |
| Estilos | **Tailwind CSS v4** (`npx astro add tailwind`) | Lo que usa en proyectos de clientes; velocidad de iteración |
| CMS | **Sanity** (`@sanity/astro` + `@astrojs/react`) | Comparativa del 2026-09-06 — ver spec de marca §2. Studio embebido en `/admin` con hash-router para mantener el sitio estático |
| i18n | **Astro i18n nativo**: `defaultLocale: 'en'`, `locales: ['en','es','pt']`, `prefixDefaultLocale: false` | EN sin prefijo en raíz; `/es/…` y `/pt/…` |
| Imágenes | `astro:assets` para lo estático; **Sanity assets** (CDN, hotspot/crop) para capturas de proyectos y portadas de posts | El editor puede cambiarlas sin tocar código |
| Sitemap | `@astrojs/sitemap` con i18n | hreflang correcto |
| Analytics | `@vercel/analytics` (páginas) + **GA4** vía gtag (eventos) | Vercel no permite eventos en el plan actual |
| Contacto | Formulario → **Web3Forms** (sin backend, 250 envíos/mes gratis) + enlace a **Cal.com** para agendar llamada | El mercado de EE.UU. no usa WhatsApp; agendar llamada es el estándar |
| Hosting | **Vercel**, dominio `joseuribe.dev` | Continuidad con lo que ya opera |
| Rebuild | **Webhook de Sanity → Deploy Hook de Vercel** al publicar | El sitio es estático; publicar en el CMS dispara build |

**Sin adaptador SSR.** Nada en el sitio necesita servidor. Si algún día hace falta, se añade `@astrojs/vercel`.

---

## 3. Rutas

```
/                    Home (EN)
/work                Los 12 proyectos, filtrables por tipo
/work/[slug]         Ficha completa — solo proyectos con caseStudy (Armony, Avgust, Klicana, Enlace)
/services            Reemplazo de WordPress · Apps a medida · Mantenimiento (al final)
/about               Quién es, dónde está, cómo trabaja
/blog                Life after WordPress
/blog/[slug]         Post
/es/…  /pt/…         Espejo de todo lo anterior
/admin               Sanity Studio (estático, hash-router, noindex)
/404
```

Los proyectos **sin** `caseStudy` no tienen página propia: su tarjeta enlaza al sitio vivo (o a nada, si `status != live`).

**Orden de idiomas:** EN es el original y se escribe primero. ES completo al lanzar. PT puede lanzarse con las páginas fijas traducidas y el blog parcial — Astro i18n con `fallbackType: 'redirect'` cubre lo que falte sin romper.

---

## 4. Modelo de contenido (Sanity)

Dos tipos. Nada más hasta que haga falta.

### `project`

| Campo | Tipo | Nota |
|---|---|---|
| `title` | string | |
| `slug` | slug | |
| `kind` | `app` \| `site` \| `wordpress` | Filtro de `/work` |
| `client` | string | |
| `role` | string | "Full Stack Developer", "Developer"… |
| `year` | number | |
| `stack` | array<string> | |
| `url` | url, opcional | Vacío si no hay sitio vivo |
| `status` | `live` \| `offline` \| `parked` | `parked` = Zohara. Solo `live` muestra "ver sitio" |
| `screenshot` | image (hotspot) | Obligatoria — regla: no se publica sin captura |
| `featured` | boolean | Los 4 de la home |
| `order` | number | Orden manual |
| `summary` | object `{en, es, pt}` de text | Localización a nivel de campo: el proyecto es uno, el texto cambia |
| `caseStudy` | object `{en, es, pt}` de portable text, opcional | Solo los 4 con ficha |

### `post`

| Campo | Tipo | Nota |
|---|---|---|
| `title` | string | |
| `slug` | slug | |
| `language` | `en` \| `es` \| `pt` | **Localización a nivel de documento**: un post puede existir en un idioma y no en otro |
| `excerpt` | text | |
| `body` | portable text | Con bloques de código e imágenes |
| `cover` | image, opcional | |
| `publishedAt` | datetime | |
| `translationOf` | reference → post, opcional | Para enlazar versiones y emitir hreflang |

**Por qué dos estrategias de i18n distintas:** los proyectos son la misma entidad en tres idiomas (campo localizado). Los posts pueden no traducirse todos (documento por idioma). Mezclarlas es deliberado.

**Textos de interfaz** (menú, botones, títulos de sección, copy de home/servicios/about): **en código**, en `src/i18n/ui.ts`. No van al CMS — cambian con el diseño, no con el contenido.

---

## 5. Estructura del proyecto

```
joseuribe-dev/
├── astro.config.mjs
├── sanity.config.ts            # Studio: schema + plugins
├── sanity/
│   └── schema/
│       ├── project.ts
│       └── post.ts
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── work/{index,[slug]}.astro
│   │   ├── services.astro
│   │   ├── about.astro
│   │   ├── blog/{index,[slug]}.astro
│   │   ├── es/…  pt/…          # espejos que reutilizan los mismos componentes
│   │   ├── admin/[...].astro   # Studio embebido
│   │   └── 404.astro
│   ├── components/
│   ├── layouts/Base.astro
│   ├── i18n/ui.ts              # strings de interfaz por idioma
│   ├── lib/sanity.ts           # cliente + queries GROQ tipadas
│   └── styles/global.css       # tokens de diseño + Tailwind
├── public/
└── docs/superpowers/specs/     # copia de los dos specs
```

---

## 6. Diseño visual — dirección, no ejecución

Se ejecuta en implementación con la skill `frontend-design`. Lo que este spec fija:

- **Los proyectos son el protagonista.** Capturas grandes, con marco de navegador o sin él, pero grandes. El sitio de Overnatic no mostraba ni una y ese era su mayor defecto.
- **Cálido y editorial, no SaaS azul.** Un acento, usado con intención. Tipografía con carácter para títulos, legible para cuerpo.
- **Primera persona.** El diseño acompaña una voz individual: una foto real de Jose en home y about, no ilustraciones abstractas.
- **Rápido de verdad.** Lighthouse 95+ en móvil es requisito, no aspiración — es el argumento de venta contra WordPress y debe poder demostrarse en la propia página.

---

## 7. SEO y medición

- `<title>`/`description` por página e idioma; `hreflang` por `@astrojs/sitemap` + `<link rel="alternate">`.
- Open Graph con imagen por página (la captura del proyecto en `/work/[slug]`, la portada en posts).
- JSON-LD: `Person` (Jose) en home/about, `Article` en posts, `CreativeWork` en fichas.
- `robots.txt` con `/admin` excluido. `noindex` en `/admin`.
- **Eventos GA4 mínimos:** `contact_submit`, `cta_click` (con `location`), `project_outbound` (clic a sitio de cliente), `book_call`.

---

## 8. Despliegue y operación

1. Repo en GitHub (Jose lo crea), Vercel conectado a `main`.
2. Variables: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_GA4_ID`, `PUBLIC_WEB3FORMS_KEY`.
3. Webhook en Sanity (on publish) → Deploy Hook de Vercel.
4. Dominio `joseuribe.dev` → Vercel (**ya hecho**). `overnatic.us` se apaga cuando esto esté vivo.

**Requiere acción de Jose (no automatizable):** crear el proyecto en Sanity (`npx sanity@latest init` exige login en navegador) y pegar el `projectId`; crear cuenta en Web3Forms; crear propiedad GA4. ~~Comprar el dominio~~ hecho.

---

## 9. Criterios de aceptación

- [ ] Los 12 proyectos publicados con captura; los 4 con ficha completa; Zohara sin enlace.
- [ ] Blog operativo desde `/admin`: Jose publica un post en EN y aparece en el sitio tras el rebuild sin tocar código.
- [ ] Home, work, services, about y blog en EN y ES. PT con páginas fijas al menos.
- [ ] Formulario de contacto entrega al correo y dispara `contact_submit` en GA4.
- [ ] Lighthouse móvil ≥ 95 en home y en una ficha de proyecto.
- [ ] `hreflang` válido en las tres versiones.
- [ ] `/admin` funciona en producción con login de Sanity.

---

## 10. Fuera de alcance

- Adaptador SSR, funciones serverless, cualquier backend propio.
- MCP propio (el de contenido lo da Sanity).
- Migración de contenido o SEO desde overnatic.us.
- Newsletter, comentarios, búsqueda.
- Modo oscuro (se evalúa después del lanzamiento).
- Los demos por sector de Overnatic.
