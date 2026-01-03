import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

import { SettingsProvider } from '@/context/SettingsContext';
import { MapProvider } from '@/context/MapContext';
import { detectLanguageFromHeaders } from '@/lib/detectLanguageFromHeaders';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: 'Swiss Travel Companion',
  description:
    'Your intelligent companion for Swiss public transport journeys, weather, and station information',
  applicationName: 'Swiss Travel Companion',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Swiss Travel Companion',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/swiss-travel-companion.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/swiss-travel-companion.png', sizes: 'any', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Swiss Travel Companion',
    title: 'Swiss Travel Companion',
    description: 'Your intelligent companion for Swiss public transport',
    images: ['/swiss-travel-companion.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Swiss Travel Companion',
    description: 'Your intelligent companion for Swiss public transport',
    images: ['/swiss-travel-companion.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#A5061C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect language from HTTP Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const detectedLanguage = detectLanguageFromHeaders(acceptLanguage);

  return (
    <html
      lang={detectedLanguage}
      className={outfit.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Set detected language from server for client-side access
                  window.__INITIAL_LANGUAGE__ = '${detectedLanguage}';
                  
                  // Apply dark mode based on saved settings
                  const settings = JSON.parse(localStorage.getItem('sbb-settings') || '{}');
                  const theme = settings.theme || 'system';
                  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" href="/swiss-travel-companion.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Swiss Travel Companion"
        />
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
