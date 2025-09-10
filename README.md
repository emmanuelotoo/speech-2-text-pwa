# SpeakWrite — Speech → Text PWA

SpeakWrite is a Progressive Web App that transcribes speech to editable text in real time using the Web Speech API. It works offline for the UI (PWA app shell) and stores transcripts locally.

## Features
- Real-time speech-to-text with interim and final results
- Confidence (when provided) and timestamps per segment
- Start/Stop controls, simulated mic level indicator
- Persist transcripts in IndexedDB (fallback: localStorage)
- Export to .txt and copy to clipboard
- Language selector (default `en-US`)
- Installable PWA with offline app shell
- Debug panel for Web Speech API events
- Fallback instructions and stub for server-side STT (Whisper/3rd-party)

## Tech Stack
- React + Vite
- Tailwind CSS
- PWA: manifest + service worker

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open the app at the URL shown by Vite (usually `http://localhost:5173`).

## Project Structure

```
.
├─ index.html
├─ public/
│  ├─ manifest.json
│  ├─ sw.js
│  └─ icons/
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  ├─ index.css
│  ├─ components/
│  │  ├─ InstallPrompt.jsx
│  │  ├─ MicControls.jsx
│  │  └─ TranscriptView.jsx
│  ├─ utils/
│  │  ├─ io.js
│  │  ├─ serverStt.js
│  │  ├─ storage.js
│  │  └─ useSpeechRecognition.js
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
└─ package.json
```

## Usage Tips
- Click Start to begin recognition. Grant microphone permission.
- Edit any segment inline; changes persist locally.
- Use Export .txt or Copy All to extract the transcript.

## Accessibility
- Buttons are keyboard-accessible and have ARIA labels.
- Transcript container uses `aria-live` so new content is announced.

## Service Worker & Caching
- The service worker caches the app shell with a cache-first strategy.
- It serves cached assets offline. Speech recognition requires online services of the browser/OS and may not work offline.

## Testing in Chrome
- Ensure microphone permission is granted.
- If recognition doesn’t start, check Console for errors (some platforms require HTTPS or localhost).
- Optionally, try `chrome://flags` to enable experimental features on some platforms.

## Testing on Mobile
- On Android Chrome, open the dev server URL over local network (`npm run dev -- --host`).
- Add to Home Screen to install the PWA.
- iOS Safari may have limited/experimental Web Speech API; consider server-side fallback.

## Server-side STT Fallback

You can integrate an external STT service by replacing placeholder code in `src/utils/serverStt.js`. Example patterns:

### Example: OpenAI Whisper (server-hosted)
Your server exposes `POST /transcribe` accepting `multipart/form-data` with `file`.

```bash
curl -X POST \
  -H "Authorization: Bearer PLACEHOLDER_API_KEY" \
  -F file=@sample.wav \
  https://PLACEHOLDER_ENDPOINT/transcribe
```

Expected response:
```json
{
  "text": "full transcript",
  "segments": [
    { "text": "Hello world", "confidence": 0.92, "timestampMs": 1700000000000 }
  ]
}
```

### Example: AssemblyAI
```
POST https://api.assemblyai.com/v2/transcript
Authorization: Bearer PLACEHOLDER_ASSEMBLYAI_KEY
Content-Type: application/json

{
  "audio_url": "https://your-storage/audio.wav"
}
```

Then poll for status and map the response to `{ text, segments[] }` shape used by the app.

### Wiring into UI
- Implement `uploadAudioForTranscription(file)` in `src/utils/serverStt.js`.
- In `MicControls.jsx`, replace the `onChange` handler of the file input to call your function, then merge returned segments into app state.

## Unit Testing Hints
- Use React Testing Library to render `TranscriptView` and simulate text edits.
- Mock `useSpeechRecognition` to emit interim and final segments; assert UI updates.

## License
MIT
