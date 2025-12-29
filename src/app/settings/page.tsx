'use client';

import { useState } from 'react';
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
  
  const { 
    theme, 
    useReducedMotion, 
    homeStation, 
    workStation, 
    updateSettings 
  } = useSettings();

  const t = translations[language];

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

      <main className="max-w-2xl mx-auto pt-20 px-4 pb-12">
        <h1 className="text-3xl font-black text-anthracite mb-8 tracking-tight">Settings</h1>

        <div className="space-y-6">
          {/* Saved Trips */}
          <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl p-2 bg-blue-50 rounded-xl">🎫</span> My Saved Trips
            </h2>
            <SavedTripsList />
          </section>

          {/* Commute Settings */}
          <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl p-2 bg-red-50 rounded-xl">🚉</span> Commute Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Home Station
                </label>
                <input
                  type="text"
                  value={homeStation || ''}
                  onChange={(e) => updateSettings({ homeStation: e.target.value })}
                  placeholder="e.g. Bern"
                  className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-sbb-red focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Work Station
                </label>
                <input
                  type="text"
                  value={workStation || ''}
                  onChange={(e) => updateSettings({ workStation: e.target.value })}
                  placeholder="e.g. Zürich HB"
                  className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-sbb-red focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="bg-white rounded-3xl shadow-xl border border-white/50 p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl p-2 bg-orange-50 rounded-xl">🎨</span> Appearance
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3 p-1 bg-gray-100/50 rounded-xl border border-gray-100">
                  {(['system', 'light', 'dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ theme: mode })}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        theme === mode
                          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-gray-900 mb-1">Reduced Motion</div>
                  <div className="text-sm text-gray-500">Disable complex animations</div>
                </div>
                <button
                  onClick={() => updateSettings({ useReducedMotion: !useReducedMotion })}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sbb-red ${
                    useReducedMotion ? 'bg-sbb-red' : 'bg-gray-200'
                  }`}
                  aria-pressed={useReducedMotion}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-1 transition-all duration-300 transform ${
                    useReducedMotion ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          <div className="text-center pt-8 text-xs text-gray-400">
            SBB Chat MCP v2.2.0 • Local Data Only
          </div>
        </div>
      </main>
    </div>
  );
}
