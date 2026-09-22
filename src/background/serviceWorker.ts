import { normalizeDomain } from '../shared/domain';
import type { Command } from '../shared/models';
import { applyCommand, CLOCK_KEY, Repository } from '../shared/storage/repository';
import { recordVisit } from './tracking';
import { accrueTime, type Checkpoint } from './timing';

const repository = new Repository(chrome.storage.local);
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(job: () => Promise<T>): Promise<T> {
  const result = queue.then(job);
  queue = result.catch(error => console.error('Aquarium operation failed:', error instanceof Error ? error.message : 'unknown error'));
  return result;
}
async function activeHostname(): Promise<string | null> {
  if (!(await chrome.permissions.contains({ permissions: ['tabs'] }))) return null;
  const window = await chrome.windows.getLastFocused();
  if (!window.focused || window.state === 'minimized' || window.incognito) return null;
  const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
  return tab && !tab.incognito && tab.url ? normalizeDomain(tab.url) : null;
}
async function checkpoint() {
  const state = await repository.read();
  const previous = (await chrome.storage.session.get(CLOCK_KEY))[CLOCK_KEY] as Checkpoint | undefined;
  const now = Date.now();
  if (accrueTime(state, previous, now)) await repository.save(state);
  await chrome.storage.session.set({ [CLOCK_KEY]: { hostname: state.onboarded && state.settings.trackTime ? await activeHostname() : null, at: now } });
}
const tick = () => { void serial(checkpoint).catch(() => {}); };
let listening = false;
function listenToHistory() {
  if (listening || !chrome.history) return;
  chrome.history.onVisited.addListener(item => {
    if (!item.url) return;
    // The full URL is transient; only its normalized hostname enters storage.
    const host = normalizeDomain(item.url);
    if (!host) return;
    const timestamp = item.lastVisitTime ?? Date.now();
    void serial(async () => {
      const state = await repository.read();
      if (recordVisit(state, 'https://' + host, timestamp)) await repository.save(state);
    }).catch(() => {});
  });
  listening = true;
}
listenToHistory();
chrome.permissions.onAdded.addListener(() => { listenToHistory(); tick(); });
chrome.permissions.onRemoved.addListener(() => {
  void serial(async () => { await chrome.storage.session.remove(CLOCK_KEY); }).catch(() => {});
});
chrome.tabs.onActivated.addListener(tick);
chrome.tabs.onUpdated.addListener((_id, changes, tab) => { if (tab.active && (changes.url || changes.status === 'complete')) tick(); });
chrome.tabs.onRemoved.addListener(tick);
chrome.windows.onFocusChanged.addListener(tick);
chrome.windows.onRemoved.addListener(tick);
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'aquarium-heartbeat') tick(); });
async function ensureAlarm() {
  if (!(await chrome.alarms.get('aquarium-heartbeat'))) await chrome.alarms.create('aquarium-heartbeat', { periodInMinutes: .5 });
}
chrome.runtime.onStartup.addListener(() => {
  void serial(async () => { await chrome.storage.session.remove(CLOCK_KEY); await ensureAlarm(); await checkpoint(); }).catch(() => {});
});
chrome.runtime.onInstalled.addListener(details => {
  void ensureAlarm();
  if (details.reason === 'install') void chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
void ensureAlarm();
chrome.runtime.onMessage.addListener((command: Command, sender, reply) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return false;
  void serial(async () => {
    if (!command || !['read', 'start', 'opened', 'settings', 'pin', 'reset', 'import'].includes(command.type)) throw new Error('Unknown aquarium command.');
    if (command.type === 'reset') {
      await chrome.storage.session.remove(CLOCK_KEY);
      return repository.reset();
    }
    if (command.type === 'start' && !(await chrome.permissions.contains({ permissions: ['history', 'tabs'] }))) throw new Error('Allow browsing permissions to start tracking.');
    if (command.type === 'settings' || command.type === 'import') await checkpoint();
    const current = await repository.read();
    const next = applyCommand(current, command);
    if (command.type !== 'read') await repository.save(next);
    if (['start', 'settings', 'import'].includes(command.type)) {
      await chrome.storage.session.remove(CLOCK_KEY);
      await checkpoint();
    }
    return next;
  }).then(data => reply({ data }), error => reply({ error: error instanceof Error ? error.message : 'Could not save aquarium.' }));
  return true;
});
