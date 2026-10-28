import { Link } from 'react-router-dom';

export function Layout({ children }) {
  return <div className="min-h-screen">
    <header className="border-b border-ink/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">AI Mystery Room</Link>
        <Link to="/create" className="text-sm font-semibold text-wine hover:underline">New mystery</Link>
      </nav>
    </header>
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-ink/60">Follow the evidence. Trust no easy answer.</footer>
  </div>;
}

export function LoadingState({ text = 'Loading the case…' }) {
  return <div className="card mx-auto max-w-xl text-center"><div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-ink/15 border-t-wine" /><p>{text}</p></div>;
}

export function ErrorMessage({ children }) {
  return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{children}</div>;
}
