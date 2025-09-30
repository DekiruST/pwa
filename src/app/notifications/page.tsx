'use client';
import { useEffect, useState } from 'react';

type Perm = 'granted' | 'denied' | 'prompt' | 'unsupported';

export default function NotificationsPage() {
  const [notifStatus, setNotifStatus] = useState<Perm>('unsupported');
  const [swReady, setSwReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (m: string) => setLogs((L) => [new Date().toLocaleTimeString() + ' ' + m, ...L]);

  useEffect(() => {
    // Estado inicial
    if ('Notification' in window) {
      setNotifStatus(Notification.permission as Perm);
      log(`Notification.permission = ${Notification.permission}`);
    } else {
      log('Notifications no soportadas en este navegador.');
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwReady(true);
        log('ServiceWorker READY');
      }).catch(e => log('SW ready error: ' + (e as Error).message));
    } else {
      log('ServiceWorker no soportado.');
    }
  }, []);

  const askPermission = async () => {
    try {
      if (!('Notification' in window)) {
        log('API Notifications no soportada.');
        alert('Este navegador no soporta notificaciones.');
        return;
      }
      // Chrome/Edge devuelven promesa, Safari antiguo usa callback.
      let res: NotificationPermission;
      const p: any = Notification.requestPermission as any;
      if (p.length === 1) {
        // callback style
        res = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission((r: NotificationPermission) => resolve(r));
        });
      } else {
        res = await Notification.requestPermission();
      }
      setNotifStatus(res as Perm);
      log('requestPermission() => ' + res);
      alert('Permiso de notificaciones: ' + res);
    } catch (e) {
      log('Error requestPermission: ' + (e as Error).message);
      alert('Error pidiendo permiso: ' + (e as Error).message);
    }
  };

  const localNotify = async () => {
    try {
      if (Notification.permission !== 'granted') {
        alert('Otorga permiso primero.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Hola 👋', {
        body: 'Notificación local de prueba',
        icon: '/icons/icon-192.png',
        data: { url: '/' }
      });
      log('showNotification enviado');
    } catch (e) {
      log('Error localNotify: ' + (e as Error).message);
      alert('Error mostrando notificación: ' + (e as Error).message);
    }
  };

  const subscribePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const resp = await fetch('/api/vapid');
      const { publicKey } = await resp.json();
      if (!publicKey) throw new Error('VAPID_PUBLIC_KEY vacío');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub) });
      log('Suscripción push registrada');
      alert('Suscripción push registrada.');
    } catch (e) {
      log('Error subscribePush: ' + (e as Error).message);
      alert('Error al suscribir push: ' + (e as Error).message);
    }
  };

  const sendPush = async () => {
    try {
      const r = await fetch('/api/send', { method: 'POST' });
      const j = await r.json().catch(()=> ({}));
      log('API send => ' + r.status + ' ' + JSON.stringify(j));
      alert('Servidor respondió: ' + r.status);
    } catch (e) {
      log('Error sendPush: ' + (e as Error).message);
      alert('Error al solicitar envío push: ' + (e as Error).message);
    }
  };

  return (
    <div className="container">
      <h1>Notificaciones</h1>
      <div className="card" style={{ display:'grid', gap:'.5rem' }}>
        <div><strong>Notification.permission:</strong> {notifStatus}</div>
        <div><strong>Service Worker listo:</strong> {swReady ? 'sí' : 'no'}</div>
        <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.5rem' }}>
          <button onClick={askPermission}>Pedir permiso</button>
          <button onClick={localNotify}>Local</button>
          <button onClick={subscribePush}>Suscribir Push</button>
          <button onClick={sendPush}>Enviar Push (servidor)</button>
        </div>
      </div>

      <div className="card" style={{ marginTop:'1rem' }}>
        <strong>Logs</strong>
        <ul style={{ marginTop:'.5rem' }}>
          {logs.map((l, i) => <li key={i} className="muted" style={{fontFamily:'monospace'}}>{l}</li>)}
        </ul>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
