import type { AquariumData } from '../shared/models';
export interface Checkpoint { hostname: string | null; at: number }
// Alarms can be delayed through sleep. Discard long gaps instead of claiming unattended hours.
export const MAX_CHECKPOINT_GAP_MS = 90000;
export function accrueTime(state: AquariumData, previous: Checkpoint | undefined, now: number): number {
  if (!state.onboarded || !state.settings.trackTime || !previous?.hostname) return 0;
  const elapsed = now - previous.at;
  if (elapsed <= 0 || elapsed > MAX_CHECKPOINT_GAP_MS) return 0;
  const record = state.domains.find(d => d.hostname === previous.hostname);
  if (!record) return 0;
  const seconds = elapsed / 1000;
  record.activeTimeSeconds += seconds;
  return seconds;
}
