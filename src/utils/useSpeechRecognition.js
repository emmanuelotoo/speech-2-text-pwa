// Minimal Web Speech API hook with interim results, confidence, timestamps and a simulated mic level
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SpeechRecognitionImpl = typeof window !== 'undefined' && (
  window.SpeechRecognition || window.webkitSpeechRecognition
);

export function useSpeechRecognition({ language = 'en-US' } = {}) {
  const isSupported = Boolean(SpeechRecognitionImpl);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0); // 0..1 simulated
  const [debugEvents, setDebugEvents] = useState([]);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(null);
  const rafRef = useRef(0);

  const pushDebug = useCallback((type, payload) => {
    setDebugEvents((prev) => [
      ...prev.slice(-200),
      { t: Date.now(), type, payload },
    ]);
  }, []);

  // Simulate mic level using random walk when listening
  useEffect(() => {
    if (!isListening) return;
    let current = 0.1;
    const step = () => {
      current += (Math.random() - 0.5) * 0.2;
      current = Math.max(0, Math.min(1, current));
      setLevel(current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isListening]);

  const start = useCallback(({ onResult } = {}) => {
    if (!isSupported || isListening) return;
    onResultRef.current = onResult || null;
    setError(null);
    setInterimText('');

    const rec = new SpeechRecognitionImpl();
    recognitionRef.current = rec;
    rec.lang = language;
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      pushDebug('onstart');
    };
    rec.onerror = (e) => {
      setError(e.error || 'speech_error');
      pushDebug('onerror', e.error);
    };
    rec.onend = () => {
      setIsListening(false);
      pushDebug('onend');
    };
    rec.onresult = (event) => {
      pushDebug('onresult', {
        resultIndex: event.resultIndex,
        length: event.results.length,
      });
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i][0];
        if (!res) continue;
        const isFinal = event.results[i].isFinal;
        const segment = {
          text: res.transcript,
          confidence: res.confidence ?? null,
          timestampMs: Date.now(),
          isFinal,
        };
        if (isFinal) {
          setInterimText('');
          if (onResultRef.current) onResultRef.current(segment);
        } else {
          interim += res.transcript;
        }
      }
      setInterimText(interim);
    };

    try {
      rec.start();
    } catch (e) {
      // Some browsers throw if called too quickly
      setError(e?.message || 'failed_to_start');
      pushDebug('start_exception', String(e));
    }
  }, [isSupported, isListening, language, pushDebug]);

  const stop = useCallback(() => {
    setInterimText('');
    try {
      recognitionRef.current?.stop();
    } catch {}
  }, []);

  useEffect(() => () => {
    try {
      recognitionRef.current?.abort?.();
    } catch {}
  }, []);

  return useMemo(() => ({
    isSupported,
    isListening,
    start,
    stop,
    interimText,
    error,
    level,
    debugEvents,
  }), [isSupported, isListening, start, stop, interimText, error, level, debugEvents]);
}


