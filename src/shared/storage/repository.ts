import { emptyData, type AquariumData, type Command } from '../models';
import { validateData, validateSettings } from './schema';
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
    case 'import': return validateData(command.data);
    default: return state;
  }
}
