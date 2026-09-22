import { emptyData, type AquariumData, type Command } from '../models';
import { validateData, validateSettings } from './schema';
import { normalizeFishName } from '../names';
export const DATA_KEY = 'internetAquarium.v1';
export const CLOCK_KEY = 'internetAquarium.clock';
export interface StorageArea { get(key: string): Promise<Record<string, unknown>>; set(items: Record<string, unknown>): Promise<void>; remove(keys: string | string[]): Promise<void> }
export class Repository {
  constructor(private local: StorageArea) {}
  async read(): Promise<AquariumData> {
    const stored = (await this.local.get(DATA_KEY))[DATA_KEY];
    return stored === undefined ? emptyData() : validateData(stored);
  }
  async save(data: AquariumData) { await this.local.set({ [DATA_KEY]: data }); }
  async reset() { await this.local.remove(DATA_KEY); return emptyData(); }
}
export function applyCommand(state: AquariumData, command: Command): AquariumData {
  switch (command.type) {
    case 'start': return { ...state, onboarded: true };
    case 'opened': return { ...state, lastOpenedAt: Date.now() };
    case 'settings': return { ...state, settings: validateSettings({ ...state.settings, ...command.settings }) };
    case 'pin': return { ...state, domains: state.domains.map(d => d.hostname === command.hostname ? { ...d, pinned: !d.pinned } : d) };
    case 'rename': {
      if (typeof command.name !== 'string') throw new Error('Use a plain-text fish name.');
      const customName = normalizeFishName(command.name);
      if (!state.domains.some(d => d.hostname === command.hostname)) throw new Error('This fish is no longer in your aquarium.');
      return { ...state, domains: state.domains.map(record => {
        if (record.hostname !== command.hostname) return record;
        const renamed = { ...record };
        if (customName) renamed.customName = customName;
        else delete renamed.customName;
        return renamed;
      }) };
    }
    case 'import': return validateData(command.data);
    default: return state;
  }
}
