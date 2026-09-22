import { newDomain, seededRandom } from './domain';
import { CATEGORIES, emptyData } from './models';
export function demoData(count = 80) {
  const state = emptyData(); const now = Date.now(); const random = seededRandom(42);
  const hosts = ['github.com', 'youtube.com', 'soundcloud.com', 'wikipedia.org', 'reddit.com', 'carleton.ca', 'itch.io', 'notion.so', 'bbc.com', 'etsy.com', 'randomoldsite.net'];
  state.onboarded = true;
  state.domains = Array.from({ length: count }, (_, index) => {
    const record = newDomain(hosts[index] ?? `tide-${index + 1}.example`, now - random() * 180 * 86400000);
    record.totalVisits = index % 11 === 0 ? 2 : Math.ceil(random() * 250);
    record.activeTimeSeconds = random() * 80000;
    record.lastVisitedAt = Math.max(record.firstVisitedAt, now - (index < 8 ? random() * 3600000 : random() * 150 * 86400000));
    if (index >= hosts.length) record.category = CATEGORIES[index % CATEGORIES.length];
    record.pinned = index < 2;
    const examples = [[84, 21600, 0], [220, 64800, 0], [63, 14400, 1], [31, 7200, 4]];
    if (index < examples.length) { record.totalVisits = examples[index][0]; record.activeTimeSeconds = examples[index][1]; record.lastVisitedAt = now - examples[index][2] * 86400000; }
    if (index === 10) { record.totalVisits = 2; record.activeTimeSeconds = 300; record.firstVisitedAt = now - 160 * 86400000; record.createdAt = record.firstVisitedAt; record.lastVisitedAt = now - 150 * 86400000; }
    if (index >= 11 && index <= 13) { record.createdAt = record.firstVisitedAt = record.lastVisitedAt = now; record.totalVisits = 1; record.activeTimeSeconds = 0; }
    return record;
  });
  return state;
}
