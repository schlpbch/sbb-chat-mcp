'use client';

import { useFavoriteStations } from '@/hooks/useFavoriteStations';
import { useToast } from '@/components/ui/Toast';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface StationCardProps {
 data: {
 id?: string;
 name?: string;
 location?: {
 latitude?: number;
 longitude?: number;
 };
 majorHub?: boolean;
 platforms?: string[];
 countryCode?: string;
 services?: string[];
 accessibility?: {
 wheelchairAccessible?: boolean;
 tactilePaving?: boolean;
 elevator?: boolean;
 };
 };
  language: Language;
}

export default function StationCard({ data, language }: StationCardProps) {
 const { name, id, location, majorHub, platforms, countryCode, services, accessibility } = data;
 const { isFavorite, addFavorite, removeFavorite } = useFavoriteStations();
 const { showToast } = useToast();

 const isStationFavorited = id ? isFavorite(id) : false;

 const handleToggleFavorite = () => {
 if (!id || !name) {
 showToast('Cannot favorite station without ID or name', 'error');
 return;
 }

 if (isStationFavorited) {
 removeFavorite(id);
 showToast(`Removed ${name} from favorites`, 'success');
 } else {
 const success = addFavorite({ id, name });
 if (success) {
 showToast(`Added ${name} to favorites`, 'success');
 } else {
 showToast('Maximum 10 favorites reached', 'error');
 }
 }
 };

 const mapUrl =
 location?.latitude && location?.longitude
 ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`
 : null;

 const getCountryFlag = (code?: string) => {
 switch (code) {
 case 'CH': return '🇨🇭';
 case 'DE': return '🇩🇪';
 case 'FR': return '🇫🇷';
 case 'IT': return '🇮🇹';
 case 'AT': return '🇦🇹';
 default: return '🌍';
 }
 };

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-500"
 data-testid="station-card"
 aria-label={`Station: ${name || 'Unknown'}`}
 >
 {/* Compact Header */}
 <div className="bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-2">
 <h3 className="text-lg font-bold text-white truncate">
 {name || 'Unknown Station'}
 </h3>
 {majorHub && (
 <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded shrink-0">
 HUB
 </span>
 )}
 </div>
 {id && (
 <p className="text-xs text-blue-100 font-mono">{id}</p>
 )}
 </div>
 <div className="flex items-center space-x-2 ml-2">
 <button
 onClick={handleToggleFavorite}
 className="p-1 hover:scale-110 transition-transform duration-200"
 aria-label={isStationFavorited ? 'Remove from favorites' : 'Add to favorites'}
 data-testid="favorite-toggle"
 >
 {isStationFavorited ? (
 <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
 </svg>
 ) : (
 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 )}
 </button>
 <span className="text-2xl">{getCountryFlag(countryCode)}</span>
 </div>
 </div>
 </div>

 {/* Compact Content */}
 <div className="p-3 space-y-2">
 {/* Location */}
 {location && (
 <div className="flex items-start space-x-2">
 <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 </svg>
 <div className="flex-1 min-w-0">
 <p className="text-xs text-gray-600 font-mono truncate">
 {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
 </p>
 {mapUrl && (
 <a
 href={mapUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:underline"
 >
 <span>Map</span>
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </a>
 )}
 </div>
 </div>
 )}

 {/* Platforms */}
 {platforms && platforms.length > 0 && (
 <div>
 <p className="text-xs font-semibold text-gray-700 mb-1">
 Platforms ({platforms.length})
 </p>
 <div className="flex flex-wrap gap-1">
 {platforms.slice(0, 8).map((platform, idx) => (
 <span
 key={idx}
 className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded"
 >
 {platform}
 </span>
 ))}
 {platforms.length > 8 && (
 <span className="text-xs text-gray-500 px-2 py-0.5">
 +{platforms.length - 8}
 </span>
 )}
 </div>
 </div>
 )}

 {/* Services */}
 {services && services.length > 0 && (
 <div>
 <p className="text-xs font-semibold text-gray-700 mb-1">
 Services ({services.length})
 </p>
 <div className="flex flex-wrap gap-1">
 {services.slice(0, 6).map((service, idx) => (
 <span
 key={idx}
 className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
 >
 {service}
 </span>
 ))}
 {services.length > 6 && (
 <span className="text-xs text-gray-500 px-2 py-0.5">
 +{services.length - 6}
 </span>
 )}
 </div>
 </div>
 )}

 {/* Accessibility - Compact */}
 {accessibility && (
 <div className="pt-2 border-t border-gray-200">
 <p className="text-xs font-semibold text-gray-700 mb-1">
 Accessibility
 </p>
 <div className="flex items-center space-x-2">
 <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
 accessibility.wheelchairAccessible
 ? 'bg-green-50 text-green-700'
 : 'bg-gray-100 text-gray-500'
 }`}>
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-medium">♿</span>
 </div>
 <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
 accessibility.tactilePaving
 ? 'bg-green-50 text-green-700'
 : 'bg-gray-100 text-gray-500'
 }`}>
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-medium">👣</span>
 </div>
 <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
 accessibility.elevator
 ? 'bg-green-50 text-green-700'
 : 'bg-gray-100 text-gray-500'
 }`}>
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-medium">🛗</span>
 </div>
 </div>
 </div>
 )}
 </div>
 </article>
 );
}
