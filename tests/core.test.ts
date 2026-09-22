import { describe, expect, it } from 'vitest';
import { categoryFor, hashDomain, newDomain, normalizeDomain } from '../src/shared/domain';
import { generateFish, growth, MAX_GROWTH, maturity, recency, periodStart } from '../src/shared/fish';
import { swimmingPopulation, tankCapacity } from '../src/shared/population';
import { emptyData } from '../src/shared/models';
import { demoData } from '../src/shared/demo';
import { validateData } from '../src/shared/storage/schema';
import { Repository, DATA_KEY, applyCommand } from '../src/shared/storage/repository';
import { normalizeFishName } from '../src/shared/names';
import { recordVisit } from '../src/background/tracking';
import { accrueTime } from '../src/background/timing';

describe('domain identity', () => {
  it('normalizes www, case, trailing dots and URL paths, retaining meaningful subdomains', () => {
    expect(normalizeDomain('https://WWW.GitHub.COM./private/path?q=secret')).toBe('github.com');
    expect(normalizeDomain('https://docs.google.com/document/a')).toBe('docs.google.com');
    expect(normalizeDomain('https://en.wikipedia.org')).toBe('en.wikipedia.org');
    expect(normalizeDomain('https://m.youtube.com')).toBe('m.youtube.com');
  });
  it.each(['chrome://settings', 'chrome-extension://test/page', 'edge://newtab', 'about:blank', 'file:///a', 'http://localhost:8000', 'http://a.localhost', 'http://127.0.0.1', 'http://[::1]', 'bad URL'])('ignores %s', url => expect(normalizeDomain(url)).toBeNull());
  it('has stable hash and different domain traits', () => {
    expect(hashDomain('github.com')).toBe(1228281881);
    const record = newDomain('github.com');
    const revisited = { ...record, totalVisits: 5000 };
    expect(generateFish(record)).toEqual(generateFish(revisited));
    expect(generateFish(record)).not.toEqual(generateFish(newDomain('youtube.com')));
  });
  it('classifies locally without unrelated suffix matches', () => {
    expect(categoryFor('github.com')).toBe('Development'); expect(categoryFor('en.wikipedia.org')).toBe('Reference');
    expect(categoryFor('notgithub.com')).toBe('Other'); expect(categoryFor('unknown.example')).toBe('Other');
  });
});
describe('growth and behaviour', () => {
  it('grows monotonically with diminishing returns and an upper bound', () => {
    const record = newDomain('github.com'); let prior = 0;
    for (const visits of [1, 2, 10, 100, 1000, 1e9]) { const size = growth({ ...record, totalVisits: visits }); expect(size).toBeGreaterThanOrEqual(prior); expect(size).toBeLessThanOrEqual(MAX_GROWTH); prior = size; }
    expect(growth({ ...record, totalVisits: 10 })).toBeGreaterThan(growth(record));
  });
  it('caps popularity at 500 visits and does not inflate size with active time', () => {
    const record = newDomain('github.com');
    expect(growth({ ...record, totalVisits: 500 })).toBe(MAX_GROWTH);
    expect(growth({ ...record, totalVisits: Number.MAX_SAFE_INTEGER })).toBe(MAX_GROWTH);
    const longVisit = { ...record, activeTimeSeconds: 1e12 };
    expect(growth(longVisit)).toBe(growth(record));
    expect(growth({ totalVisits: 2 }) - growth({ totalVisits: 1 })).toBeGreaterThan(growth({ totalVisits: 101 }) - growth({ totalVisits: 100 }));
  });
  it('separates maturity from visits and increases with time', () => { expect(maturity({ activeTimeSeconds: 0 })).toBe(0); expect(maturity({ activeTimeSeconds: 600 })).toBeLessThan(maturity({ activeTimeSeconds: 60000 })); expect(maturity({ activeTimeSeconds: 1e12 })).toBe(1); });
  it('keeps older fish calm and recently visited fish active', () => { const now = Date.now(); expect(recency(now, now)).toBe(1); expect(recency(now - 150 * 86400000, now)).toBeGreaterThanOrEqual(.25); expect(recency(now, now)).toBeGreaterThan(recency(now - 86400000, now)); });
  it('uses local midnight for Today', () => { const now = new Date(2026, 8, 22, 14).getTime(); expect(periodStart('Today', now)).toBe(new Date(2026, 8, 22).getTime()); });
});

