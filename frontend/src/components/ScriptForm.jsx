import { useCallback } from 'react';
import './ScriptForm.css';

const TONES = [
  { label: 'Dramatic', value: 'Dramatic' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'Uplifting', value: 'Uplifting' },
  { label: 'Humorous', value: 'Humorous' },
  { label: 'Educational', value: 'Educational' },
];

const LENGTHS = [
  { label: '1 min', value: 1 },
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
];

export default function ScriptForm({ idea, tone, length, loading, onIdeaChange, onToneChange, onLengthChange, onSubmit }) {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  const isDisabled = loading || !idea.trim();

  return (
    <form className="script-form" onSubmit={handleSubmit}>
      {/* Textarea */}
      <div className="form-group">
        <label className="form-label" htmlFor="script-idea">
          Content Idea
        </label>
        <textarea
          id="script-idea"
          className="form-textarea"
          value={idea}
          onChange={(e) => onIdeaChange(e.target.value)}
          rows={4}
          required
          placeholder="Describe your YouTube video idea… e.g. 'Why most productivity advice is wrong'"
          disabled={loading}
        />
      </div>

      {/* Selects row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="script-tone">
            Tone
          </label>
          <div className="form-select-wrapper">
            <select
              id="script-tone"
              className="form-select"
              value={tone}
              onChange={(e) => onToneChange(e.target.value)}
              disabled={loading}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <svg className="form-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="script-length">
            Length
          </label>
          <div className="form-select-wrapper">
            <select
              id="script-length"
              className="form-select"
              value={length}
              onChange={(e) => onLengthChange(Number(e.target.value))}
              disabled={loading}
            >
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <svg className="form-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="form-submit"
        disabled={isDisabled}
        id="generate-btn"
      >
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Generating…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Script
          </>
        )}
      </button>
    </form>
  );
}
