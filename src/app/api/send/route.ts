import { NextResponse } from 'next/server';

export async function POST() {
  const webPush = await import('web-push');
  const vapidPublic = process.env.VAPID_PUBLIC_KEY || '';
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || '';
  const vapidEmail = process.env.VAPID_SUBJECT || 'mailto:dev@example.com';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ ok: false, error: 'Faltan VAPID keys (VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY)' }, { status: 500 });
  }

  webPush.default.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  let subs: any[] = [];
  try {
    const fs = await import('node:fs/promises');
    const path = '/tmp/subscriptions.json';
    subs = JSON.parse(await fs.readFile(path, 'utf-8'));
  } catch {}

  const payload = JSON.stringify({ title: 'PWA CS — Push', body: 'Hola desde el servidor 👋', url: '/' });
  const results = await Promise.allSettled(subs.map((s) => webPush.default.sendNotification(s, payload)));

  return NextResponse.json({ ok: true, sent: results.length });
}
