import fs from 'node:fs';
import webpush from 'web-push';

const PUBLIC = process.env.VAPID_PUBLIC_KEY;
const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:dev@example.com';

if (!PUBLIC || !PRIVATE) {
  console.error('Faltan VAPID keys. Usa: npm run gen:vapid');
  process.exit(1);
}

webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);

const path = '/tmp/subscriptions.json';
const subs = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : [];
const payload = JSON.stringify({ title: 'PWA CS — Push', body: 'Enviado desde scripts/send-push.js', url: '/' });

Promise.allSettled(subs.map((s)=> webpush.sendNotification(s, payload)))
  .then((res)=> { console.log('Notificaciones enviadas:', res.length); process.exit(0); })
  .catch((e)=> { console.error(e); process.exit(1); });
