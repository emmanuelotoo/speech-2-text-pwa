import React from 'react';

export default function TranscriptView({ segments, interimText, onSegmentsChange }) {
  const onEdit = (index, newText) => {
    const next = [...segments];
    next[index] = { ...next[index], text: newText };
    onSegmentsChange(next);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h2 className="font-medium mb-2">Transcript</h2>
      <div role="log" aria-live="polite" aria-relevant="additions text" className="space-y-3">
        {segments.map((seg, idx) => (
          <div key={idx} className="border border-slate-200 rounded p-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{seg.isFinal ? 'Final' : 'Interim'} • {seg.confidence != null ? `conf ${(seg.confidence * 100).toFixed(0)}%` : 'conf n/a'}</span>
              <span>{new Date(seg.timestampMs).toLocaleTimeString()}</span>
            </div>
            <textarea
              className="w-full resize-y min-h-[60px] p-2 border rounded"
              value={seg.text}
              onChange={(e) => onEdit(idx, e.target.value)}
            />
          </div>
        ))}
        {interimText && (
          <div className="border border-dashed border-slate-300 rounded p-2 bg-slate-50">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Interim</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="p-2 text-slate-700">{interimText}</div>
          </div>
        )}
      </div>
    </div>
  );
}


