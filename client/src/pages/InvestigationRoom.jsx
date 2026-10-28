import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClueCard, SuspectCard } from '../components/CaseCards';
import { ErrorMessage, LoadingState } from '../components/Layout';
import { discoverClue, getCase, messageFrom, requestHint } from '../services/api';

export default function InvestigationRoom() {
  const { id } = useParams(); const [mystery, setMystery] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(''); const [hints, setHints] = useState([]);
  const load = () => getCase(id).then(setMystery).catch((e) => setError(messageFrom(e)));
  useEffect(() => { load(); }, [id]);
  async function findClue(clueId) { setBusy(clueId); setError(''); try { const data = await discoverClue(id, clueId); setMystery((current) => ({ ...current, clues: current.clues.map((clue) => clue.id === clueId ? { ...clue, ...data.clue, status: 'discovered' } : clue), progress: { ...current.progress, ...data.progress } })); } catch (e) { setError(messageFrom(e)); } finally { setBusy(''); } }
  async function getHint() { setBusy('hint'); setError(''); try { const data = await requestHint(id); setHints((current) => [...current, data.hint]); setMystery((current) => ({ ...current, progress: { ...current.progress, hintsUsed: data.hintsUsed } })); } catch (e) { setError(messageFrom(e)); } finally { setBusy(''); } }
  if (error && !mystery) return <div className="space-y-4"><ErrorMessage>{error}</ErrorMessage><Link className="button" to="/create">Create a new mystery</Link></div>;
  if (!mystery) return <LoadingState text="Opening your case file…" />;
  const total = mystery.clues.length; const remainingHints = ({ easy: 2, medium: 3, hard: 3 })[mystery.difficulty] - mystery.progress.hintsUsed;
  return <section><div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-wine">{mystery.difficulty} case · Investigation</p><h1 className="mt-2 font-display text-4xl font-bold">{mystery.title}</h1></div><div className="rounded-lg bg-ink px-4 py-3 text-sm text-white"><strong>{mystery.progress.discoveredClues.length}/{total}</strong> clues · <strong>{mystery.progress.hintsUsed}</strong> hints used</div></div>
    {error && <div className="mt-5"><ErrorMessage>{error}</ErrorMessage></div>}
    <article className="card mt-6 border-l-4 border-l-gold"><h2 className="font-display text-xl font-bold">The case</h2><p className="mt-3 whitespace-pre-line leading-7 text-ink/80">{mystery.story}</p></article>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]"><div><h2 className="font-display text-3xl font-bold">Persons of interest</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{mystery.suspects.map((suspect) => <SuspectCard key={suspect.id} suspect={suspect} />)}</div><h2 className="mt-10 font-display text-3xl font-bold">Evidence to investigate</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{mystery.clues.map((clue) => <ClueCard key={clue.id} clue={clue} busy={busy === clue.id} onDiscover={() => findClue(clue.id)} />)}</div></div>
      <aside className="space-y-5"><div className="card sticky top-5"><h2 className="font-display text-2xl font-bold">Detective’s notes</h2><p className="mt-2 text-sm text-ink/70">Hints remaining: {remainingHints}</p><button type="button" className="button mt-4 w-full" disabled={busy === 'hint' || remainingHints <= 0} onClick={getHint}>{busy === 'hint' ? 'Considering…' : 'Request hint'}</button>{hints.length > 0 && <ol className="mt-5 space-y-3">{hints.map((hint, index) => <li key={`${hint}-${index}`} className="border-l-2 border-gold pl-3 text-sm leading-6"><span className="font-semibold">Hint {index + 1}:</span> {hint}</li>)}</ol>}</div><Link to={`/case/${id}/accuse`} className="button w-full">Make final accusation</Link><p className="text-center text-xs text-ink/55">You may accuse at any time. This cannot be undone.</p></aside>
    </div>
  </section>;
}
