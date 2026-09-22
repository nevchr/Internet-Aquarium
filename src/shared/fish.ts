import { seededRandom } from './domain';
import type { DomainRecord, Period } from './models';
export const BODIES = ['Oval', 'Long', 'Round', 'Flat', 'Needle', 'Chunky', 'Tiny', 'Deep'] as const;
export const TAILS = ['Forked', 'Round', 'Fan', 'Triangle', 'Long', 'Double'] as const;
export const PATTERNS = ['Solid', 'Horizontal', 'Vertical', 'Spotted', 'Speckled', 'Gradient', 'Two-tone'] as const;
export interface FishTraits {
  seed: number; speciesName: string; bodyType: typeof BODIES[number]; bodyLength: number; bodyHeight: number;
  tailType: typeof TAILS[number]; finType: 'Angular' | 'Flowing' | 'Round'; stripePattern: typeof PATTERNS[number];
  hue: number; saturation: number; brightness: number; eyeSize: number; swimSpeed: number; curiosity: number; depthPreference: number;
  schoolingTendency: number; bioluminescent: boolean; translucent: boolean;
}
export function generateFish(record: Pick<DomainRecord, 'fishSeed' | 'category'>): FishTraits {
  const random = seededRandom(record.fishSeed);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  let bodyType = pick(BODIES);
  if (record.category === 'Development') bodyType = 'Long';
  if (record.category === 'Video') bodyType = 'Deep';
  if (record.category === 'Education') bodyType = 'Tiny';
  const dimensions = { Oval: [1, .53], Long: [1.3, .38], Round: [.85, .76], Flat: [1.05, .32], Needle: [1.6, .22], Chunky: [1.1, .65], Tiny: [.7, .38], Deep: [1, .82] }[bodyType];
  return {
    seed: record.fishSeed,
    speciesName: `${pick(['Silver', 'Glass', 'Amber', 'Velvet', 'Moon', 'Dusky', 'Golden', 'Blue', 'Ghost', 'Copper', 'Ruby', 'Pearl', 'Deep', 'Speckled', 'Jade', 'Opal'])} ${pick(['Darter', 'Minnow', 'Tetra', 'Goby', 'Ray', 'Snapper', 'Drifter', 'Fin', 'Loach', 'Perch', 'Wrasse', 'Koi', 'Shiner'])}`,
    bodyType, bodyLength: dimensions[0], bodyHeight: dimensions[1], tailType: record.category === 'Music' ? 'Long' : pick(TAILS),
    finType: record.category === 'Development' ? 'Angular' : record.category === 'Music' ? 'Flowing' : pick(['Angular', 'Flowing', 'Round'] as const),
    stripePattern: pick(PATTERNS), hue: pick([22, 36, 46, 155, 173, 187, 205, 263, 325]) + random() * 15,
    saturation: 40 + random() * 30, brightness: 52 + random() * 18, eyeSize: 2 + random(),
    swimSpeed: (record.category === 'Gaming' ? 24 : 13) + random() * 14,
    curiosity: random(), depthPreference: record.category === 'Education' ? .5 : .15 + random() * .7,
    schoolingTendency: record.category === 'Social' ? .85 : random() * .65,
    bioluminescent: random() < .04, translucent: random() < .05
  };
}
export const MAX_GROWTH = 1.7;
export function growth(record: Pick<DomainRecord, 'totalVisits'>): number {
  // Visits grow the fish; active time affects maturity separately. Stop at 500 visits.
  return .7 + (MAX_GROWTH - .7) * Math.min(1, Math.log1p(Math.max(0, record.totalVisits)) / Math.log1p(500));
}
export function maturity(record: Pick<DomainRecord, 'activeTimeSeconds'>): number { return Math.min(1, Math.log1p(record.activeTimeSeconds / 60) / Math.log1p(60 * 100)); }
export function recency(lastVisited: number, now = Date.now()): number { return .25 + .75 * Math.exp(-Math.max(0, now - lastVisited) / (7 * 86400000)); }
export function periodStart(period: Period, now = Date.now()): number {
  if (period === 'All Time') return 0;
  if (period === 'Today') { const date = new Date(now); date.setHours(0, 0, 0, 0); return date.getTime(); }
  return now - (period === '7 Days' ? 7 : 30) * 86400000;
}
