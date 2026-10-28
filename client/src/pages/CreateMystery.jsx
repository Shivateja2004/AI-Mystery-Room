import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase, messageFrom } from '../services/api';
import { ErrorMessage } from '../components/Layout';

const suggestions = [
  'A rare painting disappears during a museum gala while every guest claims to have been in the ballroom.',
  'The lead actor vanishes moments before a sold-out premiere, leaving a cryptic note inside a prop book.',
  'A prized prototype is stolen from a mountain research station during an overnight snowstorm.'
];

export default function CreateMystery() {
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    if (premise.trim().length < 20 || premise.trim().length > 500) return setError('Your premise must be between 20 and 500 characters.');
    setLoading(true); setError('');
    try { const mystery = await createCase({ premise, difficulty }); navigate(`/case/${mystery.id}`); }
    catch (requestError) { setError(messageFrom(requestError)); }
    finally { setLoading(false); }
  }
  return <section className="mx-auto max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-wine">Case file</p><h1 className="mt-2 font-display text-4xl font-bold">Create a mystery</h1><p className="mt-3 text-ink/70">Set the scene. Our investigators will take it from there.</p>
    <form onSubmit={submit} className="card mt-8 space-y-6">
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div><label className="label" htmlFor="premise">Premise</label><textarea id="premise" className="field min-h-36 resize-y" value={premise} onChange={(event) => setPremise(event.target.value)} placeholder="A valuable object goes missing in an impossible setting…" maxLength="500" required /><div className="mt-1 text-right text-xs text-ink/55">{premise.length}/500 characters</div></div>
      <div><span className="label">Difficulty</span><div className="grid gap-3 sm:grid-cols-3">{[['easy', 'Easy', '3 suspects · 5 clues'], ['medium', 'Medium', '4 suspects · 7 clues'], ['hard', 'Hard', '5 suspects · 9 clues']].map(([value, label, description]) => <label key={value} className={`cursor-pointer rounded-lg border p-3 ${difficulty === value ? 'border-wine bg-red-50' : 'border-ink/15'}`}><input className="sr-only" type="radio" name="difficulty" value={value} checked={difficulty === value} onChange={() => setDifficulty(value)} /><span className="block font-bold">{label}</span><span className="text-xs text-ink/65">{description}</span></label>)}</div></div>
      <div><button type="button" className="text-sm font-semibold text-wine hover:underline" onClick={() => setPremise(suggestions[Math.floor(Math.random() * suggestions.length)])}>Use a suggested premise</button></div>
      <button className="button w-full" disabled={loading}>{loading ? 'Generating your case…' : 'Open case file'}</button>
    </form>
  </section>;
}
