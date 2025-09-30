import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSR Demo — PWA CS'
};

export default async function ServerDemoPage() {
  // Server-side fetch
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', { cache: 'no-store' });
  const posts = await res.json();

  return (
    <div className="container">
      <h1>SSR (Server Components)</h1>
      <p className="muted">Datos cargados en el servidor (no-store) para demostrar SSR.</p>
      <ul>
        {posts.map((p: any) => (<li key={p.id}><strong>{p.title}</strong><br/><span className="muted">{p.body}</span></li>))}
      </ul>
    </div>
  );
}
