import React, { useState } from 'react';
import './App.css';

const TONES = [
  { label: 'Dramatic', value: 'Dramatic' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Uplifting', value: 'Uplifting' }
];
const LENGTHS = [
  { label: '1 min', value: 1 },
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState(TONES[0].value);
  const [length, setLength] = useState(LENGTHS[0].value);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScript('');
    setCopied(false);
    try {
      const res = await fetch(`${API_URL}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tone, length })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate script');
      setScript(data.script);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="container">
      <h1>AI YouTube Script Generator</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Content Idea
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={4}
            required
            placeholder="Enter your video idea..."
          />
        </label>
        <div className="row">
          <label>
            Tone
            <select value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label>
            Length
            <select value={length} onChange={e => setLength(Number(e.target.value))}>
              {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Script'}</button>
      </form>
      {loading && <div className="loading">Generating script...</div>}
      {error && <div className="error">{error}</div>}
      {script && (
        <div className="output-section">
          <div className="output-header">
            <h2>Generated Script</h2>
            <button className="copy-btn" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="script-output">{script}</pre>
        </div>
      )}
      <footer>
        <small>Made for take-home assignment &middot; {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}

export default App;