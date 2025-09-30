'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="container">
      <AnimatePresence>
        {showSplash && (
          <motion.div className="splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img src="/icons/icon-192.png" width={96} height={96} alt="logo" initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} />
            <motion.h1 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>PWA Case Study</motion.h1>
            <p className="muted">Cargando...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
          <h1>Home</h1>
          <p className="muted">Aplicación PWA con vistas SSR/CSR, datos offline, notificaciones y sensores.</p>

          <div className="grid">
            <div className="card">
              <h3>Vistas</h3>
              <p>SSR y CSR implementadas con ejemplos reales.</p>
              <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
                <Link href="/server-demo"><button>SSR (Server)</button></Link>
                <Link href="/client-demo"><button>CSR (Client)</button></Link>
              </div>
            </div>

            <div className="card">
              <h3>Datos</h3>
              <p>Local (IndexedDB), remoto (fetch) y offline (cache + queue).</p>
              <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
                <Link href="/notes"><button>Notas Offline</button></Link>
              </div>
            </div>

            <div className="card">
              <h3>Notificaciones</h3>
              <p>Permisos, locales y Push Web con VAPID.</p>
              <Link href="/notifications"><button>Probar</button></Link>
            </div>

            <div className="card">
              <h3>Dispositivo</h3>
              <p>Cámara, GPS y acelerómetro.</p>
              <Link href="/device"><button>Probar</button></Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
