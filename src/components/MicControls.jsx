import React from 'react';

export default function MicControls({
  isSupported,
  isListening,
  level,
  error,
  language,
  onStart,
  onStop,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <h2 className="font-medium">Microphone</h2>
      {!isSupported && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded">
          Your browser does not support the Web Speech API.
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded" role="alert">
          {String(error)}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Language</span>
        <span className="text-sm font-mono">{language}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
          onClick={onStart}
          disabled={!isSupported || isListening}
          aria-pressed={isListening}
          aria-label="Start listening"
        >
          Start
        </button>
        <button
          className="px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
          onClick={onStop}
          disabled={!isSupported || !isListening}
          aria-label="Stop listening"
        >
          Stop
        </button>
        <div className="flex items-center gap-2 ml-auto" aria-hidden>
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-rose-500 animate-pulseDot' : 'bg-slate-300'}`}></div>
          <span className="text-xs text-slate-600">{isListening ? 'Listening' : 'Idle'}</span>
        </div>
      </div>

      <div className="space-y-1" aria-hidden>
        <div className="text-xs text-slate-500">Mic level</div>
        <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
          <div
            className="h-2 bg-sky-500 transition-all"
            style={{ width: `${Math.round(level * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}


