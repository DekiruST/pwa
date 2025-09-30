import { NextResponse } from 'next/server';

let mem: any[] = [];

export async function POST(req: Request) {
  const sub = await req.json();
  try {
    // Try to persist to a temp file (works in local dev)
    const fs = await import('node:fs/promises');
    const path = '/tmp/subscriptions.json';
    try {
      const prev = JSON.parse(await fs.readFile(path, 'utf-8'));
      if (Array.isArray(prev)) mem = prev;
    } catch {}
    mem.push(sub);
    await fs.writeFile(path, JSON.stringify(mem, null, 2));
  } catch {
    // fallback to memory
    mem.push(sub);
  }
  return NextResponse.json({ ok: true, count: mem.length });
}

export async function GET() {
  try {
    const fs = await import('node:fs/promises');
    const path = '/tmp/subscriptions.json';
    const data = JSON.parse(await fs.readFile(path, 'utf-8'));
    return NextResponse.json({ subs: data });
  } catch {
    return NextResponse.json({ subs: mem });
  }
}
