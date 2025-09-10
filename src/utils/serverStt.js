// Placeholder server-side STT integration helpers
// Replace PLACEHOLDER_ENDPOINT and add auth if needed.

export async function uploadAudioForTranscription(file) {
  const url = process.env.PLACEHOLDER_STT_ENDPOINT || 'https://PLACEHOLDER_ENDPOINT/transcribe';
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: form,
      headers: {
        // 'Authorization': `Bearer ${process.env.PLACEHOLDER_API_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    /** Expected JSON shape:
     * {
     *   "text": "full transcript",
     *   "segments": [ { "text": "...", "confidence": 0.92, "timestampMs": 1700000000000 } ]
     * }
     */
    return await res.json();
  } catch (e) {
    console.error('Server STT failed', e);
    throw e;
  }
}


