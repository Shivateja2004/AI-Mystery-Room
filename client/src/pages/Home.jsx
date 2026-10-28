import { Link } from 'react-router-dom';

export default function Home() {
  return <section className="py-10 text-center sm:py-20">
    <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-wine">A case awaits</p>
    <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight sm:text-7xl">Every detail has a story.</h1>
    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink/70">Give us a premise. We’ll build a mystery. Follow the clues, weigh each motive, and make your one final accusation.</p>
    <Link to="/create" className="button mt-8 px-6 py-3 text-lg">Start a mystery</Link>
    <div className="mx-auto mt-16 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
      {[['01', 'Set the scene', 'Choose a premise and your level of challenge.'], ['02', 'Investigate', 'Uncover evidence and request a nudge if needed.'], ['03', 'Accuse', 'Name the culprit and see whether your case holds.']].map(([number, title, text]) => <article key={number} className="card"><span className="text-sm font-bold text-gold">{number}</span><h2 className="mt-3 font-display text-2xl font-bold">{title}</h2><p className="mt-2 leading-6 text-ink/70">{text}</p></article>)}
    </div>
  </section>;
}
