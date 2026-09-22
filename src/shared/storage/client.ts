import { type AquariumData, type Command, emptyData } from '../models';
import { applyCommand, DATA_KEY } from './repository';
import { demoData } from '../demo';
import { validateData } from './schema';
export const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
export const isDemo = !isExtension && import.meta.env.DEV;
const DEMO_KEY = 'internet-aquarium-demo';
export async function command(message: Command): Promise<AquariumData> {
  if (isExtension) {
    const response = await chrome.runtime.sendMessage(message) as { data?: AquariumData; error?: string };
    if (response.error || !response.data) throw new Error(response.error ?? 'The aquarium did not respond. Reload the extension.');
    return response.data;
  }
  if (!isDemo) throw new Error('Load the dist folder as an unpacked Chrome extension.');
  const stored = localStorage.getItem(DEMO_KEY);
  let state = stored ? validateData(JSON.parse(stored)) : demoData();
  state = message.type === 'reset' ? emptyData() : applyCommand(state, message);
  localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('aquarium-demo-change'));
  return state;
}
export function subscribe(listener: (data: AquariumData) => void): () => void {
  if (isExtension) {
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => { if (area === 'local' && changes[DATA_KEY]) listener(changes[DATA_KEY].newValue as AquariumData ?? emptyData()); };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }
  const onChange = () => { const value = localStorage.getItem(DEMO_KEY); if (value) listener(validateData(JSON.parse(value))); };
  window.addEventListener('aquarium-demo-change', onChange);
  return () => window.removeEventListener('aquarium-demo-change', onChange);
}
export async function requestTracking(): Promise<boolean> { return isDemo || (isExtension && await chrome.permissions.request({ permissions: ['history', 'tabs'] })); }
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
