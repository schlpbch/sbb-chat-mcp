'use client';

import { useState } from 'react';
import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableTrip } from '@/lib/shareUtils';

interface TripCardProps {
 data: any;
}

export default function TripCard({ data }: TripCardProps) {
 const [isExpanded, setIsExpanded] = useState(false);

 const legs = data.legs || [];
 const firstLeg = legs[0];
 const lastLeg = legs[legs.length - 1];

 const getStopInfo = (leg: any, isStart: boolean) => {
 if (!leg) return { name: 'Unknown', time: null, platform: null, delay: null };

 if (leg.serviceJourney) {
 const points = leg.serviceJourney.stopPoints || [];
 const point = isStart ? points[0] : points[points.length - 1];
 const timeData = isStart ? point?.departure : point?.arrival;
 return {
 name: point?.place?.name || 'Unknown',
 time: timeData?.timeAimed || timeData?.timeRt || null,
 platform: point?.platform || null,
 delay: timeData?.delayText || null,
 };
 }

 if (isStart) {
 const point = leg.start;
 return {
 name: point?.place?.name || leg.origin?.name || 'Unknown',
 time: leg.departure || leg.start?.departure?.timeAimed || null,
 platform: null,
 delay: null,
 };
 } else {
 const point = leg.end;
 return {
 name: point?.place?.name || leg.destination?.name || 'Unknown',
 time: leg.arrival || leg.end?.arrival?.timeAimed || null,
 platform: null,
 delay: null,
 };
 }
 };

 const getTripEndpoints = () => {
 const tripOrigin = data.origin?.name || data.start?.place?.name;
 const tripDest = data.destination?.name || data.end?.place?.name;
 const tripDepartureTime = data.departure || data.start?.departure?.timeAimed;
 const tripArrivalTime = data.arrival || data.end?.arrival?.timeAimed;

 const legOrigin = getStopInfo(firstLeg, true);
 const legDest = getStopInfo(lastLeg, false);

 return {
 origin: {
 name: tripOrigin || legOrigin.name,
 time: tripDepartureTime || legOrigin.time,
 platform: legOrigin.platform,
 delay: legOrigin.delay,
 },
 destination: {
 name: tripDest || legDest.name,
 time: tripArrivalTime || legDest.time,
 platform: legDest.platform,
 delay: legDest.delay,
 },
 };
 };

 const endpoints = getTripEndpoints();
 const origin = endpoints.origin;
 const destination = endpoints.destination;

 const formatDuration = (d?: string) => {
 if (!d) return 'N/A';
 return d.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase();
 };

 const formatTime = (time: string | null) => {
 if (!time) return '--:--';
 return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 const durationStr = formatDuration(data.duration);
 const serviceLegs = legs.filter((l: any) => l.serviceJourney);
 const transfers = serviceLegs.length - 1;

 const getTransportIcon = (leg: any) => {
 if (leg.type === 'WalkLeg') return '🚶';
 const mode = leg.serviceJourney?.serviceProducts?.[0]?.vehicleMode?.name?.toLowerCase() || '';
 if (mode.includes('train') || mode.includes('rail')) return '🚂';
 if (mode.includes('bus')) return '🚌';
 if (mode.includes('tram')) return '🚃';
 if (mode.includes('boat') || mode.includes('ship')) return '⛴️';
 if (mode.includes('cable') || mode.includes('gondola')) return '🚡';
 return '🚂';
 };

 // Prepare shareable trip data
 const shareableTrip: ShareableTrip = {
 from: origin.name,
 to: destination.name,
 departure: origin.time ? formatTime(origin.time) : undefined,
 arrival: destination.time ? formatTime(destination.time) : undefined,
 duration: durationStr !== 'N/A' ? durationStr : undefined,
 transfers: transfers > 0 ? transfers : undefined,
 };

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-500"
 data-testid="trip-card"
 aria-label={`Trip from ${origin.name} to ${destination.name}, duration ${durationStr}`}
 >
 {/* Compact Header */}
 <div className="bg-linear-to-r from-green-600 to-green-700 px-4 py-2">
 <div className="flex items-center justify-between text-white text-sm">
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 <span className="font-semibold">{durationStr}</span>
 </div>
 <div className="flex items-center space-x-2">
 {transfers > 0 && (
 <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-semibold">
 {transfers} {transfers === 1 ? 'change' : 'changes'}
 </span>
 )}
 <span className="text-xs opacity-80">{legs.length} {legs.length === 1 ? 'leg' : 'legs'}</span>
 <ShareMenu trip={shareableTrip} />
 </div>
 </div>
 </div>

 {/* Additional Trip Info Bar */}
 <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center space-x-3">
 {/* Price */}
 {data.price && (
 <div className="flex items-center space-x-1 text-green-700">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-semibold">CHF {data.price}</span>
 </div>
 )}
 
 {/* Accessibility */}
 {data.accessible !== false && (
 <div className="flex items-center space-x-1 text-blue-600">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 <span>Accessible</span>
 </div>
 )}
 
 {/* Occupancy */}
 {data.occupancy && (
 <div className="flex items-center space-x-1 text-orange-600">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 <span>{data.occupancy}</span>
 </div>
 )}
 </div>
 
 {/* Operator/Company */}
 {serviceLegs[0]?.serviceJourney?.serviceProducts?.[0]?.corporateIdentity?.name && (
 <div className="text-gray-600">
 <span className="font-medium">
 {serviceLegs[0].serviceJourney.serviceProducts[0].corporateIdentity.name}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Compact Trip Overview */}
 <div className="p-3">
 <div className="flex items-center justify-between">
 {/* Origin */}
 <div className="flex-1 min-w-0">
 <p className="text-xl font-bold text-gray-900">
 {formatTime(origin.time)}
 </p>
 <p className="text-sm font-semibold text-gray-700 truncate">
 {origin.name}
 </p>
 <div className="flex items-center space-x-1 mt-1">
 {origin.platform && (
 <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
 Pl. {origin.platform}
 </span>
 )}
 {origin.delay && (
 <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
 {origin.delay}
 </span>
 )}
 </div>
 </div>

 {/* Arrow with leg count */}
 <div className="flex flex-col items-center px-3">
 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </div>

 {/* Destination */}
 <div className="flex-1 min-w-0 text-right">
 <p className="text-xl font-bold text-gray-900">
 {formatTime(destination.time)}
 </p>
 <p className="text-sm font-semibold text-gray-700 truncate">
 {destination.name}
 </p>
 <div className="flex items-center justify-end space-x-1 mt-1">
 {destination.platform && (
 <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
 Pl. {destination.platform}
 </span>
 )}
 {destination.delay && (
 <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
 {destination.delay}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Quick Leg Overview - Always Visible */}
 {legs.length > 0 && (
 <div className="mt-3 pt-3 border-t border-gray-200">
 <div className="flex items-center space-x-2 overflow-x-auto pb-1">
 {legs.map((leg: any, idx: number) => {
 const lineName = leg.serviceJourney?.serviceProducts?.[0]?.name || '';
 const isWalk = leg.type === 'WalkLeg';
 
 return (
 <div key={idx} className="flex items-center space-x-1 shrink-0">
 <span className="text-lg">{getTransportIcon(leg)}</span>
 {lineName && (
 <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
 {lineName}
 </span>
 )}
 {idx < legs.length - 1 && (
 <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Expand/Collapse Button */}
 {legs.length > 0 && (
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="mt-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-xs transition-colors flex items-center justify-center space-x-1"
 >
 <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
 <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>
 )}

 {/* Detailed Legs */}
 {isExpanded && (
 <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
 {legs.map((leg: any, idx: number) => {
 const isWalk = leg.type === 'WalkLeg';
 const legStart = getStopInfo(leg, true);
 const legEnd = getStopInfo(leg, false);
 const lineName = leg.serviceJourney?.serviceProducts?.[0]?.name || '';
 const direction = leg.serviceJourney?.directionText || '';

 return (
 <div key={idx} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg text-sm">
 <div className="text-xl mt-0.5">{getTransportIcon(leg)}</div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-2 mb-1">
 {lineName && (
 <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
 {lineName}
 </span>
 )}
 {direction && (
 <span className="text-xs text-gray-600 truncate">→ {direction}</span>
 )}
 </div>
 <div className="space-y-1">
 <div className="flex items-center space-x-2">
 <span className="text-xs font-semibold text-gray-900 w-12">
 {formatTime(legStart.time)}
 </span>
 <span className="text-xs text-gray-600 truncate">{legStart.name}</span>
 {legStart.platform && (
 <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded shrink-0">
 Pl. {legStart.platform}
 </span>
 )}
 </div>
 <div className="flex items-center space-x-2">
 <span className="text-xs font-semibold text-gray-900 w-12">
 {formatTime(legEnd.time)}
 </span>
 <span className="text-xs text-gray-600 truncate">{legEnd.name}</span>
 {legEnd.platform && (
 <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded shrink-0">
 Pl. {legEnd.platform}
 </span>
 )}
 </div>
 </div>
 {leg.duration && (
 <p className="text-xs text-gray-500 mt-1">
 {formatDuration(leg.duration)}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </article>
 );
}
