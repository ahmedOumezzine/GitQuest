/** Resolve a public asset/data path against Vite's configured base URL. */
export function publicUrl(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  const base = ((import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/').replace(/\/?$/, '/');
  return base + normalized;
}
