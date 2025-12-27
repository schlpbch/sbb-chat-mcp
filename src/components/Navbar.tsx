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

  // Get configured MCP server URLs from environment
  const envUrls = getAllMcpServerUrls();

  // Available MCP server options
  const mcpServers = [
    {
      label: 'GCloud Staging',
      value: envUrls.staging,
    },
    { label: 'Local Dev', value: envUrls.dev },
    { label: 'Local API Routes', value: '/api/mcp' },
  ];

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    // Load MCP server URL from localStorage if available
    const savedUrl = localStorage.getItem('mcpServerUrl');
    if (savedUrl) {
      setMcpServerUrl(savedUrl);
    }
  }, []);

  const handleMcpServerChange = (url: string) => {
    setMcpServerUrl(url);
    localStorage.setItem('mcpServerUrl', url);
    // Optionally reload data with new server
    window.location.reload();
  };

  return (
    <nav className="glass sticky top-0 z-50 px-8 py-5 border-b border-cloud/30 dark:border-iron/30 shadow-sbb">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Left Section: Hamburger Menu + URL */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2.5 text-anthracite dark:text-graphite hover:text-sbb-red dark:hover:text-sbb-red hover:bg-milk dark:hover:bg-charcoal rounded-sbb-lg transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md group"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Current URL/Path */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sbb-lg bg-milk dark:bg-charcoal border border-cloud dark:border-iron">
            <svg
              className="w-4 h-4 text-smoke dark:text-graphite"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-xs font-mono text-anthracite dark:text-graphite">
              {currentPath}
            </span>
          </div>
        </div>

        {/* Center Section: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* SBB Logo */}
            <div className="w-10 h-10 rounded-sbb-lg bg-sbb-red flex items-center justify-center shadow-sbb-red">
              <span className="text-white font-bold text-sm tracking-tight">SBB</span>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-sbb-red">
                SBB
              </span>
              <span className="text-midnight dark:text-milk">
                {' '}Chat MCP
              </span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-milk dark:bg-charcoal border border-cloud dark:border-iron">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse-subtle" />
            <span className="text-xs font-medium text-anthracite dark:text-graphite">
              {t.version}
            </span>
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-3">
          {/* MCP Server Selector */}
          <div className="relative group">
            <label htmlFor="mcp-server-select" className="sr-only">
              MCP Server Connection
            </label>
            <select
              id="mcp-server-select"
              value={mcpServerUrl}
              onChange={(e) => handleMcpServerChange(e.target.value)}
              className="appearance-none bg-white dark:bg-charcoal border border-cloud dark:border-iron text-midnight dark:text-milk text-sm font-medium rounded-sbb-xl px-4 py-2.5 pr-10 hover:border-sbb-red focus:ring-2 focus:ring-sbb-red focus:border-transparent outline-none cursor-pointer transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md"
              aria-label="Select MCP Server Connection"
            >
              {mcpServers.map((server) => (
                <option key={server.value} value={server.value}>
                  🔌 {server.label}
                </option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-smoke dark:text-graphite"
              aria-hidden="true"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative group">
            <label htmlFor="language-select" className="sr-only">
              Select Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="appearance-none bg-white dark:bg-charcoal border border-cloud dark:border-iron text-midnight dark:text-milk text-sm font-medium rounded-sbb-xl px-4 py-2.5 pr-10 hover:border-sbb-red focus:ring-2 focus:ring-sbb-red focus:border-transparent outline-none cursor-pointer transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md"
              aria-label="Select application language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-smoke dark:text-graphite"
              aria-hidden="true"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Chat Toggle/Link */}
          {onChatToggle ? (
            <button
              onClick={onChatToggle}
              className="p-2.5 text-anthracite dark:text-graphite hover:text-sbb-red dark:hover:text-sbb-red hover:bg-milk dark:hover:bg-charcoal rounded-sbb-xl transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md group bg-milk dark:bg-charcoal border border-cloud dark:border-iron"
              aria-label="Open AI Travel Assistant"
              title="Open AI Travel Assistant"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          ) : (
            <a
              href="/chat"
              className="p-2.5 text-anthracite dark:text-graphite hover:text-sbb-red dark:hover:text-sbb-red hover:bg-milk dark:hover:bg-charcoal rounded-sbb-xl transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md group bg-milk dark:bg-charcoal border border-cloud dark:border-iron"
              aria-label="Open AI Travel Assistant"
              title="Open AI Travel Assistant"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </a>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-anthracite dark:text-graphite hover:text-sbb-red dark:hover:text-sbb-red hover:bg-milk dark:hover:bg-charcoal rounded-sbb-xl transition-all duration-200 shadow-sbb-sm hover:shadow-sbb-md group"
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
