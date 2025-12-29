'use client';

import { useEffect, useRef } from 'react';
import { Language, translations } from '@/lib/i18n';

interface MenuProps {
 language: Language;
 isOpen: boolean;
 onClose: () => void;
}

export default function Menu({ language, isOpen, onClose }: MenuProps) {
 const t = translations[language];
 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleEscape = (e: KeyboardEvent) => {
 if (e.key === 'Escape' && isOpen) {
 onClose();
 }
 };

 if (isOpen) {
 document.addEventListener('keydown', handleEscape);
 menuRef.current?.focus();
 }

 return () => {
 document.removeEventListener('keydown', handleEscape);
 };
 }, [isOpen, onClose]);

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: t.menu.home,
      href: '/',
      description: t.menu.landingPage,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      label: t.menu.map,
      href: '/map',
      description: t.menu.interactiveMap,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: t.menu.mcpTest,
      href: '/mcp-test',
      description: t.menu.testMcpIntegration,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: t.menu.health,
      href: '/health',
      description: t.menu.systemStatus,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        tabIndex={-1}
        className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">SBB</span>
                </div>
                <div>
                  <h2 id="menu-title" className="text-lg font-bold text-gray-900">
                    {t.menu.menu}
                  </h2>
                  <p className="text-xs text-gray-500">{t.menu.navigation}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label={t.accessibility.closeMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4" aria-label={t.accessibility.mainNavigation}>
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    aria-label={item.label}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <span className="text-gray-500 group-hover:text-red-600 transition-colors">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {t.version || 'v2.1.0'}
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              © 2024 {t.navbar.appTitle}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
