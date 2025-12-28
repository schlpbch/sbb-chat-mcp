'use client';

import type { Language } from '@/lib/i18n';

interface ItineraryCardProps {
 data: {
 destination?: string;
 duration?: string;
 activities?: Array<{
 time?: string;
 title?: string;
 description?: string;
 location?: string;
 type?: string;
 }>;
 transportation?: string;
 budget?: {
 total?: number;
 currency?: string;
 };
 };
 language: Language;
}

export default function ItineraryCard({ data, language }: ItineraryCardProps) {
 const { destination, duration, activities = [], transportation, budget } = data;

 const getActivityIcon = (type?: string) => {
 if (!type) return '📍';
 const t = type.toLowerCase();
 if (t.includes('food') || t.includes('restaurant')) return '🍽️';
 if (t.includes('museum') || t.includes('culture')) return '🏛️';
 if (t.includes('nature') || t.includes('park')) return '🌳';
 if (t.includes('shopping')) return '🛍️';
 if (t.includes('hotel') || t.includes('accommodation')) return '🏨';
 if (t.includes('transport')) return '🚂';
 return '📍';
 };

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-indigo-500"
 data-testid="itinerary-card"
 aria-label={`Itinerary for ${destination || 'destination'}`}
 >
 {/* Compact Header */}
 <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-2">
 <div className="flex items-center justify-between text-white">
 <div className="flex items-center space-x-2 flex-1 min-w-0">
 <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
 </svg>
 <div className="flex-1 min-w-0">
 <h3 className="text-lg font-bold truncate">Itinerary</h3>
 <p className="text-xs text-indigo-100 truncate">{destination || 'Your Trip'}</p>
 </div>
 </div>
 {duration && (
 <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-semibold shrink-0 ml-2">
 {duration}
 </div>
 )}
 </div>
 </div>

 {/* Compact Content */}
 <div className="p-3">
 {/* Transportation & Budget - Compact */}
 {(transportation || budget) && (
 <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
 {transportation && (
 <div className="flex items-center space-x-1.5">
 <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 <div>
 <p className="text-xs text-gray-500">Transport</p>
 <p className="text-sm font-semibold text-gray-900">{transportation}</p>
 </div>
 </div>
 )}
 {budget && budget.total !== undefined && (
 <div className="flex items-center space-x-1.5">
 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <p className="text-xs text-gray-500">Budget</p>
 <p className="text-sm font-semibold text-gray-900">
 {budget.total} {budget.currency || 'CHF'}
 </p>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Compact Activities Timeline */}
 {activities.length > 0 ? (
 <div className="space-y-2">
 <p className="text-xs font-semibold text-gray-700 mb-2">
 Activities ({activities.length})
 </p>
 {activities.map((activity, idx) => (
 <div key={idx} className="flex items-start space-x-2">
 {/* Timeline */}
 <div className="flex flex-col items-center shrink-0">
 <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-base">
 {getActivityIcon(activity.type)}
 </div>
 {idx < activities.length - 1 && (
 <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
 )}
 </div>

 {/* Activity Details - Compact */}
 <div className="flex-1 min-w-0 pb-2">
 <div className="flex items-start justify-between mb-1">
 <h4 className="text-sm font-semibold text-gray-900 truncate">
 {activity.title || 'Activity'}
 </h4>
 {activity.time && (
 <span className="text-xs font-medium text-indigo-600 shrink-0 ml-2">
 {activity.time}
 </span>
 )}
 </div>
 {activity.description && (
 <p className="text-xs text-gray-600 line-clamp-2 mb-1">
 {activity.description}
 </p>
 )}
 {activity.location && (
 <div className="flex items-center space-x-1 text-xs text-gray-500">
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 </svg>
 <span className="truncate">{activity.location}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-6">
 <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <p className="text-sm text-gray-500">No activities</p>
 </div>
 )}
 </div>
 </article>
 );
}
