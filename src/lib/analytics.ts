type Params = Record<string, string | number | boolean>;

export function track(name: string, params: Params = {}): void {
  const g = (globalThis as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof g === 'function') g('event', name, params);
}
