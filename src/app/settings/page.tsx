'use client';

import { useState, useEffect } from 'react';
import { getAllMcpServerUrls, getMcpServerUrl } from '@/config/env';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import ChatPanel from '@/components/chat/ChatPanel';
import { useSettings } from '@/context/SettingsContext';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import SavedTripsList from '@/components/saved/SavedTripsList';

export default function SettingsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mcpServerUrl, setMcpServerUrl] = useState(getMcpServerUrl());

  const envUrls = getAllMcpServerUrls();

  const mcpServers = [
    { label: translations[language].navbar.mcpServer.gcloudStaging, value: envUrls.staging },
    { label: translations[language].navbar.mcpServer.localDev, value: envUrls.dev },
    { label: translations[language].navbar.mcpServer.localApiRoutes, value: '/api/mcp' },
  ];

  useEffect(() => {
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
  
  const { 
    theme, 
    homeStation, 
    workStation, 
    updateSettings 
  } = useSettings();



  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(true)}
        onChatToggle={() => setIsChatOpen(true)}
      />

      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <ChatPanel
        language={language}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <main className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        <h1 className="text-3xl font-black text-anthracite mb-6 tracking-tight">{translations[language].settings.title}</h1>

        <div className="space-y-4">
          {/* Two Column Layout for Saved Trips and Commute Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saved Trips */}
            <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-6 backdrop-blur-sm" aria-labelledby="saved-trips-heading">
              <h2 id="saved-trips-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl p-2 bg-blue-50 rounded-xl" aria-hidden="true">🎫</span> {translations[language].settings.mySavedTrips}
              </h2>
              <SavedTripsList />
            </section>

            {/* Commute Settings */}
            <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-6 backdrop-blur-sm" aria-labelledby="commute-heading">
              <h2 id="commute-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl p-2 bg-red-50 rounded-xl" aria-hidden="true">🚉</span> {translations[language].settings.commutePreferences}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="home-station" className="block text-sm font-semibold text-gray-700 mb-2">
                    {translations[language].settings.homeStation}
                  </label>
                  <input
                    id="home-station"
                    type="text"
                    value={homeStation || ''}
                    onChange={(e) => updateSettings({ homeStation: e.target.value })}
                    placeholder={translations[language].settings.homeStationPlaceholder}
                    className="w-full px-4 py-2.5 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-sbb-red focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="work-station" className="block text-sm font-semibold text-gray-700 mb-2">
                    {translations[language].settings.workStation}
                  </label>
                  <input
                    id="work-station"
                    type="text"
                    value={workStation || ''}
                    onChange={(e) => updateSettings({ workStation: e.target.value })}
                    placeholder={translations[language].settings.workStationPlaceholder}
                    className="w-full px-4 py-2.5 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-sbb-red focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            </section>
          </div>


          {/* Two Column Layout for Appearance and Developer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appearance Settings */}
            <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-6 backdrop-blur-sm" aria-labelledby="appearance-heading">
              <h2 id="appearance-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl p-2 bg-orange-50 rounded-xl" aria-hidden="true">🎨</span> {translations[language].settings.appearance}
              </h2>
              <div>
                <label id="theme-label" className="block text-sm font-semibold text-gray-700 mb-2">{translations[language].settings.theme}</label>
                <div role="group" aria-labelledby="theme-label" className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-100/80">
                  {(['system', 'light', 'dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ theme: mode })}
                      aria-pressed={theme === mode}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        theme === mode
                          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {translations[language].settings[`theme${mode.charAt(0).toUpperCase() + mode.slice(1)}` as 'themeSystem' | 'themeLight' | 'themeDark']}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Developer Settings */}
            <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-6 backdrop-blur-sm" aria-labelledby="developer-heading">
              <h2 id="developer-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl p-2 bg-slate-50 rounded-xl" aria-hidden="true">🔧</span> {translations[language].settings.developer}
              </h2>
              <div>
                <label htmlFor="mcp-server-select" className="block text-sm font-semibold text-gray-700 mb-2">{translations[language].settings.mcpServerEnvironment}</label>
                <select
                  id="mcp-server-select"
                  value={mcpServerUrl}
                  onChange={(e) => handleMcpServerChange(e.target.value)}
                  aria-label="Select MCP server environment"
                  className="w-full px-4 py-2.5 bg-gray-50/80 border-0 rounded-xl focus:ring-2 focus:ring-sbb-red focus:bg-white transition-all text-gray-900 text-sm"
                >
                  {mcpServers.map((server) => (
                    <option key={server.value} value={server.value}>
                      {server.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-gray-500" role="note">{translations[language].settings.mcpServerNote}</p>
              </div>
            </section>
          </div>

          <div className="text-center pt-6 text-xs text-gray-400">
            {translations[language].settings.versionInfo}
          </div>
        </div>
      </main>
    </div>
  );
}
