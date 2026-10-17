export function resolveQaLevelId(search: string, availableLevelIds: string[]): string | undefined {
  const params = new URLSearchParams(search);
  if (params.get('qa') !== 'benchmark') return undefined;
  const candidate = params.get('qaLevel');
  return candidate && availableLevelIds.includes(candidate) ? candidate : undefined;
}

export function resolveQaScene(search: string): 'victory' | undefined {
  return new URLSearchParams(search).get('qa') === 'victory' ? 'victory' : undefined;
}
