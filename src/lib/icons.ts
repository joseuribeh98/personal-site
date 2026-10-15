// Inline SVG icons shared by Astro components and string renderers (portable text).
// Same stroke language as the rest of the site. Never use emoji or Unicode arrows as icons.
const PATHS = {
  external: 'M7 17L17 7M8 7h9v9',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
} as const;

export type IconName = keyof typeof PATHS;

export function iconSvg(name: IconName, className = 'icon'): string {
  return (
    `<svg class="${className}" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">` +
    `<path d="${PATHS[name]}" /></svg>`
  );
}
