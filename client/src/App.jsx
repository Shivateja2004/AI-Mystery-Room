import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';

function NotFound() { return <section className="text-center"><h1 className="font-display text-4xl font-bold">Case file not found</h1><p className="mt-3 text-ink/70">This lead appears to have gone cold.</p></section>; }

export default function App() {
  return <BrowserRouter><Layout><Routes><Route path="/" element={<Home />} /><Route path="/create" element={<CreateMystery />} /><Route path="/case/:id" element={<InvestigationRoom />} /><Route path="/case/:id/accuse" element={<Accusation />} /><Route path="/case/:id/results" element={<Results />} /><Route path="*" element={<NotFound />} /></Routes></Layout></BrowserRouter>;
}
