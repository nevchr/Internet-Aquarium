import { useEffect, useState } from 'react';
import type { AquariumData, DomainRecord } from '../shared/models';
import { command, isDemo, isExtension, subscribe } from '../shared/storage/client';
import { normalizeDomain } from '../shared/domain';
import { generateFish, periodStart } from '../shared/fish';
import { Icon } from '../dashboard/components/Icon';
import { FishPortrait } from '../dashboard/components/FishPortrait';
export default function Popup() {
  const [data, setData] = useState<AquariumData | null>(null); const [host, setHost] = useState<string | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    command({ type: 'read' }).then(setData).catch(e => setError(String(e)));
    if (isExtension) void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => setHost(tab?.url && !tab.incognito ? normalizeDomain(tab.url) : null));
    else if (isDemo) setHost('github.com');
    return subscribe(setData);
  }, []);
  const fish: DomainRecord | undefined = data?.domains.find(d => d.hostname === host); const today = periodStart('Today');
  const open = () => { const path = `index.html${fish ? '?fish=' + encodeURIComponent(fish.hostname) : ''}`; if (isExtension) void chrome.tabs.create({ url: chrome.runtime.getURL(path) }); else window.open(path); };
  return <main className="popup"><header><Icon name="fish" size={31}/><span>INTERNET AQUARIUM</span></header><div className="popup-species">{fish ? <><FishPortrait record={fish}/><span className="eyebrow">CURRENT SPECIES</span><h1>{generateFish(fish).speciesName}</h1><p>{fish.hostname}</p><small>{fish.totalVisits} recorded visits</small></> : <><div className="popup-empty"><Icon name="fish" size={68}/></div><h1>{data?.onboarded ? 'More life awaits.' : 'Your aquarium awaits.'}</h1><p>{!data?.onboarded ? 'Start your aquarium to discover your first species.' : host ? 'No fish recorded here yet. A new visit can discover one.' : 'Visit a website to meet its fish.'}</p></>}</div><div className="popup-stats"><span><strong>{data?.domains.length ?? 0}</strong>species discovered</span><span><strong>{data?.domains.filter(d => d.lastVisitedAt >= today).length ?? 0}</strong>seen today</span><span><strong>{data?.domains.filter(d => d.firstVisitedAt >= today).length ?? 0}</strong>new today</span></div><button className="primary wide" onClick={open}>Open aquarium<Icon name="arrow" size={18}/></button><p className="popup-privacy"><Icon name="shield" size={13}/> A small world. Only on this device.</p>{error && <p role="alert" className="error">{error}</p>}</main>;
}
