/**
 * Reference Resolver - Resolves references like "the first one" or "option 2"
 */

import type { ConversationContext, MentionedEntity } from './types';

/**
 * Resolve a reference like "the first one" or "option 2"
 */
export function resolveReference(
  context: ConversationContext,
  reference: string
): MentionedEntity | null {
  const lowerRef = reference.toLowerCase();

  let index: number | null = null;
  if (lowerRef.includes('first') || lowerRef.includes('1')) index = 1;
  else if (lowerRef.includes('second') || lowerRef.includes('2')) index = 2;
  else if (lowerRef.includes('third') || lowerRef.includes('3')) index = 3;
  else if (lowerRef.includes('fourth') || lowerRef.includes('4')) index = 4;
  else if (lowerRef.includes('fifth') || lowerRef.includes('5')) index = 5;
  else if (lowerRef.includes('last')) {
    const allMentioned = [
      ...context.mentionedTrips,
      ...context.mentionedPlaces,
    ].sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime());
    if (allMentioned.length > 0) {
      const latest = allMentioned[0];
      const sameTypeItems =
        latest.type === 'trip'
          ? context.mentionedTrips
          : context.mentionedPlaces;
      return sameTypeItems[sameTypeItems.length - 1] || null;
    }
  }

  if (index === null) return null;

  if (
    lowerRef.includes('trip') ||
    lowerRef.includes('connection') ||
    lowerRef.includes('option')
  ) {
    return context.mentionedTrips.find((t) => t.referenceIndex === index) || null;
  }

  if (
    lowerRef.includes('station') ||
    lowerRef.includes('stop') ||
    lowerRef.includes('place')
  ) {
    return context.mentionedPlaces.find((p) => p.referenceIndex === index) || null;
  }

  const allMentioned = [
    ...context.mentionedTrips,
    ...context.mentionedPlaces,
  ].sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime());

  return allMentioned.find((e) => e.referenceIndex === index) || null;
}
