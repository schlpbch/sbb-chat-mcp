'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import ChatPanel from '@/components/chat/ChatPanel';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
 const [language, setLanguage] = useState<Language>('en');
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isChatOpen, setIsChatOpen] = useState(false);

 return (
 <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
 {/* Skip Navigation Links */}
 <a
 href="#main-content"
 className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sbb-red focus:text-white focus:rounded-sbb focus:shadow-lg"
 >
 Skip to main content
 </a>

 {/* Navbar */}
 <Navbar
 language={language}
 onLanguageChange={setLanguage}
 onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
 onChatToggle={() => setIsChatOpen(!isChatOpen)}
 />

 {/* Menu */}
 <Menu
 language={language}
 isOpen={isMenuOpen}
 onClose={() => setIsMenuOpen(false)}
 />

 {/* Chat Panel */}
 <ChatPanel
 language={language}
 isOpen={isChatOpen}
 onClose={() => setIsChatOpen(false)}
 />

 <div className="flex flex-1 overflow-hidden pt-16 relative z-0">
 <div className="flex flex-1 overflow-hidden bg-white shadow-2xl relative">
 {/* Main Map Area */}
 <main id="main-content" className="flex-1 relative">
 <Map />
 </main>
 </div>
 </div>
 </div>
 );
}
