## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Conventions (joseuribe.dev)

- Pages are thin locale wrappers; logic lives in `src/views/*View.astro`. Never duplicate a view.
- UI strings: `src/i18n/ui.ts` (`t(locale)('key')`). Content: Sanity via `src/lib/sanity.ts`.
- Links between pages: `localizePath('/work', locale)`. Never hardcode `/es/` or `/pt/`.
- Tests: `npm test` (Vitest, pure TS only). Pages are verified with `npm run build`.
- Design tokens live in `src/styles/global.css` `@theme`. Use `bg-paper`, `text-ink`, `text-accent`, `font-display`, `font-body`. No arbitrary hex values in components.
- Scripts under `scripts/` run with `node --env-file=.env scripts/<name>.mjs`.
