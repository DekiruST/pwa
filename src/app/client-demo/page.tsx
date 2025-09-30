'use client';
import { useEffect, useState } from 'react';

export default function ClientDemoPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        setPosts(await res.json());
        setOnline(true);
      } catch {
        setOnline(false);
        const cached = await caches.match('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (cached) setPosts(await cached.json());
      }
    };
    load();
  }, []);

  return (
    <div className="container">
      <h1>CSR (Client Components)</h1>
      <p className="muted">Carga en el cliente. {online ? 'En línea' : 'Sin conexión (desde cache)'}.</p>
      <ul>
        {posts.map((p) => (<li key={p.id}><strong>{p.title}</strong><br/><span className="muted">{p.body}</span></li>))}
      </ul>
    </div>
  );
}
