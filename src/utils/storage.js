import { openDB } from 'idb';

const DB_NAME = 'speakwrite-db';
const STORE = 'transcripts';

async function getDb() {
  try {
    return await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  } catch (e) {
    return null;
  }
}

export async function saveTranscript(segments) {
  const db = await getDb();
  if (db) {
    await db.put(STORE, segments, 'latest');
  } else {
    localStorage.setItem('speakwrite_latest', JSON.stringify(segments));
  }
}

export async function loadTranscript() {
  const db = await getDb();
  if (db) {
    return (await db.get(STORE, 'latest')) || [];
  }
  const raw = localStorage.getItem('speakwrite_latest');
  return raw ? JSON.parse(raw) : [];
}


