import { useState, useCallback } from 'react';
import Header from './components/Header';
import ScriptForm from './components/ScriptForm';
import ScriptOutput from './components/ScriptOutput';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('Dramatic');
  const [length, setLength] = useState(1);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setScript('');

    try {
      const res = await fetch(`${API_URL}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), tone, length }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setScript(data.script);
    } catch (err) {
      setError(
        err.name === 'TypeError'
          ? 'Unable to reach the server. Please check your connection.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [idea, tone, length]);

  return (
    <>
      <Header />

      <main className="main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            AI-Powered Script Writing
          </div>
          <h1 className="hero-title">
            Create YouTube Scripts<br />
            <span className="hero-title__accent">in seconds, not hours.</span>
          </h1>
          <p className="hero-description">
            Describe your video idea, pick a tone and length — get a polished,
            ready-to-record script powered by AI.
          </p>
        </section>

        {/* Form Card */}
        <section className="form-card">
          <ScriptForm
            idea={idea}
            tone={tone}
            length={length}
            loading={loading}
            onIdeaChange={setIdea}
            onToneChange={setTone}
            onLengthChange={setLength}
            onSubmit={handleGenerate}
          />
        </section>

        {/* Error */}
        <ErrorMessage message={error} />

        {/* Output */}
        <ScriptOutput script={script} loading={loading} />
      </main>

      <Footer />
    </>
  );
}