import { useMemo, useState } from 'react';
import { generateFish } from '../../shared/fish';
import type { DomainRecord } from '../../shared/models';
import { FishPortrait } from './FishPortrait';
import { Icon } from './Icon';
export function Directory({ records, search, select, close }: { records: DomainRecord[]; search: string; select: (record: DomainRecord) => void; close: () => void }) {
  const [sort, setSort] = useState('Recent'); const [page, setPage] = useState(0);
  const [pinned, setPinned] = useState(false);
  const result = useMemo(() => records.filter(record => (!pinned || record.pinned) && `${record.customName ?? ''} ${record.hostname} ${generateFish(record).speciesName}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'Alphabetical' ? (a.customName ?? a.hostname).localeCompare(b.customName ?? b.hostname) : sort === 'Most visited' ? b.totalVisits - a.totalVisits : sort === 'Newest' ? b.firstVisitedAt - a.firstVisitedAt : b.lastVisitedAt - a.lastVisitedAt), [records, search, sort, pinned]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(result.length / 40) - 1));
  return <aside className="panel directory" aria-label="Species directory"><div className="panel-heading"><span className="eyebrow">SPECIES DIRECTORY <span className="count">{result.length}</span></span><button className="icon-button" onClick={close} aria-label="Close directory"><Icon name="close"/></button></div>
    <div className="directory-controls"><select aria-label="Sort species" value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}>{['Recent', 'Most visited', 'Newest', 'Alphabetical'].map(value => <option key={value}>{value}</option>)}</select><button className={'icon-button ' + (pinned ? 'active' : '')} onClick={() => { setPinned(!pinned); setPage(0); }} aria-label="Show only pinned fish" aria-pressed={pinned}><Icon name="pin"/></button></div>
    <div className="species-list">{result.slice(currentPage * 40, currentPage * 40 + 40).map(record => <button key={record.hostname} className="species-row" onClick={() => select(record)}><FishPortrait record={record} small/><span><strong>{record.customName ?? record.hostname}</strong>{record.customName && <small>{record.hostname}</small>}<small>{generateFish(record).speciesName}{record.pinned ? ' · pinned' : ''}</small></span><Icon name="arrow" size={16}/></button>)}{!result.length && <p className="empty-note">No species found. Try another domain or clear the pinned filter.</p>}</div>
    {result.length > 40 && <div className="pagination"><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>{currentPage + 1} / {Math.ceil(result.length / 40)}</span><button disabled={(currentPage + 1) * 40 >= result.length} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
    <p className="fine-print">Choose a species to find it in the aquarium.</p></aside>;
}
