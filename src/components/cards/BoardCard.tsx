'use client';

interface BoardCardProps {
 data: {
 station?: string;
 type?: 'departures' | 'arrivals';
 connections?: Array<{
 time?: string;
 destination?: string;
 origin?: string;
 platform?: string;
 line?: string;
 delay?: string;
 type?: string;
 }>;
 };
}

export default function BoardCard({ data }: BoardCardProps) {
 const { station, type = 'departures', connections = [] } = data;
  // Handle raw MCP format
  const rawData = data as any;
  const extractedConnections = rawData.departures || rawData.arrivals || rawData.events || connections;
  const extractedType = rawData.departures ? "departures" : rawData.arrivals ? "arrivals" : type;
  const extractedStation = rawData.stationName || station;
  const finalConnections = Array.isArray(extractedConnections) ? extractedConnections : connections;
  const finalType = extractedType;
  const finalStation = extractedStation;

 const formatTime = (time?: string) => {
 if (!time) return '--:--';
 try {
 return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 } catch {
 return time;
 }
 };

 const getTransportIcon = (transportType?: string) => {
 if (!transportType) return '🚂';
 const t = transportType.toLowerCase();
 if (t.includes('train') || t.includes('rail')) return '🚂';
 if (t.includes('bus')) return '🚌';
 if (t.includes('tram')) return '🚃';
 if (t.includes('boat') || t.includes('ship')) return '⛴️';
 return '🚂';
 };

 const isDeparture = finalType === 'departures';

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-purple-500"
 data-testid="board-card"
 aria-label={`${isDeparture ? 'Departures' : 'Arrivals'} board for ${finalStation || 'station'}`}
 >
 {/* Compact Header */}
 <div className={`px-4 py-2 ${isDeparture ? 'bg-linear-to-r from-purple-600 to-purple-700' : 'bg-linear-to-r from-blue-600 to-blue-700'}`}>
 <div className="flex items-center space-x-2 text-white">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 {isDeparture ? (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
 ) : (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
 )}
 </svg>
 <div>
 <h3 className="text-lg font-bold">{isDeparture ? 'Departures' : 'Arrivals'}</h3>
 <p className="text-xs text-purple-100">{finalStation || 'Station'}</p>
 </div>
 </div>
 </div>

 {/* Compact Connections List */}
 <div className="divide-y divide-gray-200">
 {connections.length > 0 ? (
 finalConnections.slice(0, 5).map((conn, idx) => (
 <div
 key={idx}
 className="p-2 hover:bg-gray-50 transition-colors"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2 flex-1 min-w-0">
 {/* Time */}
 <div className="w-12 shrink-0">
 <p className="text-lg font-bold text-gray-900">
 {formatTime(conn.time)}
 </p>
 {conn.delay && (
 <span className="text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded">
 {conn.delay}
 </span>
 )}
 </div>

 {/* Icon */}
 <span className="text-lg" aria-hidden="true">{getTransportIcon(conn.type)}</span>

 {/* Destination/Origin */}
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900 truncate">
 {isDeparture ? (conn.destination || 'Unknown') : (conn.origin || 'Unknown')}
 </p>
 {conn.line && (
 <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
 {conn.line}
 </span>
 )}
 </div>

 {/* Platform */}
 {conn.platform && (
 <div className="text-right shrink-0">
 <p className="text-xs text-gray-500">Pl.</p>
 <p className="text-lg font-bold text-purple-600">
 {conn.platform}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="p-6 text-center">
 <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-sm text-gray-500">No {isDeparture ? 'departures' : 'arrivals'}</p>
 </div>
 )}
 </div>

 {/* Compact Footer */}
 {finalConnections.length > 5 && (
 <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
 <p className="text-xs text-gray-600 text-center">
 +{finalConnections.length - 5} more
 </p>
 </div>
 )}
 </article>
 );
}
