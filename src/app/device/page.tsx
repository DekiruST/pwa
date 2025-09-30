'use client';
import { useEffect, useRef, useState } from 'react';

export default function DevicePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coords, setCoords] = useState<string>('');
  const [motion, setMotion] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert('No se pudo acceder a la cámara: ' + (e as Error).message);
    }
  };

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0, c.width, c.height);
  };

  const locate = () => {
    if (!('geolocation' in navigator)) return alert('Geolocalización no disponible.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      (err) => alert('Error de GPS: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const accel = async () => {
    // iOS 13+ requires permission prompt
    const anyWindow: any = window;
    if (typeof anyWindow.DeviceMotionEvent?.requestPermission === 'function') {
      try { await anyWindow.DeviceMotionEvent.requestPermission(); } catch {}
    }
    const handler = (ev: DeviceMotionEvent) => {
      const x = ev.accelerationIncludingGravity?.x ?? 0;
      const y = ev.accelerationIncludingGravity?.y ?? 0;
      const z = ev.accelerationIncludingGravity?.z ?? 0;
      setMotion(`x:${x?.toFixed(2)} y:${y?.toFixed(2)} z:${z?.toFixed(2)}`);
    };
    window.addEventListener('devicemotion', handler, { passive: true });
    setTimeout(()=> window.removeEventListener('devicemotion', handler), 15000);
  };

  useEffect(() => { startCamera(); }, []);

  return (
    <div className="container">
      <h1>Elementos del dispositivo</h1>
      <div className="grid">
        <div className="card">
          <h3>Cámara</h3>
          <video ref={videoRef} autoPlay playsInline style={{width:'100%', borderRadius:'12px'}} />
          <div style={{marginTop:'.5rem'}}>
            <button onClick={capture}>Capturar</button>
          </div>
          <canvas ref={canvasRef} style={{width:'100%', marginTop:'.5rem', borderRadius:'12px'}}></canvas>
        </div>

        <div className="card">
          <h3>GPS</h3>
          <button onClick={locate}>Obtener ubicación</button>
          <p className="muted">{coords}</p>
        </div>

        <div className="card">
          <h3>Acelerómetro</h3>
          <button onClick={accel}>Escuchar 15s</button>
          <p className="muted">{motion}</p>
        </div>
      </div>
    </div>
  );
}
