import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

import { SettingsProvider } from '@/context/SettingsContext';
import { MapProvider } from '@/context/MapContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Swiss Travel Companion',
  description:
    'Your intelligent companion for Swiss public transport journeys, weather, and station information',
  applicationName: 'Swiss Travel Companion',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBB Chat',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/SBB-chat-MCP.png', sizes: 'any', type: 'image/png' }],
    apple: [{ url: '/SBB-chat-MCP.png', sizes: 'any', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'Swiss Travel Companion',
    title: 'Swiss Travel Companion',
    description: 'Your intelligent companion for Swiss public transport',
    images: ['/SBB-chat-MCP.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Swiss Travel Companion',
    description: 'Your intelligent companion for Swiss public transport',
    images: ['/SBB-chat-MCP.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#EB0000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="apple-touch-icon" href="/SBB-chat-MCP.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SBB Chat" />
      </head>
      <body className="antialiased font-sans">
        <SettingsProvider>
          <MapProvider>
            <ToastProvider>{children}</ToastProvider>
          </MapProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
