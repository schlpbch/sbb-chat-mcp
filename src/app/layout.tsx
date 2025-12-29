import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'SBB Chat MCP - Swiss Travel Assistant',
  description: 'Your intelligent companion for Swiss public transport journeys, weather, and station information',
  applicationName: 'SBB Chat MCP',
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
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'SBB Chat MCP',
    title: 'SBB Chat MCP - Swiss Travel Assistant',
    description: 'Your intelligent companion for Swiss public transport',
  },
  twitter: {
    card: 'summary',
    title: 'SBB Chat MCP',
    description: 'Your intelligent companion for Swiss public transport',
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
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SBB Chat" />
      </head>
      <body className="antialiased font-sans">
        <ToastProvider>
          {children}
          <PWAInstallPrompt />
        </ToastProvider>
      </body>
    </html>
  );
}
