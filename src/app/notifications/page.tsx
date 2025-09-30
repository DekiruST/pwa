'use client';
import { useState } from 'react';

export default function NotificationsPage() {
  const [status, setStatus] = useState('');

  const askPermission = async () => {
    const res = await Notification.requestPermission();
    setStatus('Permiso: ' + res);
  };

  const localNotify = async () => {
    if (Notification.permission !== 'granted') return alert('Otorga permiso primero.');
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification('Hola 👋', { body: 'Notificación local de prueba', icon:'/icons/icon-192.png', data:{url:'/'} });
  };

  const subscribePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const resp = await fetch('/api/vapid');
      const { publicKey } = await resp.json();
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub) });
      setStatus('Suscripción registrada en el servidor.');
    } catch (e) {
      setStatus('Error de suscripción: ' + (e as Error).message);
    }
  };

  const triggerPushFromServer = async () => {
    await fetch('/api/send', { method: 'POST' });
    setStatus('Solicitud de envío enviada al servidor (revisa consola del server).');
  };

  return (
    <div className="container">
      <h1>Notificaciones</h1>
      <div className="card">
        <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          <button onClick={askPermission}>Pedir permiso</button>
          <button onClick={localNotify}>Local</button>
          <button onClick={subscribePush}>Suscribir Push</button>
          <button onClick={triggerPushFromServer}>Enviar Push (servidor)</button>
        </div>
        <p className="muted" style={{marginTop:'.5rem'}}>{status}</p>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}
