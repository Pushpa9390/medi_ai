import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';

export default function VoiceInput({ onTranscript, placeholder = 'Speak now...' }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US'; // Default language

    rec.onstart = () => {
      setIsListening(true);
      setError('');
    };

    rec.onerror = (e) => {
      console.error(e);
      if (e.error === 'not-allowed') {
        setError('Microphone permission blocked. Please check site permissions.');
      } else {
        setError(`Speech error: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
    };

    recognitionRef.current = rec;
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
      <button
        onClick={toggleListening}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: isListening ? 'var(--gradient-danger)' : 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          color: isListening ? 'white' : 'var(--text-secondary)',
          boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
          transition: 'all 0.3s ease',
        }}
        title={isListening ? 'Stop listening' : 'Start speaking'}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      {isListening && (
        <span style={{ fontSize: '0.7rem', color: '#ef4444', animation: 'pulse-glow 1.5s infinite', fontWeight: 600 }}>
          {placeholder}
        </span>
      )}

      {error && (
        <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <AlertCircle size={10} />
          {error}
        </span>
      )}
    </div>
  );
}

// Global text-to-speech speaker helper function
export function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }
  // Stop ongoing speak
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}
