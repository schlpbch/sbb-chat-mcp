import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Train,
  Bus,
  TrainTrack,
  PersonStanding,
  Bike,
  Ship,
  CableCar,
  Plane,
  Accessibility,
  UtensilsCrossed,
  Building,
  Snowflake,
  Mountain,
  Info,
  Zap,
  Target,
  Scale,
  Globe,
  type LucideIcon,
} from 'lucide-react';

// Weather condition icons
export const weatherIcons: Record<string, LucideIcon> = {
  clear: Sun,
  sunny: Sun,
  cloudy: Cloud,
  partlyCloudy: Cloud,
  rain: CloudRain,
  rainy: CloudRain,
  snow: CloudSnow,
  snowy: CloudSnow,
  thunder: CloudLightning,
  thunderstorm: CloudLightning,
  fog: CloudFog,
  foggy: CloudFog,
};

// Utility/measurement icons
export const utilityIcons: Record<string, LucideIcon> = {
  thermometer: Thermometer,
  temperature: Thermometer,
  droplet: Droplets,
  humidity: Droplets,
  precipitation: Droplets,
  wind: Wind,
  pressure: Gauge,
  uvIndex: Sun,
};

// Transport icons
export const transportIcons: Record<string, LucideIcon> = {
  train: Train,
  rail: Train,
  bus: Bus,
  tram: TrainTrack,
  walk: PersonStanding,
  bike: Bike,
  cycle: Bike,
  ferry: Ship,
  boat: Ship,
  ship: Ship,
  cable: CableCar,
  gondola: CableCar,
  funicular: CableCar,
  plane: Plane,
  flight: Plane,
  accessibility: Accessibility,
  wheelchair: Accessibility,
  default: Train, // Default transport icon
};

// Activity icons
export const activityIcons: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  food: UtensilsCrossed,
  building: Building,
  station: Building,
  snow: Snowflake,
  ski: Mountain,
  mountain: Mountain,
};

// Status icons
export const statusIcons: Record<string, LucideIcon> = {
  info: Info,
  fast: Zap,
  target: Target,
  balance: Scale,
  eco: Globe,
};

// Helper function to get weather icon by condition string
export function getWeatherIcon(condition?: string): LucideIcon {
  if (!condition) return Cloud;
  const c = condition.toLowerCase();

  if (c.includes('clear') || c.includes('sunny')) return Sun;
  if (c.includes('rain')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('thunder')) return CloudLightning;
  if (c.includes('fog')) return CloudFog;
  if (c.includes('cloud') || c.includes('partly')) return Cloud;

  return Cloud;
}

// Helper function to get transport icon by mode string
export function getTransportIconComponent(mode?: string): LucideIcon {
  if (!mode || typeof mode !== 'string') return Train;

  const lowerMode = mode.toLowerCase();

  // Specific train types
  if (
    lowerMode.includes('ir') ||
    lowerMode.includes('ic') ||
    lowerMode.includes('re') ||
    lowerMode.includes('s-bahn') ||
    lowerMode.includes('s1') ||
    lowerMode.includes('s2') ||
    lowerMode.includes('train') ||
    lowerMode.includes('rail')
  )
    return Train;

  if (lowerMode.includes('bus')) return Bus;
  if (lowerMode.includes('tram')) return TrainTrack;
  if (lowerMode.includes('walk')) return PersonStanding;
  if (lowerMode.includes('bike') || lowerMode.includes('cycle')) return Bike;
  if (
    lowerMode.includes('ferry') ||
    lowerMode.includes('boat') ||
    lowerMode.includes('ship')
  )
    return Ship;
  if (
    lowerMode.includes('cable') ||
    lowerMode.includes('gondola') ||
    lowerMode.includes('funicular')
  )
    return CableCar;
  if (lowerMode.includes('plane') || lowerMode.includes('flight')) return Plane;

  return Train; // Default
}
