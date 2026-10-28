import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ErrorMessage, LoadingState } from '../components/Layout';
import { getResult, messageFrom } from '../services/api';

export default function Results() {
  const { id } = useParams(); const location = useLocation(); const [result, setResult] = useState(location.state?.result || null); const [error, setError] = useState('');
  useEffect(() => { if (!result) getResult(id).then(setResult).catch((e) => setError(messageFrom(e))); }, [id, result]);
  if (error) return <section className="mx-auto max-w-xl"><ErrorMessage>{error}</ErrorMessage><Link className="button mt-5" to={`/case/${id}`}>Return to case</Link></section>;
  if (!result) return <LoadingState text="Opening the sealed verdict…" />;
  const rows = [['Base score', result.scoreBreakdown.base], ['Evidence collected', `+${result.scoreBreakdown.cluePoints}`], ['Hints used', `−${result.scoreBreakdown.hintPenalty}`]];
  return <section className="mx-auto max-w-4xl"><div className={`rounded-2xl p-7 text-white ${result.correct ? 'bg-emerald-800' : 'bg-wine'}`}><p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80">Verdict</p><h1 className="mt-2 font-display text-4xl font-bold">{result.correct ? 'Case closed.' : 'Not quite.'}</h1><p className="mt-3 text-lg">The culprit was <strong>{result.culprit.name}</strong>.</p><div className="mt-6 text-5xl font-bold">{result.score}<span className="ml-2 text-lg font-normal">points</span></div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><article className="card"><h2 className="font-display text-3xl font-bold">What happened</h2><p className="mt-4 leading-7 text-ink/80">{result.solution}</p><h3 className="mt-7 font-display text-xl font-bold">The evidence chain</h3><ul className="mt-3 space-y-3">{result.solutionEvidence.map((clue) => <li key={clue.id} className="rounded-lg bg-parchment p-3"><strong>{clue.title}</strong><p className="mt-1 text-sm leading-6 text-ink/75">{clue.text}</p></li>)}</ul></article>
      <aside className="space-y-6"><article className="card"><h2 className="font-display text-2xl font-bold">Score breakdown</h2><dl className="mt-4 space-y-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between text-sm"><dt className="text-ink/70">{label}</dt><dd className="font-bold">{value}</dd></div>)}<div className="flex justify-between border-t border-ink/10 pt-3"><dt className="font-bold">Final score</dt><dd className="font-bold">{result.score}</dd></div></dl></article><article className="card"><h2 className="font-display text-2xl font-bold">Your investigation</h2><p className="mt-3 text-sm text-ink/70">{result.discoveredClues.length} clue{result.discoveredClues.length === 1 ? '' : 's'} discovered · {result.hintsUsed} hint{result.hintsUsed === 1 ? '' : 's'} used</p>{result.discoveredClues.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">{result.discoveredClues.map((clue) => <li key={clue.id}>{clue.title}</li>)}</ul>}</article></aside>
    </div><div className="mt-10 text-center"><Link className="button px-6" to="/create">Play again</Link></div>
  </section>;
}
