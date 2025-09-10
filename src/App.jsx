import React, { useEffect, useMemo, useState } from 'react';
import MicControls from './components/MicControls.jsx';
import TranscriptView from './components/TranscriptView.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import { useSpeechRecognition } from './utils/useSpeechRecognition.js';
import { saveTranscript, loadTranscript } from './utils/storage.js';
import { copyToClipboard, downloadText } from './utils/io.js';

export default function App() {
  const [language, setLanguage] = useState('en-US');
  const [segments, setSegments] = useState([]); // { text, confidence?, timestampMs, isFinal }
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    isSupported,
    isListening,
    start,
    stop,
    interimText,
    error,
    level,
    debugEvents,
  } = useSpeechRecognition({ language });

  // Load saved transcript on mount
  useEffect(() => {
    (async () => {
      const saved = await loadTranscript();
      if (saved && Array.isArray(saved)) setSegments(saved);
      setIsHydrated(true);
    })();
  }, []);

  // Persist on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveTranscript(segments).catch(() => {});
  }, [segments, isHydrated]);

  const fullText = useMemo(() => {
    const final = segments.map((s) => s.text).join(' ');
    return interimText ? `${final} ${interimText}`.trim() : final;
  }, [segments, interimText]);

  const onResult = (resultSegment) => {
    setSegments((prev) => [...prev, resultSegment]);
  };

  const clearAll = () => setSegments([]);

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-sky-500 text-white grid place-items-center font-bold">S</div>
            <h1 className="text-lg font-semibold">SpeakWrite</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600" htmlFor="lang">Language</label>
            <select
              id="lang"
              className="px-2 py-1 border rounded-md text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Recognition language"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-IN">English (India)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2">
          <TranscriptView
            segments={segments}
            interimText={interimText}
            onSegmentsChange={setSegments}
          />
        </section>

        <aside className="md:col-span-1 space-y-4">
          <MicControls
            isSupported={isSupported}
            isListening={isListening}
            level={level}
            error={error}
            language={language}
            onStart={() => start({ onResult })}
            onStop={stop}
          />

          <div className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
            <h2 className="font-medium">Utilities</h2>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-700"
                onClick={() => downloadText('transcript.txt', segments.map(s => s.text).join(' '))}
              >
                Export .txt
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-slate-700 text-white hover:bg-slate-800"
                onClick={() => copyToClipboard(fullText)}
              >
                Copy All
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                onClick={clearAll}
              >
                Clear
              </button>
            </div>
          </div>

          <InstallPrompt />

          <details className="bg-white rounded-lg shadow-sm border p-4">
            <summary className="cursor-pointer select-none font-medium">Debug Panel</summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap break-all max-h-72 overflow-auto">
{JSON.stringify(debugEvents, null, 2)}
            </pre>
          </details>
        </aside>
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Works offline for UI. Speech recognition requires a supported browser.
      </footer>
    </div>
  );
}


