import type { Language } from './i18n';

export interface ExampleQuery {
  id: string;
  text: Record<Language, string>;
  category: 'trips' | 'weather' | 'stations' | 'markdown';
  icon: string;
  description?: Record<Language, string>;
}

export const exampleQueries: ExampleQuery[] = [
  // Trip queries
  {
    id: 'trip-1',
    text: {
      en: 'Find trains from Zurich to Bern tomorrow at 9am',
      de: 'Finde Züge von Zürich nach Bern morgen um 9 Uhr',
      fr: 'Trouve des trains de Zurich à Berne demain à 9h',
      it: 'Trova treni da Zurigo a Berna domani alle 9',
      zh: '查找明天早上9点从苏黎世到伯尔尼的火车',
      hi: 'कल सुबह 9 बजे ज्यूरिख से बर्न तक ट्रेनें खोजें',
    },
    category: 'trips',
    icon: '🚂',
    description: {
      en: 'Simple journey query',
      de: 'Einfache Reiseabfrage',
      fr: 'Requête de voyage simple',
      it: 'Richiesta di viaggio semplice',
      zh: '简单的旅程查询',
      hi: 'सरल यात्रा प्रश्न',
    },
  },
  {
    id: 'trip-2',
    text: {
      en: 'Fastest route from Geneva to Lugano',
      de: 'Schnellste Route von Genf nach Lugano',
      fr: 'Itinéraire le plus rapide de Genève à Lugano',
      it: 'Percorso più veloce da Ginevra a Lugano',
      zh: '从日内瓦到卢加诺的最快路线',
      hi: 'जिनेवा से लुगानो तक सबसे तेज़ मार्ग',
    },
    category: 'trips',
    icon: '⚡',
    description: {
      en: 'Quick connection search',
      de: 'Schnelle Verbindungssuche',
      fr: 'Recherche de connexion rapide',
      it: 'Ricerca rapida di connessioni',
      zh: '快速连接搜索',
      hi: 'त्वरित कनेक्शन खोज',
    },
  },
  {
    id: 'trip-3',
    text: {
      en: 'Show me connections from Basel to Interlaken with max 1 transfer',
      de: 'Zeige mir Verbindungen von Basel nach Interlaken mit maximal 1 Umstieg',
      fr: 'Montre-moi les connexions de Bâle à Interlaken avec max 1 changement',
      it: 'Mostrami le connessioni da Basilea a Interlaken con massimo 1 cambio',
      zh: '显示从巴塞尔到因特拉肯最多1次换乘的连接',
      hi: 'बेसल से इंटरलेकन तक अधिकतम 1 स्थानांतरण के साथ कनेक्शन दिखाएं',
    },
    category: 'trips',
    icon: '🔄',
    description: {
      en: 'Journey with preferences',
      de: 'Reise mit Präferenzen',
      fr: 'Voyage avec préférences',
      it: 'Viaggio con preferenze',
      zh: '带偏好的旅程',
      hi: 'प्राथमिकताओं के साथ यात्रा',
    },
  },
  {
    id: 'trip-4',
    text: {
      en: 'Trains from Lausanne to St. Moritz this weekend',
      de: 'Züge von Lausanne nach St. Moritz dieses Wochenende',
      fr: 'Trains de Lausanne à St. Moritz ce week-end',
      it: 'Treni da Losanna a St. Moritz questo fine settimana',
      zh: '本周末从洛桑到圣莫里茨的火车',
      hi: 'इस सप्ताहांत लॉज़ेन से सेंट मॉरिट्ज़ तक ट्रेनें',
    },
    category: 'trips',
    icon: '🎿',
    description: {
      en: 'Weekend trip planning',
      de: 'Wochenendreiseplanung',
      fr: 'Planification de voyage de week-end',
      it: 'Pianificazione viaggio weekend',
      zh: '周末旅行计划',
      hi: 'सप्ताहांत यात्रा योजना',
    },
  },
  {
    id: 'trip-5',
    text: {
      en: 'Trains from Zurich to Milan',
      de: 'Züge von Zürich nach Mailand',
      fr: 'Trains de Zurich à Milan',
      it: 'Treni da Zurigo a Milano',
      zh: '从苏黎世到米兰的火车',
      hi: 'ज्यूरिख से मिलान तक ट्रेनें',
    },
    category: 'trips',
    icon: '🌍',
    description: {
      en: 'International journey',
      de: 'Internationale Reise',
      fr: 'Voyage international',
      it: 'Viaggio internazionale',
      zh: '国际旅程',
      hi: 'अंतर्राष्ट्रीय यात्रा',
    },
  },

  // Weather queries
  {
    id: 'weather-1',
    text: {
      en: "What's the weather in St. Moritz?",
      de: 'Wie ist das Wetter in St. Moritz?',
      fr: 'Quel temps fait-il à St. Moritz?',
      it: 'Che tempo fa a St. Moritz?',
      zh: '圣莫里茨的天气怎么样？',
      hi: 'सेंट मॉरिट्ज़ में मौसम कैसा है?',
    },
    category: 'weather',
    icon: '🌤️',
    description: {
      en: 'Current weather',
      de: 'Aktuelles Wetter',
      fr: 'Météo actuelle',
      it: 'Meteo attuale',
      zh: '当前天气',
      hi: 'वर्तमान मौसम',
    },
  },
  {
    id: 'weather-2',
    text: {
      en: 'Will it rain in Lucerne tomorrow?',
      de: 'Wird es morgen in Luzern regnen?',
      fr: 'Va-t-il pleuvoir à Lucerne demain?',
      it: 'Pioverà a Lucerna domani?',
      zh: '明天卢塞恩会下雨吗？',
      hi: 'क्या कल लुसर्न में बारिश होगी?',
    },
    category: 'weather',
    icon: '🌧️',
    description: {
      en: 'Weather forecast',
      de: 'Wettervorhersage',
      fr: 'Prévisions météo',
      it: 'Previsioni meteo',
      zh: '天气预报',
      hi: 'मौसम पूर्वानुमान',
    },
  },
  {
    id: 'weather-3',
    text: {
      en: 'Snow conditions in Zermatt',
      de: 'Schneebedingungen in Zermatt',
      fr: 'Conditions de neige à Zermatt',
      it: 'Condizioni della neve a Zermatt',
      zh: '采尔马特的雪况',
      hi: 'ज़र्मैट में बर्फ की स्थिति',
    },
    category: 'weather',
    icon: '❄️',
    description: {
      en: 'Ski resort conditions',
      de: 'Skigebietsbedingungen',
      fr: 'Conditions de station de ski',
      it: 'Condizioni della stazione sciistica',
      zh: '滑雪胜地条件',
      hi: 'स्की रिसॉर्ट की स्थिति',
    },
  },

  // Station queries
  {
    id: 'station-1',
    text: {
      en: 'Show departures from Zurich HB',
      de: 'Zeige Abfahrten von Zürich HB',
      fr: 'Affiche les départs de Zurich HB',
      it: 'Mostra le partenze da Zurigo HB',
      zh: '显示苏黎世中央车站的出发',
      hi: 'ज्यूरिख एचबी से प्रस्थान दिखाएं',
    },
    category: 'stations',
    icon: '🏢',
    description: {
      en: 'Live departures',
      de: 'Live-Abfahrten',
      fr: 'Départs en direct',
      it: 'Partenze in tempo reale',
      zh: '实时出发',
      hi: 'लाइव प्रस्थान',
    },
  },
  {
    id: 'station-2',
    text: {
      en: 'What facilities are at Bern station?',
      de: 'Welche Einrichtungen gibt es am Bahnhof Bern?',
      fr: 'Quelles sont les installations à la gare de Berne?',
      it: 'Quali servizi ci sono alla stazione di Berna?',
      zh: '伯尔尼车站有哪些设施？',
      hi: 'बर्न स्टेशन पर कौन सी सुविधाएं हैं?',
    },
    category: 'stations',
    icon: '🏪',
    description: {
      en: 'Station information',
      de: 'Bahnhofsinformationen',
      fr: 'Informations sur la gare',
      it: 'Informazioni sulla stazione',
      zh: '车站信息',
      hi: 'स्टेशन जानकारी',
    },
  },
  {
    id: 'station-3',
    text: {
      en: 'Next trains arriving at Geneva Airport',
      de: 'Nächste Züge am Flughafen Genf',
      fr: "Prochains trains arrivant à l'aéroport de Genève",
      it: "Prossimi treni in arrivo all'aeroporto di Ginevra",
      zh: '到达日内瓦机场的下一班火车',
      hi: 'जिनेवा हवाई अड्डे पर आने वाली अगली ट्रेनें',
    },
    category: 'stations',
    icon: '✈️',
    description: {
      en: 'Airport connections',
      de: 'Flughafenverbindungen',
      fr: 'Connexions aéroport',
      it: 'Connessioni aeroporto',
      zh: '机场连接',
      hi: 'हवाई अड्डा कनेक्शन',
    },
  },

  // Markdown examples
  {
    id: 'markdown-1',
    text: {
      en: `Find trains from **Zurich HB** to **Bern**
- Direct only
- After 2pm
- First class`,
      de: `Finde Züge von **Zürich HB** nach **Bern**
- Nur direkt
- Nach 14 Uhr
- Erste Klasse`,
      fr: `Trouve des trains de **Zurich HB** à **Berne**
- Direct seulement
- Après 14h
- Première classe`,
      it: `Trova treni da **Zurigo HB** a **Berna**
- Solo diretti
- Dopo le 14
- Prima classe`,
      zh: `查找从**苏黎世中央车站**到**伯尔尼**的火车
- 仅直达
- 下午2点后
- 头等舱`,
      hi: `**ज्यूरिख एचबी** से **बर्न** तक ट्रेनें खोजें
- केवल सीधी
- दोपहर 2 बजे के बाद
- प्रथम श्रेणी`,
    },
    category: 'markdown',
    icon: '✨',
    description: {
      en: 'Formatted query with preferences',
      de: 'Formatierte Abfrage mit Präferenzen',
      fr: 'Requête formatée avec préférences',
      it: 'Richiesta formattata con preferenze',
      zh: '带偏好的格式化查询',
      hi: 'प्राथमिकताओं के साथ स्वरूपित प्रश्न',
    },
  },
  {
    id: 'markdown-2',
    text: {
      en: `# Trip to Lugano
1. Find trains from Bern
2. Weather forecast
3. Tourist attractions`,
      de: `# Reise nach Lugano
1. Züge von Bern finden
2. Wettervorhersage
3. Touristenattraktionen`,
      fr: `# Voyage à Lugano
1. Trouver des trains depuis Berne
2. Prévisions météo
3. Attractions touristiques`,
      it: `# Viaggio a Lugano
1. Trova treni da Berna
2. Previsioni meteo
3. Attrazioni turistiche`,
      zh: `# 卢加诺之旅
1. 查找从伯尔尼出发的火车
2. 天气预报
3. 旅游景点`,
      hi: `# लुगानो की यात्रा
1. बर्न से ट्रेनें खोजें
2. मौसम पूर्वानुमान
3. पर्यटक आकर्षण`,
    },
    category: 'markdown',
    icon: '📝',
    description: {
      en: 'Multi-part query',
      de: 'Mehrteilige Abfrage',
      fr: 'Requête multi-parties',
      it: 'Richiesta multi-parte',
      zh: '多部分查询',
      hi: 'बहु-भाग प्रश्न',
    },
  },
  {
    id: 'markdown-3',
    text: {
      en: `Compare routes from **Geneva** to **Milan**:
- Via Lausanne
- Via Brig`,
      de: `Vergleiche Routen von **Genf** nach **Mailand**:
- Über Lausanne
- Über Brig`,
      fr: `Compare les itinéraires de **Genève** à **Milan**:
- Via Lausanne
- Via Brigue`,
      it: `Confronta i percorsi da **Ginevra** a **Milano**:
- Via Losanna
- Via Briga`,
      zh: `比较从**日内瓦**到**米兰**的路线：
- 经洛桑
- 经布里格`,
      hi: `**जिनेवा** से **मिलान** तक के मार्गों की तुलना करें:
- लॉज़ेन के माध्यम से
- ब्रिग के माध्यम से`,
    },
    category: 'markdown',
    icon: '🔀',
    description: {
      en: 'Route comparison',
      de: 'Routenvergleich',
      fr: "Comparaison d'itinéraires",
      it: 'Confronto percorsi',
      zh: '路线比较',
      hi: 'मार्ग तुलना',
    },
  },
];

