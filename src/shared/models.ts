export const CATEGORIES = ['Development', 'Video', 'Music', 'Social', 'Education', 'News', 'Shopping', 'Gaming', 'Reference', 'Productivity', 'Other'] as const;
export type SiteCategory = typeof CATEGORIES[number];
export interface DomainRecord {
  id: string; hostname: string; firstVisitedAt: number; lastVisitedAt: number;
  totalVisits: number; activeTimeSeconds: number; fishSeed: number; category: SiteCategory; createdAt: number; pinned: boolean;
  customName?: string;
}
export interface Settings {
  trackVisits: boolean; trackTime: boolean; fishCount: 100 | 250 | 500;
  motion: boolean; cursor: boolean; bubbles: boolean; particles: boolean; dayNight: boolean;
}
export interface AquariumData {
  version: 1; domains: DomainRecord[]; settings: Settings; onboarded: boolean; lastOpenedAt: number;
}
export const DEFAULT_SETTINGS: Settings = { trackVisits: true, trackTime: true, fishCount: 500, motion: true, cursor: true, bubbles: true, particles: true, dayNight: true };
export const emptyData = (): AquariumData => ({ version: 1, domains: [], settings: { ...DEFAULT_SETTINGS }, onboarded: false, lastOpenedAt: 0 });
export type Command = { type: 'read' } | { type: 'start' } | { type: 'opened' } | { type: 'settings'; settings: Partial<Settings> } | { type: 'pin'; hostname: string } | { type: 'rename'; hostname: string; name: string } | { type: 'reset' } | { type: 'import'; data: unknown };
export type Period = 'Today' | '7 Days' | '30 Days' | 'All Time';
