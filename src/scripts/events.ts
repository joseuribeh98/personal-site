import { track } from '../lib/analytics';

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cta],[data-outbound],[data-book]');
  if (!el) return;
  if (el.dataset.cta) track('cta_click', { location: el.dataset.cta });
  if (el.dataset.outbound) track('project_outbound', { project: el.dataset.outbound });
  if (el.dataset.book !== undefined) track('book_call');
});
