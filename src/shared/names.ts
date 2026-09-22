export const MAX_FISH_NAME_LENGTH = 40;

/** Optional, plain-text nickname. Missing names keep version 1 exports compatible. */
export function normalizeFishName(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/u.test(value)) throw new Error('Use a plain-text fish name.');
  const name = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (name.length > MAX_FISH_NAME_LENGTH) throw new Error(`Fish names can have up to ${MAX_FISH_NAME_LENGTH} characters.`);
  return name || undefined;
}
