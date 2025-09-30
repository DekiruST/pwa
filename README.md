# PWA Case Study — Next.js (SSR + CSR + Offline + Push + Sensores)

##  Stack

- **Next.js (App Router)** — SSR/CSR híbrido.
- **TypeScript**.
- **Framer Motion** — transiciones.
- **Service Worker** manual para cache/Offline/Push.
- **IndexedDB (`idb`)** — datos locales.
- **web-push** — envío de notificaciones push desde servidor/script.

##  Instalación

# 1) Clona y entra
git clone pwa.git pwa-case-study
cd pwa-case-study

# 2) Instala dependencias
npm install

# 3) (Opcional) Genera tus llaves VAPID para Push
npm run gen:vapid
# Copia los valores en un archivo .env.local:
# VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
# VAPID_SUBJECT=mailto:

# 4) Ejecuta en desarrollo
npm run dev

Visita **https://pwa-six-topaz.vercel.app/** desde un navegador compatible.

##  Configuración de entorno

Crea un archivo **.env.local**:

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=

##  PWA

- **Manifest:** `public/manifest.webmanifest`
- **Service Worker:** `public/sw.js` (registro en `src/app/layout.tsx`)

Incluye:
- **Precarga** de assets.
- **Cache-first** para estáticos y **network-first** para JSON.
- **Background Sync** simple (cola de POSTs) si está disponible.
- **Manejadores de `push` y `notificationclick`**.

Instálala desde el navegador (Add to Home Screen / Instalar app).


##  Rutas principales

- `/` — **Home** con **Splash**.
- `/server-demo` — **SSR**, **fetch en servidor** de 5 posts (no-cache).
- `/client-demo` — **CSR**, **fetch en cliente** con fallback desde cache cuando está offline.
- `/notes` — **Notas Offline**: IndexedDB + sincronización (manual o Background Sync).
- `/notifications` — **Notificaciones**: permisos, local y **push**.
- `/device` — **Sensores**: cámara, GPS, acelerómetro.

### API

- `POST /api/echo` — eco de payload (para demo de sincronización).
- `GET /api/vapid` — expone `VAPID_PUBLIC_KEY`.
- `POST /api/subscribe` — guarda suscripción (archivo en `/tmp/subscriptions.json` en dev).
- `POST /api/send` — envía push a todas las suscripciones guardadas.

### Scripts

- `npm run gen:vapid` — genera llaves VAPID.
- `npm run push` — envía push usando `scripts/send-push.js` (dev local).


##  Cómo probar cada criterio

### 1) Splash + Home
- Inicia la app y observa la pantalla de **Splash** con transición y luego la **Home** responsiva.

### 2) Vistas del lado del cliente y servidor
- Visita **/server-demo** (SSR) y **/client-demo** (CSR).
- El código fuente está comentado explicando cada enfoque.

### 3) Datos locales, remotos y offline
- **Locales:** en **/notes** guarda notas (IndexedDB).
- **Remotos:** tanto **/server-demo** como **/client-demo** consultan una API pública.
- **Offline:** apaga tu red y recarga **/client-demo** — verás datos desde cache. En **/notes**, pulsa **Sincronizar** sin red para encolar; al volver la red, se envía (BG Sync).

### 4) Notificaciones
- En **/notificaciones**, pulsa **Pedir permiso** y **Local** (muestra sin servidor).
- Para **Push**, genera VAPID, suscríbete y ejecuta **Enviar Push (servidor)** o `npm run push`.

### 5) Elementos físicos
- En **/dispositivo** prueba **cámara** (captura frame), **GPS** (coordenadas) y **acelerómetro** (valores por 15s).
> Algunos navegadores requieren **HTTPS** o permisos especiales. En local, usa **localhost** o un túnel HTTPS.

##  Estructura

pwa-case-study/
├─ public/
│  ├─ sw.js
│  ├─ manifest.webmanifest
│  └─ icons/ (PNG placeholders)
├─ src/
│  └─ app/
│     ├─ (Home, Splash dentro)
│     ├─ server-demo/
│     ├─ client-demo/
│     ├─ notes/
│     ├─ device/
│     └─ notifications/
├─ scripts/
│  ├─ gen-vapid.js
│  └─ send-push.js
├─ next.config.mjs
├─ package.json
├─ tsconfig.json
└─ README.md

##  Notas de seguridad

- Sensores (cámara/GPS) requieren **HTTPS** en producción.
- **Push** requiere **origen confiable** y claves VAPID.

##  Despliegue

- **Vercel**,  funciona bien para Next.js.
- Asegurar variables de entorno (`VAPID_*`) en panel de tu plataforma.
- Probar en un dispositivo móvil real para sensores/instalación PWA.