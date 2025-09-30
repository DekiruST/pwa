import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'PWA Case Study',
  description: 'Aplicación PWA con SSR/CSR, offline, notificaciones y sensores',
  manifest: '/manifest.webmanifest',
  themeColor: '#0ea5e9',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  }
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{__html:`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
        {children}
      </body>
    </html>
  );
}
