import { useRef, useState } from 'react';
import type { DomainRecord } from '../../shared/models';
import { generateFish } from '../../shared/fish';
import { MAX_FISH_NAME_LENGTH } from '../../shared/names';

export function FishName({ record, rename }: { record: DomainRecord; rename: (name: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editButton = useRef<HTMLButtonElement>(null);
  const species = generateFish(record).speciesName;
  const finish = () => { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); };

  return <div className="fish-name">
    <h2>{record.customName ?? species}</h2>
    {record.customName && <p className="species-name">{species}</p>}
    <p className="domain-name">{record.hostname}</p>
    {editing ? <form className="name-editor" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!saving) finish(); }
    }} onSubmit={event => {
      event.preventDefault(); if (saving) return;
      setSaving(true); setError('');
      void rename(draft).then(finish).catch(e => setError(e instanceof Error ? e.message : 'Could not save this name.')).finally(() => setSaving(false));
    }}>
      <label htmlFor="fish-name">Fish name</label>
      <input id="fish-name" autoFocus autoComplete="off" maxLength={MAX_FISH_NAME_LENGTH} value={draft} disabled={saving} onChange={event => setDraft(event.target.value)} placeholder={species} aria-describedby="fish-name-hint"/>
      <p id="fish-name-hint" className="fine-print">Up to 40 characters. Leave blank to use the species name.</p>
      <div className="name-actions"><button type="submit" className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save name'}</button><button type="button" className="secondary" disabled={saving} onClick={finish}>Cancel</button></div>
      {error && <p className="error" role="alert">{error}</p>}
    </form> : <button ref={editButton} className="text-button" onClick={() => { setDraft(record.customName ?? ''); setError(''); setEditing(true); }}>{record.customName ? 'Rename fish' : 'Name fish'}</button>}
  </div>;
}
