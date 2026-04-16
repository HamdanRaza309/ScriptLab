
import { useState, useEffect, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
// Export script as PDF using jsPDF
function exportToPDF(script) {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(script, 180);
  doc.text(lines, 15, 20);
  doc.save('script.pdf');
}

// Export script as Word (.doc) using Blob and FileSaver
function exportToWord(script) {
  // Convert plain text to HTML, preserving line breaks
  const html = `<html><head><meta charset='utf-8'></head><body><pre style="font-family:inherit;">${script.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>')
    }</pre></body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  saveAs(blob, 'script.doc');
}
import './ScriptOutput.css';

// Parse script into blocks: { type: 'heading'|'paragraph', text: string }
function parseScriptBlocks(script) {
  if (!script) return [];
  const lines = script.split(/\r?\n/);
  const blocks = [];
  const headingRegex = /^(Hook|Setup\/Context|Key Section \d+|Conclusion\/CTA):?\s*(.*)$/i;
  let currentParagraph = [];

  for (let line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      // Push any accumulated paragraph
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'paragraph', text: currentParagraph.join(' ').trim() });
        currentParagraph = [];
      }
      // Heading block
      blocks.push({ type: 'heading', text: match[1] });
      if (match[2] && match[2].trim()) {
        currentParagraph.push(match[2].trim());
      }
    } else if (line.trim() !== '') {
      currentParagraph.push(line.trim());
    }
  }
  if (currentParagraph.length > 0) {
    blocks.push({ type: 'paragraph', text: currentParagraph.join(' ').trim() });
  }
  return blocks;
}

function stripStructureHeadings(text) {
  return String(text || '')
    .split('\n')
    .filter((line) => !/^(Hook|Setup\/Context|Key Section \d+|Conclusion\/CTA):?\s*$/i.test(line.trim()))
    .join('\n')
    .trim();
}

export default function ScriptOutput({ script, loading, wordCount: serverWordCount = 0 }) {
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);
  const isRefreshing = loading && Boolean(script);

  // Scroll to output when script appears
  useEffect(() => {
    if (script && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [script]);


  // Parse script into blocks (headings and paragraphs)
  const blocks = useMemo(() => parseScriptBlocks(script), [script]);

  const wordCount = useMemo(() => {
    if (!script) return 0;
    if (serverWordCount > 0) return serverWordCount;
    return stripStructureHeadings(script).split(/\s+/).filter(Boolean).length;
  }, [script, serverWordCount]);

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
  if (loading && !script) {
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
            {isRefreshing ? (
              <span className="output-card__badge output-card__badge--loading">
                <span className="output-card__status-dot" aria-hidden="true" />
                Updating draft
              </span>
            ) : null}
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`copy-button ${copied ? 'copy-button--copied' : ''}`}
            onClick={handleCopy}
            id="copy-script-btn"
            aria-label="Copy script to clipboard"
            disabled={loading && !script}
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
          <button
            className="copy-button"
            style={{ minWidth: 90 }}
            onClick={() => exportToPDF(script)}
            aria-label="Export script as PDF"
            disabled={loading && !script}
          >
            Export PDF
          </button>
          <button
            className="copy-button"
            style={{ minWidth: 90 }}
            onClick={() => exportToWord(script)}
            aria-label="Export script as Word"
            disabled={loading && !script}
          >
            Export Word
          </button>
        </div>
      </div>

      {/* Script body with headings */}
      <div className="output-card__body" id="script-output">
        {blocks.map((block, idx) => {
          if (block.type === 'heading') {
            // Style headings differently
            let headingClass = 'script-heading';
            if (/^Hook$/i.test(block.text)) headingClass += ' script-heading--hook';
            else if (/^Setup\/Context$/i.test(block.text)) headingClass += ' script-heading--setup';
            else if (/^Key Section \d+$/i.test(block.text)) headingClass += ' script-heading--key';
            else if (/^Conclusion\/CTA$/i.test(block.text)) headingClass += ' script-heading--conclusion';
            return (
              <div key={idx} className={headingClass}>{block.text}</div>
            );
          }
          return (
            <p key={idx} className="output-card__paragraph">{block.text}</p>
          );
        })}
      </div>
    </div>
  );
}
