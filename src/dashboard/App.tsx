import { useEffect, useRef, useState, useCallback } from 'react';
import { AquariumScene } from '../aquarium/AquariumScene';
import { emptyData, type AquariumData, type Command, type DomainRecord, type Period } from '../shared/models';
import { command, download, isDemo, isExtension, requestTracking, subscribe } from '../shared/storage/client';
import { generateFish, periodStart } from '../shared/fish';
import { Icon } from './components/Icon';
import { Detail } from './components/Detail';
import { Directory } from './components/Directory';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const [data, setData] = useState<AquariumData>(emptyData); const [loaded, setLoaded] = useState(false); const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(new URLSearchParams(location.search).get('fish'));
  const [panel, setPanel] = useState<'directory' | 'settings' | null>(null); const [search, setSearch] = useState(''); const [period, setPeriod] = useState<Period>('All Time');
  const [hover, setHover] = useState<{ record: DomainRecord; x: number; y: number } | null>(null); const [newCount, setNewCount] = useState(0); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null); const scene = useRef<AquariumScene | null>(null);
  const [swimming, setSwimming] = useState(0);
  const select = useCallback((record: DomainRecord, locate = true) => { setSelected(record.hostname); setPanel(null); setHover(null); scene.current?.select(record.hostname, locate); }, []);
  useEffect(() => {
    const aquarium = new AquariumScene(canvas.current!, select, (record, x, y) => setHover(record ? { record, x, y } : null), setSwimming); scene.current = aquarium;
    return () => { aquarium.destroy(); scene.current = null; };
  }, [select]);
  useEffect(() => {
    let alive = true;
    command({ type: 'read' }).then(value => {
      if (!alive) return; setData(value); setLoaded(true);
      setNewCount(value.domains.filter(d => d.createdAt > value.lastOpenedAt).length);
      if (value.onboarded) void command({ type: 'opened' }).catch(e => setError(String(e)));
    }).catch(e => setError(String(e)));
    const unsubscribe = subscribe(value => { if (alive) setData(value); });
    return () => { alive = false; unsubscribe(); };
  }, []);
  useEffect(() => { scene.current?.setData(data); }, [data]);
  useEffect(() => { scene.current?.select(selected); }, [selected]);
  useEffect(() => { scene.current?.setPeriod(period); }, [period]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setPanel(null); setSelected(null); setSearch(''); } if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); document.querySelector<HTMLInputElement>('.search-box input')?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
  const run = async (message: Command) => { const value = await command(message); setData(value); };
  const safeRun = async (message: Command) => { try { await run(message); } catch (e) { setError(String(e)); } };
  const start = async () => { setBusy(true); setError(''); try { if (!await requestTracking()) throw new Error('Browsing permission was not granted. Your aquarium has not started tracking.'); await run({ type: 'start' }); } catch (e) { setError(String(e)); } finally { setBusy(false); } };
  const chosen = data.domains.find(d => d.hostname === selected); const today = periodStart('Today');
  return <main className="aquarium-app"><canvas ref={canvas} className="aquarium-canvas" aria-label="Animated aquarium. Use Search or Species directory to select fish with a keyboard." role="img"/>
    <header className="topbar"><a href="index.html" className="brand" aria-label="Internet Aquarium home"><span className="brand-mark"><Icon name="fish" size={30}/></span><span>INTERNET<span>AQUARIUM</span></span></a>
    {data.onboarded && <div className="header-tools"><div className="search-box"><Icon name="search" size={18}/><input aria-label="Search your aquarium" placeholder="Find a species or website" value={search} onFocus={() => setPanel('directory')} onChange={e => { setSearch(e.target.value); setPanel('directory'); setSelected(null); }}/><kbd>/</kbd></div><button className="icon-button settings-button" aria-label="Open settings" onClick={() => { setPanel(panel === 'settings' ? null : 'settings'); setSelected(null); }}><Icon name="settings"/></button></div>}
    </header>
    {loaded && !data.onboarded && <Onboarding start={() => void start()} busy={busy}/>}
    {data.onboarded && <>
      <section className="scene-title"><span className="eyebrow"><span className="live-dot"/>{isDemo ? 'DEVELOPMENT AQUARIUM' : 'YOUR LIVING INTERNET'}</span><h1>A world of<br/><em>small discoveries.</em></h1><p>{data.domains.length ? 'Familiar places. Unfamiliar little creatures.' : 'Your water is quiet. Visit a website to discover your first fish.'}</p>{newCount > 0 && <button className="discovery-note" onClick={() => { setPanel('directory'); setSelected(null); setNewCount(0); }}><span>✧</span> {newCount} new species since your last visit <Icon name="arrow" size={15}/></button>}</section>
      <div className="side-actions"><button className={'secondary ' + (panel === 'directory' ? 'active' : '')} onClick={() => { setPanel(panel === 'directory' ? null : 'directory'); setSelected(null); }}><Icon name="list" size={17}/> Species <span>{data.domains.length}</span></button><button className="secondary capture-button" onClick={() => void scene.current?.capture().then(blob => { download(blob, 'internet-aquarium.png'); setNotice('Aquarium captured. The PNG contains no domain labels.'); }).catch(e => setError(String(e)))}><Icon name="capture" size={17}/><span>Capture aquarium</span></button></div>
      {panel === 'directory' && <Directory records={data.domains} search={search} select={select} close={() => { setPanel(null); setSearch(''); }}/>}
      {panel === 'settings' && <Settings data={data} run={run} close={() => setPanel(null)}/>}
      {chosen && !panel && <Detail record={chosen} close={() => setSelected(null)} pin={() => void safeRun({ type: 'pin', hostname: chosen.hostname })} rename={name => run({ type: 'rename', hostname: chosen.hostname, name })}/>}
      <div className="bottom-center"><div className="timeline" aria-label="Activity emphasis">{(['Today', '7 Days', '30 Days', 'All Time'] as Period[]).map(value => <button key={value} aria-pressed={period === value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>{value}</button>)}</div><span className="timeline-hint">{period === 'All Time' ? 'Every species has a place here.' : 'Recent visitors shine. Every fish stays.'}</span></div>
      <footer className="statusbar"><span><strong>{data.domains.length}</strong> species discovered <i/> <strong>{data.domains.filter(d => d.lastVisitedAt >= today).length}</strong> seen today <i/> <strong>{data.domains.filter(d => d.firstVisitedAt >= today).length}</strong> new today</span><span><Icon name="shield" size={14}/>{isDemo ? 'Preview · synthetic data' : 'Only on this device'}{!data.settings.trackVisits && ' · Visits paused'}{data.domains.length > swimming && ` · ${swimming} swimming · ${data.domains.length - swimming} resting`}</span></footer>
    </>}
    {hover && !panel && !chosen && <div className="fish-tooltip" style={{ left: Math.min(hover.x + 15, innerWidth - 230), top: Math.min(hover.y + 18, innerHeight - 95) }}><strong>{hover.record.customName ?? hover.record.hostname}</strong><span>{hover.record.customName && `${hover.record.hostname} · `}{generateFish(hover.record).speciesName} · {hover.record.totalVisits} visits</span><small>Drag to move · Click for details</small></div>}
    {(error || notice) && <div className={'toast ' + (error ? 'error' : '')} role={error ? 'alert' : 'status'}>{error || notice}{error && <button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><Icon name="close" size={16}/></button>}</div>}
    {!loaded && !error && <div className="loading">Opening your aquarium…</div>}
    {!isExtension && !isDemo && <div className="loading">Load the dist folder as an unpacked extension in Chrome.</div>}
  </main>;
}
