import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const outfit = Outfit({
 subsets: ['latin'],
 variable: '--font-outfit',
});

export const metadata: Metadata = {
 title: 'SBB Travel Assistant',
 description:
 'Your intelligent companion for Swiss public transport journeys and station information',
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className={outfit.variable}>
 <body className="antialiased font-sans">
 <ToastProvider>
 {children}
 </ToastProvider>
 </body>
 </html>
 );
}
