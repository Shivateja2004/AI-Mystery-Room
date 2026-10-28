import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SuspectCard } from '../components/CaseCards';
import { ErrorMessage, LoadingState } from '../components/Layout';
import { accuse, getCase, messageFrom } from '../services/api';

export default function Accusation() {
  const { id } = useParams(); const navigate = useNavigate(); const [mystery, setMystery] = useState(null); const [selected, setSelected] = useState(''); const [confirming, setConfirming] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { getCase(id).then((data) => { if (data.progress.completed) navigate(`/case/${id}/results`, { replace: true }); else setMystery(data); }).catch((e) => setError(messageFrom(e))); }, [id, navigate]);
  async function submit() { setLoading(true); setError(''); try { const result = await accuse(id, selected); navigate(`/case/${id}/results`, { state: { result }, replace: true }); } catch (e) { setError(messageFrom(e)); setLoading(false); setConfirming(false); } }
  if (error && !mystery) return <ErrorMessage>{error}</ErrorMessage>;
  if (!mystery) return <LoadingState text="Reviewing the case file…" />;
  return <section className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-wine">Final decision</p><h1 className="mt-2 font-display text-4xl font-bold">Who did it?</h1><p className="mt-3 text-ink/70">Choose carefully. There is only one final accusation.</p>{error && <div className="mt-5"><ErrorMessage>{error}</ErrorMessage></div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{mystery.suspects.map((suspect) => <SuspectCard key={suspect.id} suspect={suspect} selectable selected={selected === suspect.id} onSelect={() => setSelected(suspect.id)} />)}</div>
    <div className="mt-8 flex flex-col gap-3 rounded-xl border border-ink/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-ink/70">{selected ? `You are preparing to accuse ${mystery.suspects.find((suspect) => suspect.id === selected)?.name}.` : 'Select a suspect to continue.'}</p><button className="button" disabled={!selected || loading} onClick={() => setConfirming(true)}>Submit accusation</button></div>
    {confirming && <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-20 grid place-items-center bg-ink/50 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 id="confirm-title" className="font-display text-2xl font-bold">Make this final?</h2><p className="mt-3 text-ink/75">Once submitted, the case closes and the solution will be revealed.</p><div className="mt-6 flex justify-end gap-3"><button className="button-secondary" disabled={loading} onClick={() => setConfirming(false)}>Go back</button><button className="button" disabled={loading} onClick={submit}>{loading ? 'Submitting…' : 'Confirm accusation'}</button></div></div></div>}
  </section>;
}
