/**
 * Structured Multilingual Keyword Dictionaries
 *
 * Centralized keyword definitions for intent classification across
 * English (EN), German (DE), French (FR), and Italian (IT).
 */

export type Language = 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi';

export interface KeywordSet {
  primary: string[]; // Main keywords (strict match)
  variations: string[]; // Plurals, common variations
  phrases: string[]; // Multi-word phrases
  contextual: string[]; // Context-dependent (require other signals)
}

export interface MultilingualKeywords {
  en: KeywordSet;
  de: KeywordSet;
  fr: KeywordSet;
  it: KeywordSet;
}

/**
 * Intent keyword dictionaries for all supported intent types
 */
export const INTENT_KEYWORDS: Record<string, MultilingualKeywords> = {
  trip_planning: {
    en: {
      primary: ['train', 'connection', 'trip', 'travel', 'journey', 'route'],
      variations: [
        'trains',
        'connections',
        'trips',
        'travels',
        'journeys',
        'routes',
      ],
      phrases: [
        'get to',
        'go to',
        'travel to',
        'going from',
        'how do i get',
        'how to get',
      ],
      contextual: ['from', 'to'],
    },
    de: {
      primary: ['zug', 'bahn', 'verbindung', 'reise', 'fahrt', 'route'],
      variations: [
        'züge',
        'bahnen',
        'verbindungen',
        'reisen',
        'fahrten',
        'routen',
      ],
      phrases: [
        'fahren nach',
        'reisen nach',
        'fahrt von',
        'wie komme ich',
        'wie kommt man',
      ],
      contextual: ['von', 'nach', 'ab', 'bis'],
    },
    fr: {
      primary: ['train', 'connexion', 'voyage', 'trajet', 'itinéraire'],
      variations: ['trains', 'connexions', 'voyages', 'trajets', 'itinéraires'],
      phrases: [
        'aller à',
        'aller de',
        'voyager à',
        'comment aller',
        'pour aller',
      ],
      contextual: ['de', 'à', 'depuis', 'pour', 'vers'],
    },
    it: {
      primary: ['treno', 'collegamento', 'viaggio', 'percorso', 'itinerario'],
      variations: ['treni', 'collegamenti', 'viaggi', 'percorsi', 'itinerari'],
      phrases: [
        'andare a',
        'andare da',
        'viaggiare a',
        'come arrivare',
        'per andare',
      ],
      contextual: ['da', 'a', 'per', 'verso'],
    },
  },

  weather_check: {
    en: {
      primary: [
        'weather',
        'forecast',
        'temperature',
        'rain',
        'sunny',
        'cloudy',
        'wind',
        'humidity',
      ],
      variations: ['weathers', 'forecasts', 'temperatures', 'raining', 'windy'],
      phrases: [
        'what is the weather',
        'how is the weather',
        'weather forecast',
      ],
      contextual: ['in', 'at'],
    },
    de: {
      primary: [
        'wetter',
        'wettervorhersage',
        'temperatur',
        'regen',
        'sonnig',
        'bewölkt',
        'wind',
      ],
      variations: ['temperaturen', 'regnet', 'windig'],
      phrases: [
        'wie ist das wetter',
        'wie wird das wetter',
        'wettervorhersage für',
      ],
      contextual: ['in', 'bei'],
    },
    fr: {
      primary: [
        'météo',
        'prévisions',
        'température',
        'pluie',
        'ensoleillé',
        'nuageux',
        'vent',
      ],
      variations: ['prévision', 'températures', 'pleut', 'venteux'],
      phrases: [
        'quel temps fait-il',
        'quelle est la météo',
        'prévisions météo',
      ],
      contextual: ['à', 'dans'],
    },
    it: {
      primary: [
        'meteo',
        'previsioni',
        'temperatura',
        'pioggia',
        'soleggiato',
        'nuvoloso',
        'vento',
      ],
      variations: ['previsione', 'temperature', 'piove', 'ventoso'],
      phrases: ['che tempo fa', 'come è il tempo', 'previsioni meteo'],
      contextual: ['a', 'in'],
    },
  },

  snow_conditions: {
    en: {
      primary: ['snow', 'ski', 'skiing', 'snowboard', 'slopes', 'powder'],
      variations: ['snowing', 'skis', 'snowboarding', 'slope'],
      phrases: [
        'snow conditions',
        'ski conditions',
        'how much snow',
        'snow depth',
        'ski resort',
      ],
      contextual: ['in', 'at'],
    },
    de: {
      primary: ['schnee', 'ski', 'skifahren', 'snowboard', 'pisten', 'pulver'],
      variations: ['schneit', 'skis', 'snowboarden', 'piste'],
      phrases: [
        'schneebedingungen',
        'skibedingungen',
        'wie viel schnee',
        'schneehöhe',
        'skigebiet',
      ],
      contextual: ['in', 'bei'],
    },
    fr: {
      primary: ['neige', 'ski', 'skier', 'snowboard', 'pistes', 'poudreuse'],
      variations: ['neige', 'skis', 'faire du ski', 'piste'],
      phrases: [
        'conditions de neige',
        'conditions de ski',
        'combien de neige',
        'hauteur de neige',
        'station de ski',
      ],
      contextual: ['à', 'dans'],
    },
    it: {
      primary: ['neve', 'sci', 'sciare', 'snowboard', 'piste', 'neve fresca'],
      variations: ['nevica', 'sci', 'sciando', 'pista'],
      phrases: [
        'condizioni della neve',
        'condizioni sciistiche',
        'quanta neve',
        'altezza neve',
        'stazione sciistica',
      ],
      contextual: ['a', 'in'],
    },
  },

  station_search: {
    en: {
      primary: [
        'station',
        'stop',
        'platform',
        'departures',
        'arrivals',
        'arriving',
        'departing',
      ],
      variations: ['stations', 'stops', 'platforms', 'departure', 'arrival'],
      phrases: [
        'train station',
        'railway station',
        'show departures',
        'show arrivals',
        'show departure',
        'show arrival',
        'trains arriving',
        'train arriving',
      ],
      contextual: ['at', 'from', 'in'],
    },
    de: {
      primary: ['bahnhof', 'haltestelle', 'gleis', 'abfahrt', 'ankunft'],
      variations: [
        'bahnhöfe',
        'haltestellen',
        'gleise',
        'abfahrten',
        'ankünfte',
      ],
      phrases: [
        'zeig abfahrten',
        'zeig ankünfte',
        'abfahrten von',
        'ankünfte in',
      ],
      contextual: ['am', 'vom', 'in', 'bei'],
    },
    fr: {
      primary: ['gare', 'arrêt', 'quai', 'départ', 'arrivée'],
      variations: ['gares', 'arrêts', 'quais', 'départs', 'arrivées'],
      phrases: [
        'affiche les départs',
        'affiche les arrivées',
        'départs de',
        'arrivées à',
      ],
      contextual: ['à', 'de', 'dans'],
    },
    it: {
      primary: ['stazione', 'fermata', 'binario', 'partenza', 'arrivo'],
      variations: ['stazioni', 'fermate', 'binari', 'partenze', 'arrivi'],
      phrases: [
        'dove si trova',
        'dove si trova la stazione',
        "dov'è",
        "dov'è la stazione",
        'mostra le partenze',
        'mostra gli arrivi',
        'partenze da',
        'arrivi a',
      ],
      contextual: ['a', 'da', 'in', 'alla', 'di'],
    },
  },

  train_formation: {
    en: {
      primary: ['formation', 'composition', 'wagon', 'sector', 'coach', 'unit'],
      variations: ['formations', 'wagons', 'sectors', 'coaches', 'units'],
      phrases: ['train formation', 'where is', 'which sector', 'which coach'],
      contextual: ['information', 'info'],
    },
    de: {
      primary: [
        'formation',
        'komposition',
        'wagen',
        'sektor',
        'traktion',
        'einheit',
      ],
      variations: [
        'formationen',
        'kompositionen',
        'wägen',
        'sektoren',
        'einheiten',
      ],
      phrases: ['zugformation', 'wo ist', 'welcher sektor', 'welcher wagen'],
      contextual: ['information', 'info'],
    },
    fr: {
      primary: [
        'formation',
        'composition',
        'wagon',
        'secteur',
        'voiture',
        'unité',
      ],
      variations: [
        'formations',
        'compositions',
        'wagons',
        'secteurs',
        'voitures',
        'unités',
      ],
      phrases: [
        'formation du train',
        'où est',
        'quel secteur',
        'quelle voiture',
      ],
      contextual: ['information', 'info'],
    },
    it: {
      primary: [
        'formazione',
        'composizione',
        'vagone',
        'settore',
        'carrozza',
        'unità',
      ],
      variations: [
        'formazioni',
        'composizioni',
        'vagoni',
        'settori',
        'carrozze',
      ],
      phrases: [
        'formazione del treno',
        'dove è',
        'quale settore',
        'quale carrozza',
      ],
      contextual: ['informazione', 'info'],
    },
  },

  general_info: {
    en: {
      primary: [
        'help',
        'info',
        'information',
        'question',
        'what',
        'how',
        'when',
        'where',
      ],
      variations: ['questions', 'infos'],
      phrases: ['can you help', 'i need help', 'tell me about'],
      contextual: [],
    },
    de: {
      primary: [
        'hilfe',
        'info',
        'information',
        'frage',
        'was',
        'wie',
        'wann',
        'wo',
      ],
      variations: ['fragen', 'infos', 'informationen'],
      phrases: ['kannst du helfen', 'ich brauche hilfe', 'erzähl mir über'],
      contextual: [],
    },
    fr: {
      primary: [
        'aide',
        'info',
        'information',
        'question',
        'quoi',
        'comment',
        'quand',
        'où',
      ],
      variations: ['questions', 'infos', 'informations'],
      phrases: ['peux-tu aider', "j'ai besoin d'aide", 'dis-moi sur'],
      contextual: [],
    },
    it: {
      primary: [
        'aiuto',
        'info',
        'informazione',
        'domanda',
        'cosa',
        'come',
        'quando',
        'dove',
      ],
      variations: ['domande', 'informazioni'],
      phrases: ['puoi aiutare', 'ho bisogno di aiuto', 'dimmi su'],
      contextual: [],
    },
  },
};