export function getExamplesByCategory(
  category: ExampleQuery['category'],
  language: Language = 'en'
): Array<{
  id: string;
  text: string;
  category: string;
  icon: string;
  description?: string;
}> {
  return exampleQueries
    .filter((q) => q.category === category)
    .map((q) => ({
      id: q.id,
      text: q.text[language],
      category: q.category,
      icon: q.icon,
      description: q.description?.[language],
    }));
}

export function getRandomExamples(
  count: number = 3,
  language: Language = 'en'
): Array<{
  id: string;
  text: string;
  category: string;
  icon: string;
  description?: string;
}> {
  // Return first N examples to avoid hydration mismatch
  // (Math.random() causes server/client to render different content)
  return exampleQueries.slice(0, count).map((q) => ({
    id: q.id,
    text: q.text[language],
    category: q.category,
    icon: q.icon,
    description: q.description?.[language],
  }));
}

export function getExampleById(
  id: string,
  language: Language = 'en'
):
  | {
      id: string;
      text: string;
      category: string;
      icon: string;
      description?: string;
    }
  | undefined {
  const query = exampleQueries.find((q) => q.id === id);
  if (!query) return undefined;
  return {
    id: query.id,
    text: query.text[language],
    category: query.category,
    icon: query.icon,
    description: query.description?.[language],
  };
}

/**
 * Get featured examples for landing page
 * Returns a curated set of 6 examples showcasing different capabilities
 */
export function getFeaturedExamples(language: Language = 'en'): Array<{
  id: string;
  text: string;
  category: string;
  icon: string;
  description?: string;
}> {
  // Curated list of example IDs for landing page
  const featuredIds = [
    'trip-1', // Domestic trip: Zurich to Bern
    'trip-4', // Weekend trip: Lausanne to St. Moritz
    'trip-5', // International: Zurich to Milan
    'weather-1', // Weather: St. Moritz
    'weather-3', // Snow: Zermatt
    'station-1', // Departures: Zurich HB
  ];

  return featuredIds
    .map((id) => {
      const query = exampleQueries.find((q) => q.id === id);
      if (!query) return null;
      return {
        id: query.id,
        text: query.text[language],
        category: query.category,
        icon: query.icon,
        description: query.description?.[language],
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);
}
