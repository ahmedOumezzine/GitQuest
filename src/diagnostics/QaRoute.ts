export function resolveQaLevelId(search: string, availableLevelIds: string[]): string | undefined {
  const candidate = new URLSearchParams(search).get('qaLevel');
  return candidate && availableLevelIds.includes(candidate) ? candidate : undefined;
}
