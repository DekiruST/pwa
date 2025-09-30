'use client';
import { useEffect, useState } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'pwa-cs-db';
const STORE = 'notes';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
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
    // Try to POST to server; if offline, queue via SW + background sync
    const payload = { notes: list };
    try {
      await fetch('/api/echo', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      alert('Sincronizado con el servidor (echo).');
    } catch {
      // Queue in SW
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        // simple queue using IndexedDB in SW
        const msg = { url: '/api/echo', body: payload };
        // send message to SW to persist; we reuse Background Sync tag
        await fetch('/api/queue', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(msg) });
        await reg.sync.register('sync-posts');
        alert('Sin conexión: encolado para Background Sync.');
      } else {
        alert('Sin conexión y SyncManager no disponible.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Notas Offline</h1>
      <div className="card">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Escribe una nota..." style={{width:'100%',padding:'.6rem',borderRadius:'10px',border:'1px solid #334155', background:'transparent', color:'white'}}/>
        <div style={{display:'flex', gap:'.5rem', marginTop:'.6rem'}}>
          <button onClick={add}>Guardar local</button>
          <button onClick={syncAll}>Sincronizar</button>
        </div>
      </div>
      <ul>
        {list.map((n)=> <li key={n.id}><strong>Nota #{n.id}:</strong> <span className="muted">{n.text}</span></li>)}
      </ul>
    </div>
  );
}
