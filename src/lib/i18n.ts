export const translations = {
  en: {
    appName: 'SBB Travel Assistant',
    loading: 'Loading...',
    version: 'v2.1.0',
    home: 'Home',
    chat: 'Chat',
    map: 'Map',
    about: 'About',
  },
  de: {
    appName: 'SBB Reiseassistent',
    loading: 'Wird geladen...',
    version: 'v2.1.0',
    home: 'Startseite',
    chat: 'Chat',
    map: 'Karte',
    about: 'Über',
  },
  fr: {
    appName: 'Assistant Voyage SBB',
    loading: 'Chargement...',
    version: 'v2.1.0',
    home: 'Accueil',
    chat: 'Chat',
    map: 'Carte',
    about: 'À propos',
  },
  it: {
    appName: 'Assistente Viaggio SBB',
    loading: 'Caricamento...',
    version: 'v2.1.0',
    home: 'Home',
    chat: 'Chat',
    map: 'Mappa',
    about: 'Informazioni',
  },
  zh: {
    appName: 'SBB 出行助手',
    loading: '加载中...',
    version: 'v2.1.0',
    home: '首页',
    chat: '聊天',
    map: '地图',
    about: '关于',
  },
  hi: {
    appName: 'SBB यात्रा सहायक',
    loading: 'लोड हो रहा है...',
    version: 'v2.1.0',
    home: 'होम',
    chat: 'चैट',
    map: 'नक्शा',
    about: 'के बारे में',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
