export function SuspectCard({ suspect, selectable, selected, onSelect }) {
  const body = <><h3 className="font-display text-xl font-bold">{suspect.name}</h3><p className="mt-2 text-sm leading-6 text-ink/75">{suspect.description}</p><p className="mt-3 border-l-2 border-gold pl-3 text-sm"><span className="font-semibold">Motive:</span> {suspect.motive}</p></>;
  if (!selectable) return <article className="card">{body}</article>;
  return <button type="button" onClick={onSelect} className={`card w-full text-left transition hover:border-wine ${selected ? 'border-2 border-wine bg-red-50' : ''}`} aria-pressed={selected}>{body}<span className="mt-4 block font-semibold text-wine">{selected ? 'Selected for accusation' : 'Select this suspect'}</span></button>;
}

export function ClueCard({ clue, onDiscover, busy }) {
  const found = clue.status === 'discovered';
  return <article className={`card ${found ? 'border-gold/50 bg-amber-50/40' : ''}`}>
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">{clue.title}</h3><p className="mt-1 text-sm text-ink/60">{clue.location}</p></div><span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold">{found ? 'Found' : 'Available'}</span></div>
    {found && <p className="mt-4 text-sm leading-6">{clue.text}</p>}
    {!found && <button type="button" className="button-secondary mt-4 w-full" onClick={onDiscover} disabled={busy}>{busy ? 'Searching…' : 'Investigate clue'}</button>}
  </article>;
}
