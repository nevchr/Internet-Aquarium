import type { DomainRecord } from '../../shared/models';
import { generateFish, growth, maturity } from '../../shared/fish';
import { FishPortrait } from './FishPortrait';
import { Icon } from './Icon';
export function duration(seconds: number) { const minutes = Math.floor(seconds / 60); return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`; }
export function Detail({ record, close, pin }: { record: DomainRecord; close: () => void; pin: () => void }) {
  const traits = generateFish(record); const date = (n: number) => new Date(n).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return <aside className="panel detail" aria-label="Selected species">
    <div className="panel-heading"><span className="eyebrow">FIELD NOTES</span><button className="icon-button" aria-label="Close fish details" onClick={close}><Icon name="close"/></button></div>
    <div className="portrait-wrap"><FishPortrait record={record}/><span>{traits.bodyType} · {traits.tailType} tail</span></div>
    <span className="category-tag">{record.category}</span><h2>{traits.speciesName}</h2><p className="domain-name">{record.hostname}</p>
    <dl><div><dt>Discovered</dt><dd>{date(record.firstVisitedAt)}</dd></div><div><dt>Recorded visits</dt><dd>{record.totalVisits.toLocaleString()}</dd></div><div><dt>Approx. active time</dt><dd>{duration(record.activeTimeSeconds)}</dd></div><div><dt>Last seen</dt><dd>{date(record.lastVisitedAt)}</dd></div></dl>
    <div className="maturity-label"><span>Maturity</span><span>{Math.round(maturity(record) * 100)}%</span></div><progress max="1" value={maturity(record)} aria-label="Fish maturity"/>
    <p className="fine-print">{growth(record).toFixed(2)}× growth · A little more familiar with these waters.</p>
    <button className={'secondary wide ' + (record.pinned ? 'pinned' : '')} onClick={pin}><Icon name="pin"/>{record.pinned ? 'Unpin fish' : 'Pin fish'}</button>
    <p className="fine-print">Browsing estimates, collected since your aquarium began.</p>
  </aside>;
}
