import { track } from '../lib/analytics';

document.addEventListener('click', (e) => {
  // e.target can be a Text node (Safari) — resolve to the nearest Element first.
  const origin = e.target instanceof Element ? e.target : (e.target as Node | null)?.parentElement;
  const el = origin?.closest<HTMLElement>('[data-cta],[data-outbound],[data-book],[data-social]');
  if (!el) return;
  if (el.dataset.cta) track('cta_click', { location: el.dataset.cta });
  if (el.dataset.outbound) track('project_outbound', { project: el.dataset.outbound });
  if (el.dataset.book !== undefined) track('book_call');
  if (el.dataset.social) track('social_click', { network: el.dataset.social });
});
