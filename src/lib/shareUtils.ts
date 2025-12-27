export interface ShareableTrip {
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  transfers?: number;
}

export function generateShareLink(trip: ShareableTrip): string {
  const params = new URLSearchParams({
    from: trip.from,
    to: trip.to,
    ...(trip.departure && { dep: trip.departure }),
    ...(trip.arrival && { arr: trip.arrival }),
  });

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share?${params.toString()}`;
  }

  return `/share?${params.toString()}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function shareTripDetails(trip: ShareableTrip): string {
  return `🚂 ${trip.from} → ${trip.to}
${trip.departure ? `🕐 Departure: ${trip.departure}` : ''}
${trip.arrival ? `🕑 Arrival: ${trip.arrival}` : ''}
${trip.duration ? `⏱️ Duration: ${trip.duration}` : ''}
${trip.transfers !== undefined ? `🔄 Transfers: ${trip.transfers}` : ''}

Powered by SBB Travel Assistant`;
}

export async function shareNative(trip: ShareableTrip): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: `Trip: ${trip.from} → ${trip.to}`,
      text: shareTripDetails(trip),
      url: generateShareLink(trip),
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to share:', err);
    }
    return false;
  }
}

export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
