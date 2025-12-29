'use client';

import { useSavedTrips } from '@/hooks/useSavedTrips';

export default function SavedTripsList() {
  const { savedTrips, removeTrip } = useSavedTrips();

  if (savedTrips.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">
          🎫
        </div>
        <p className="text-gray-900 font-medium mb-1">No saved trips yet</p>
        <p className="text-gray-500 text-sm">Star a trip in the chat to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedTrips.map((trip) => (
        <div key={trip.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-xl text-gray-900">{trip.from}</span>
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-bold text-xl text-gray-900">{trip.to}</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <span className="text-gray-400">🕒</span> {trip.departure}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <span className="text-gray-400">⏱️</span> {trip.duration}
              </span>
              {trip.transfers !== undefined && (
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                  <span className="text-gray-400">🔄</span> {trip.transfers}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => removeTrip(trip.id)}
            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Remove saved trip"
            aria-label="Remove trip"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
