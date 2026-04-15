import { useState, useEffect, useRef, useMemo } from 'react';
import './ScriptOutput.css';

export default function ScriptOutput({ script, loading }) {
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  // Scroll to output when script appears
  useEffect(() => {
    if (script && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [script]);

  // Parse script into paragraphs for better readability
  const paragraphs = useMemo(() => {
    if (!script) return [];
    return script
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [script]);

  const wordCount = useMemo(() => {
    if (!script) return 0;
    return script.split(/\s+/).filter(Boolean).length;
  }, [script]);

  const readTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 150);
    return minutes;
  }, [wordCount]);

  const handleCopy = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = script;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="output-card output-card--loading" ref={outputRef}>
        <div className="output-card__header">
          <div className="output-card__title-group">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--subtitle" />
          </div>
        </div>
        <div className="output-card__body">
          <div className="skeleton skeleton--line skeleton--full" />
          <div className="skeleton skeleton--line skeleton--80" />
          <div className="skeleton skeleton--line skeleton--90" />
          <div className="skeleton skeleton--line skeleton--70" />
          <div className="skeleton skeleton--line skeleton--full" />
          <div className="skeleton skeleton--line skeleton--85" />
          <div className="skeleton skeleton--line skeleton--60" />
        </div>
      </div>
    );
  }

  if (!script) return null;

  return (
    <div className="output-card" ref={outputRef}>
      {/* Header */}
      <div className="output-card__header">
        <div className="output-card__title-group">
          <h2 className="output-card__title">Your Script</h2>
          <div className="output-card__meta">
            <span className="output-card__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {wordCount.toLocaleString()} words
            </span>
            <span className="output-card__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              ~{readTime} min read
            </span>
          </div>
        </div>

        <button
          className={`copy-button ${copied ? 'copy-button--copied' : ''}`}
          onClick={handleCopy}
          id="copy-script-btn"
          aria-label="Copy script to clipboard"
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Script body */}
      <div className="output-card__body" id="script-output">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="output-card__paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
