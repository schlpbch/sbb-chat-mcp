'use client';

import { Language, translations } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { getAllMcpServerUrls, getMcpServerUrl } from '@/config/env';
import { useTheme } from '@/components/ThemeProvider';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onMenuToggle?: () => void;
  onChatToggle?: () => void;
}

const languages: { code: Language; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
];

export default function Navbar({
  language,
  onLanguageChange,
  onMenuToggle,
  onChatToggle,
}: NavbarProps) {
  const t = translations[language];
  const { isDark, toggleTheme } = useTheme();
  const [currentPath, setCurrentPath] = useState('/');
  const [mcpServerUrl, setMcpServerUrl] = useState(getMcpServerUrl());

  const envUrls = getAllMcpServerUrls();

  const mcpServers = [
    { label: 'GCloud Staging', value: envUrls.staging },
    { label: 'Local Dev', value: envUrls.dev },
    { label: 'Local API Routes', value: '/api/mcp' },
  ];

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const savedUrl = localStorage.getItem('mcpServerUrl');
    if (savedUrl) {
      setMcpServerUrl(savedUrl);
    }
  }, []);

  const handleMcpServerChange = (url: string) => {
    setMcpServerUrl(url);
    localStorage.setItem('mcpServerUrl', url);
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <a href="/" className="flex items-center space-x-3" aria-label="SBB MCP">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SBB</span>
              </div>
              <div className="hidden sm:flex sm:flex-col">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  SBB Chat MCP
                </h1>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight mt-1">Travel Assistant</p>
              </div>
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* MCP Server Selector */}
            <div className="hidden lg:block">
              <select
                value={mcpServerUrl}
                onChange={(e) => handleMcpServerChange(e.target.value)}
                className="text-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {mcpServers.map((server) => (
                  <option key={server.value} value={server.value}>
                    {server.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="appearance-none text-sm pl-10 pr-8 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-lg">
                {languages.find(l => l.code === language)?.flag}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Chat Button */}
            {onChatToggle ? (
              <button
                onClick={onChatToggle}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            ) : (
              <a
                href="/"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </a>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
