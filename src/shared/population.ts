import type { DomainRecord } from './models';

// Leave breathing room for the artwork and controls, even on a small window.
export function tankCapacity(width: number, height: number, limit: number): number {
  return Math.max(1, Math.min(500, limit, Math.floor(width * Math.max(1, height - 160) / 14000)));
}

export function swimmingPopulation(records: readonly DomainRecord[], capacity: number, selected: string | null = null, held: string | null = null): DomainRecord[] {
  return [...records].sort((a, b) =>
    // A fish being handled or explicitly located remains available until dismissed.
    Number(b.hostname === held) - Number(a.hostname === held) ||
    Number(b.hostname === selected) - Number(a.hostname === selected) ||
    b.totalVisits - a.totalVisits ||
    b.lastVisitedAt - a.lastVisitedAt || a.hostname.localeCompare(b.hostname)
  ).slice(0, Math.max(0, capacity));
}
