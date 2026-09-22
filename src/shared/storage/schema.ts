import { CATEGORIES, DEFAULT_SETTINGS, type AquariumData, type DomainRecord, type Settings } from '../models';
import { hashDomain, normalizeDomain } from '../domain';
import { normalizeFishName } from '../names';

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown, max = Number.MAX_SAFE_INTEGER): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
export function validateSettings(input: unknown): Settings {
  if (!object(input)) throw new Error('Invalid aquarium settings.');
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(settings) as (keyof Settings)[]) {
    if (!(key in input)) continue;
    if (key === 'fishCount') {
      if (![100, 250, 500].includes(input[key] as number)) throw new Error('Invalid fish count.');
      settings[key] = input[key] as Settings['fishCount'];
    } else {
      if (typeof input[key] !== 'boolean') throw new Error(`Invalid setting: ${key}.`);
      settings[key] = input[key];
    }
  }
  return settings;
}
export function validateData(input: unknown): AquariumData {
  if (!object(input) || input.version !== 1 || !Array.isArray(input.domains) || input.domains.length > 20000) throw new Error('Expected an Internet Aquarium version 1 export (up to 20,000 species).');
  const seen = new Set<string>();
  const domains: DomainRecord[] = input.domains.map((value: unknown) => {
    if (!object(value) || typeof value.hostname !== 'string' || value.hostname.length > 253 || normalizeDomain('https://' + value.hostname) !== value.hostname || value.hostname.includes('/') || seen.has(value.hostname)) throw new Error('Invalid or duplicate hostname in export.');
    if (value.id !== value.hostname || value.fishSeed !== hashDomain(value.hostname) || !CATEGORIES.includes(value.category as never) || typeof value.pinned !== 'boolean') throw new Error('Invalid fish identity in export.');
    for (const field of ['firstVisitedAt', 'lastVisitedAt', 'createdAt', 'totalVisits', 'activeTimeSeconds']) if (!number(value[field])) throw new Error(`Invalid ${field} in export.`);
    if ((value.firstVisitedAt as number) > (value.lastVisitedAt as number) || (value.lastVisitedAt as number) > Date.now() + 86400000 || (value.createdAt as number) > Date.now() + 86400000 || !Number.isInteger(value.totalVisits) || (value.totalVisits as number) < 1) throw new Error('Invalid visit dates or count.');
    seen.add(value.hostname);
    const customName = normalizeFishName(value.customName);
    return { id: value.hostname, hostname: value.hostname, fishSeed: value.fishSeed as number, category: value.category as DomainRecord['category'], pinned: value.pinned,
      firstVisitedAt: value.firstVisitedAt as number, lastVisitedAt: value.lastVisitedAt as number, createdAt: value.createdAt as number, totalVisits: value.totalVisits as number, activeTimeSeconds: value.activeTimeSeconds as number,
      ...(customName ? { customName } : {}) };
  });
  if (typeof input.onboarded !== 'boolean' || !number(input.lastOpenedAt)) throw new Error('Invalid aquarium state.');
  return { version: 1, domains, settings: validateSettings(input.settings), onboarded: input.onboarded, lastOpenedAt: input.lastOpenedAt };
}
