'use client';
import { useEffect, useState } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'pwa-cs-db';
const STORE = 'notes';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export default function NotesPage() {
  const [list, setList] = useState<any[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    const db = await getDB();
    setList(await db.getAll(STORE));
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    const db = await getDB();
    await db.add(STORE, { text, createdAt: Date.now() });
    setText('');
    load();
  };

  const syncAll = async () => {
    const payload = { notes: list };
    try {
      await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Sincronizado con el servidor (echo).');
    } catch {
      // Offline: encolar para Background Sync si está disponible
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;

        // Guardamos el trabajo en el SW (IndexedDB del SW)
        const msg = { url: '/api/echo', body: payload };
        await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg)
        });

        // TS no conoce reg.sync -> hacemos un cast seguro
        const anyReg = reg as unknown as { sync?: { register: (tag: string) => Promise<void> } };
        if (anyReg?.sync?.register) {
          await anyReg.sync.register('sync-posts');
          alert('Sin conexión: encolado para Background Sync.');
        } else {
          alert('Sin conexión: se guardó en cola; se enviará al reconectar (sin SyncManager).');
        }
      } else {
        alert('Sin conexión y sin Service Worker.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Notas Offline</h1>
      <div className="card">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe una nota..."
          style={{
            width: '100%',
            padding: '.6rem',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: 'transparent',
            color: 'white'
          }}
        />
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.6rem' }}>
          <button onClick={add}>Guardar local</button>
          <button onClick={syncAll}>Sincronizar</button>
        </div>
      </div>
      <ul>
        {list.map(n => (
          <li key={n.id}>
            <strong>Nota #{n.id}:</strong> <span className="muted">{n.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