describe('crowding', () => {
  const records = [
    { ...newDomain('popular.example', 100), totalVisits: 200 },
    { ...newDomain('middle.example', 200), totalVisits: 20 },
    { ...newDomain('quiet.example', 300), totalVisits: 1, pinned: true, customName: 'Pearl' }
  ];
  it('removes the least visited from the tank while preserving every saved record', () => {
    const original = structuredClone(records);
    expect(swimmingPopulation(records, 2).map(r => r.hostname)).toEqual(['popular.example', 'middle.example']);
    expect(records).toEqual(original);
    const updated = records.map(r => r.hostname === 'quiet.example' ? { ...r, totalVisits: 201 } : r);
    expect(swimmingPopulation(updated, 2).map(r => r.hostname)).toEqual(['quiet.example', 'popular.example']);
  });
  it('temporarily locates resting fish and keeps a held fish during updates', () => {
    expect(swimmingPopulation(records, 2, 'quiet.example').map(r => r.hostname)).toEqual(['quiet.example', 'popular.example']);
    expect(swimmingPopulation(records, 1, 'popular.example', 'quiet.example')[0].hostname).toBe('quiet.example');
    expect(swimmingPopulation(records, 2).some(r => r.hostname === 'quiet.example')).toBe(false);
  });
  it('breaks visit ties consistently by recency then hostname', () => {
    const tied = records.map(r => ({ ...r, totalVisits: 1, lastVisitedAt: 100 }));
    expect(swimmingPopulation(tied, 3)).toEqual(swimmingPopulation([...tied].reverse(), 3));
    tied[2].lastVisitedAt = 200;
    expect(swimmingPopulation(tied, 1)[0].hostname).toBe('quiet.example');
  });
  it('reduces crowding on small screens and respects the configured ceiling', () => {
    expect(tankCapacity(390, 844, 500)).toBeLessThan(tankCapacity(1440, 960, 500));
    expect(tankCapacity(10000, 10000, 100)).toBe(100);
    expect(tankCapacity(10000, 10000, 500)).toBe(500);
    expect(tankCapacity(1, 1, 500)).toBe(1);
    expect(swimmingPopulation([], 80)).toEqual([]);
  });
});
describe('tracking and timing', () => {
  it('starts only after onboarding and stores summaries only', () => {
    const state = emptyData(); expect(recordVisit(state, 'https://github.com/private?token=secret', 100)).toBe(false);
    state.onboarded = true; recordVisit(state, 'https://www.github.com/private?token=secret', 100); recordVisit(state, 'https://github.com/other', 200);
    expect(state.domains).toHaveLength(1); expect(state.domains[0].totalVisits).toBe(2); expect(JSON.stringify(state)).not.toContain('secret');
    state.settings.trackVisits = false; expect(recordVisit(state, 'https://another.com', 300)).toBe(false);
  });
  it('accrues checkpoint time and ignores long sleep gaps, disabled timing and missing domains', () => {
    const state = emptyData(); state.onboarded = true; state.domains.push(newDomain('github.com', 1000));
    expect(accrueTime(state, { hostname: 'github.com', at: 1000 }, 31000)).toBe(30);
    expect(accrueTime(state, { hostname: 'github.com', at: 31000 }, 931000)).toBe(0);
    expect(accrueTime(state, { hostname: null, at: 1000 }, 2000)).toBe(0);
    state.settings.trackTime = false; expect(accrueTime(state, { hostname: 'github.com', at: 1000 }, 31000)).toBe(0);
    expect(state.domains[0].activeTimeSeconds).toBe(30);
  });
});
describe('persistence and import', () => {
  it('renames without changing fish identity, appearance or browsing statistics', () => {
    const state = demoData(1), original = structuredClone(state.domains[0]);
    const renamed = applyCommand(state, { type: 'rename', hostname: original.hostname, name: '  Pearl   the 🐟  ' });
    expect(renamed.domains[0]).toEqual({ ...original, customName: 'Pearl the 🐟' });
    expect(state.domains[0]).toEqual(original);
    expect(generateFish(renamed.domains[0])).toEqual(generateFish(original));
    recordVisit(renamed, 'https://' + original.hostname, Date.now());
    expect(renamed.domains[0].customName).toBe('Pearl the 🐟');
  });
  it('round-trips custom names and continues to accept older nameless exports', () => {
    const old = demoData(2);
    expect(validateData(JSON.parse(JSON.stringify(old)))).toEqual(old);
    const renamed = applyCommand(old, { type: 'rename', hostname: old.domains[0].hostname, name: 'Pearl' });
    expect(validateData(JSON.parse(JSON.stringify(renamed)))).toEqual(renamed);
  });
  it('clears a nickname and refuses missing fish', () => {
    const state = demoData(1); state.domains[0].customName = 'Pearl';
    expect(applyCommand(state, { type: 'rename', hostname: state.domains[0].hostname, name: '   ' }).domains[0]).not.toHaveProperty('customName');
    expect(() => applyCommand(state, { type: 'rename', hostname: 'missing.example', name: 'Pearl' })).toThrow();
  });
  it('validates names in imports as well as rename commands', () => {
    for (const name of [null, 4, {}, 'a'.repeat(41), 'hi\u0000there']) {
      expect(() => normalizeFishName(name)).toThrow();
      const state = demoData(1);
      expect(() => validateData({ ...state, domains: [{ ...state.domains[0], customName: name }] })).toThrow();
      expect(() => applyCommand(state, { type: 'rename', hostname: state.domains[0].hostname, name: name as string })).toThrow();
    }
    expect(normalizeFishName('Re\u0301my')).toBe('Rémy');
    expect(normalizeFishName('a'.repeat(40))).toHaveLength(40);
    const state = demoData(1);
    expect(() => applyCommand(state, { type: 'rename', hostname: state.domains[0].hostname, name: undefined as unknown as string })).toThrow();
  });
  it('persists names across repository instances', async () => {
    const memory: Record<string, unknown> = {};
    const storage = { get: async () => memory, set: async (items: Record<string, unknown>) => { Object.assign(memory, structuredClone(items)); }, remove: async () => {} };
    const state = demoData(1); state.domains[0].customName = 'Pearl';
    await new Repository(storage).save(state);
    expect((await new Repository(storage).read()).domains[0].customName).toBe('Pearl');
  });
  it('round-trips an export and strips unrecognized fields', () => {
    const state = demoData(2000); expect(validateData(JSON.parse(JSON.stringify(state)))).toEqual(state);
    expect(validateData({ ...state, url: 'secret' })).not.toHaveProperty('url');
  });
  it('rejects invalid and malicious payloads', () => {
    const state = demoData(1);
    for (const data of [{ ...state, version: 2 }, { ...state, domains: [...state.domains, ...state.domains] }, { ...state, settings: { motion: 'yes' } }, { ...state, domains: [{ ...state.domains[0], hostname: 'github.com/path' }] }, { ...state, domains: [{ ...state.domains[0], activeTimeSeconds: Infinity }] }, { ...state, domains: [{ ...state.domains[0], fishSeed: 0 }] }]) expect(() => validateData(data)).toThrow();
  });
  it('survives repository reconstruction, and reset removes only the extension-owned key', async () => {
    const memory: Record<string, unknown> = { unrelated: 'keep' }; const removed: string[] = [];
    const storage = { get: async (key: string) => ({ [key]: memory[key] }), set: async (items: Record<string, unknown>) => { Object.assign(memory, items); }, remove: async (keys: string | string[]) => { for (const key of [keys].flat()) { removed.push(key); delete memory[key]; } } };
    await new Repository(storage).save(demoData()); expect((await new Repository(storage).read()).domains).toHaveLength(80);
    const result = await new Repository(storage).reset(); expect(result.onboarded).toBe(false); expect(result.domains).toHaveLength(0); expect(removed).toEqual([DATA_KEY]); expect(memory.unrelated).toBe('keep');
  });
});
