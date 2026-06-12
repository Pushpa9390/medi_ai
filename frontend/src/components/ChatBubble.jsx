import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Volume2 } from 'lucide-react';

// Lightweight markdown renderer for chat bubbles
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let keyCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = keyCounter++;

    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(<hr key={key} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />);
      continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={key} style={{ height: '0.4rem' }} />);
      continue;
    }

    // Parse inline markdown: **bold**, *italic*, `code`
    const parsedLine = parseInline(line, key);
    elements.push(<div key={key} style={{ marginBottom: '0.1rem' }}>{parsedLine}</div>);
  }

  return elements;
}

function parseInline(text, lineKey) {
  const parts = [];
  let remaining = text;
  let idx = 0;

  const patterns = [
    { regex: /\*\*(.+?)\*\*/,  render: (m, i) => <strong key={i}>{m[1]}</strong> },
    { regex: /\*(.+?)\*/,      render: (m, i) => <em key={i} style={{ fontStyle: 'italic' }}>{m[1]}</em> },
    { regex: /`(.+?)`/,        render: (m, i) => <code key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1px 5px', fontFamily: 'monospace', fontSize: '0.85em' }}>{m[1]}</code> },
  ];

  while (remaining.length > 0) {
    let earliestIndex = Infinity;
    let matchedPattern = null;
    let matchResult = null;

    for (const p of patterns) {
      const m = p.regex.exec(remaining);
      if (m && m.index < earliestIndex) {
        earliestIndex = m.index;
        matchedPattern = p;
        matchResult = m;
      }
    }

    if (!matchedPattern) {
      parts.push(<span key={`${lineKey}-t-${idx}`}>{remaining}</span>);
      break;
    }

    if (earliestIndex > 0) {
      parts.push(<span key={`${lineKey}-t-${idx++}`}>{remaining.slice(0, earliestIndex)}</span>);
    }

    parts.push(matchedPattern.render(matchResult, `${lineKey}-m-${idx++}`));
    remaining = remaining.slice(earliestIndex + matchResult[0].length);
  }

  return parts;
}

export default function ChatBubble({ message, onSpeak }) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
        {isUser ? (
          <>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You</span>
            <User size={12} className="text-sky-400" />
          </>
        ) : (
          <>
            <Bot size={12} className="text-emerald-400" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MediAssist AI</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', width: '100%', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ position: 'relative' }}>
          {isUser ? (
            <p style={{ margin: 0, fontSize: '0.92rem' }}>{message.text}</p>
          ) : (
            <div style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65 }}>
              {renderMarkdown(message.text)}
            </div>
          )}

          {/* Consultation metadata if exists */}
          {message.metadata && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {message.metadata.severity && (
                <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  <span>Severity:</span>
                  <span className={`text-${message.metadata.severity === 'high' ? 'red' : 'orange'}-400`}>
                    {message.metadata.severity.toUpperCase()}
                  </span>
                </div>
              )}
              {message.metadata.suggestions && (
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  <strong>Next steps:</strong> {message.metadata.suggestions}
                </div>
              )}
            </div>
          )}
        </div>

        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.text)}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              flexShrink: 0,
              marginTop: '0.25rem'
            }}
            title="Listen to explanation"
          >
            <Volume2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