/**
 * Get all keywords for a specific intent type and languages
 * Excludes contextual keywords by default to prevent false positives
 */
export function getAllKeywords(
  intentType: string,
  languages: Language[],
  includeContextual = false
): string[] {
  const keywords: string[] = [];
  const intentKeywords = INTENT_KEYWORDS[intentType];

  if (!intentKeywords) {
    return keywords;
  }

  for (const lang of languages) {
    const keywordSet = intentKeywords[lang];
    if (keywordSet) {
      keywords.push(
        ...keywordSet.primary,
        ...keywordSet.variations,
        ...keywordSet.phrases
      );

      // Only include contextual keywords if explicitly requested
      if (includeContextual) {
        keywords.push(...keywordSet.contextual);
      }
    }
  }

  return keywords;
}

/**
 * Get keywords by category for a specific intent type and languages
 */
export function getKeywordsByCategory(
  intentType: string,
  languages: Language[],
  categories: Array<keyof KeywordSet> = [
    'primary',
    'variations',
    'phrases',
    'contextual',
  ]
): string[] {
  const keywords: string[] = [];
  const intentKeywords = INTENT_KEYWORDS[intentType];

  if (!intentKeywords) {
    return keywords;
  }

  for (const lang of languages) {
    const keywordSet = intentKeywords[lang];
    if (keywordSet) {
      for (const category of categories) {
        keywords.push(...keywordSet[category]);
      }
    }
  }

  return keywords;
}
