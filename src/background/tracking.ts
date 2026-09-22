import { newDomain, normalizeDomain } from '../shared/domain';
import type { AquariumData } from '../shared/models';
export function recordVisit(state: AquariumData, url: string, timestamp: number): boolean {
  if (!state.onboarded || !state.settings.trackVisits) return false;
  const host = normalizeDomain(url);
  if (!host) return false;
  const domain = state.domains.find(d => d.hostname === host);
  if (domain) { domain.totalVisits += 1; domain.lastVisitedAt = Math.max(domain.lastVisitedAt, timestamp); }
  else state.domains.push(newDomain(host, timestamp));
  return true;
}
