import { type DomainRecord, type SiteCategory } from './models';

export function normalizeDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const host = parsed.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
    if (!host || host === 'localhost' || host.endsWith('.localhost') || host === '[::1]' || /^127\./.test(host) || host === '0.0.0.0') return null;
    return host;
  } catch { return null; }
}

export function hashDomain(domain: string): number {
  let hash = 2166136261;
  for (const char of domain) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
export function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
const groups: Partial<Record<SiteCategory, string[]>> = {
  Development: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org', 'npmjs.com'],
  Video: ['youtube.com', 'vimeo.com', 'netflix.com', 'twitch.tv'], Music: ['soundcloud.com', 'spotify.com', 'bandcamp.com'],
  Social: ['reddit.com', 'instagram.com', 'bsky.app', 'facebook.com', 'mastodon.social'],
  Education: ['coursera.org', 'khanacademy.org', 'carleton.ca', 'edx.org'], News: ['bbc.com', 'cbc.ca', 'reuters.com', 'theguardian.com'],
  Shopping: ['amazon.com', 'amazon.ca', 'etsy.com', 'ebay.com'], Gaming: ['steampowered.com', 'itch.io', 'roblox.com'],
  Reference: ['wikipedia.org', 'archive.org', 'britannica.com'], Productivity: ['notion.so', 'docs.google.com', 'calendar.google.com', 'trello.com']
};
export function categoryFor(host: string): SiteCategory {
  for (const [category, hosts] of Object.entries(groups)) {
    if (hosts.some(base => host === base || host.endsWith('.' + base))) return category as SiteCategory;
  }
  return 'Other';
}
export function newDomain(hostname: string, now = Date.now()): DomainRecord {
  return { id: hostname, hostname, firstVisitedAt: now, lastVisitedAt: now, totalVisits: 1, activeTimeSeconds: 0, fishSeed: hashDomain(hostname), category: categoryFor(hostname), createdAt: now, pinned: false };
}
