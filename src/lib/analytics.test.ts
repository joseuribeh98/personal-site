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
