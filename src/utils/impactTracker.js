import { parseLocalDate } from './dateUtils.js';

/**
 * Impact Tracker for FridgeWise AI.
 * Computes strictly verified food-saving metrics from user-confirmed actions.
 * No speculative carbon savings, no inflated estimates.
 */

/**
 * Calculates verified metrics from activity history.
 * @param {Array<Object>} activities
 * @param {Date} [referenceDate]
 * @returns {{
 *   totalConsumedEvents: number,
 *   totalDiscardedEvents: number,
 *   itemsRescuedBeforeDeadline: number,
 *   totalValueRescued: number,
 *   weeklyConsumedCount: number,
 *   weeklyRescuedCount: number,
 *   hasPriceData: boolean,
 *   discardReasons: Object
 * }}
 */
export function calculateImpactMetrics(activities = [], referenceDate = new Date()) {
  const ref = parseLocalDate(referenceDate) || new Date();
  const sevenDaysAgoMs = ref.getTime() - (7 * 24 * 60 * 60 * 1000);

  let totalConsumedEvents = 0;
  let totalDiscardedEvents = 0;
  let itemsRescuedBeforeDeadline = 0;
  let totalValueRescued = 0;
  let weeklyConsumedCount = 0;
  let weeklyRescuedCount = 0;
  let hasPriceData = false;
  const discardReasons = {};

  for (const act of activities) {
    if (!act) continue;

    const actTime = act.timestamp ? new Date(act.timestamp).getTime() : 0;
    const isThisWeek = actTime >= sevenDaysAgoMs;

    if (act.type === 'consumed' || act.type === 'partially_consumed') {
      totalConsumedEvents += 1;
      if (isThisWeek) weeklyConsumedCount += 1;

      // Track price if provided
      if (act.value && Number(act.value) > 0) {
        totalValueRescued += Number(act.value);
        hasPriceData = true;
      }

      // Check if item was rescued on or before its recorded date
      if (act.recordedDate && act.timestamp) {
        const itemDeadline = parseLocalDate(act.recordedDate);
        const eventDate = parseLocalDate(act.timestamp);
        if (itemDeadline && eventDate && eventDate.getTime() <= itemDeadline.getTime()) {
          itemsRescuedBeforeDeadline += 1;
          if (isThisWeek) weeklyRescuedCount += 1;
        }
      } else if (act.wasUrgent) {
        // Flagged as urgent when cooked
        itemsRescuedBeforeDeadline += 1;
        if (isThisWeek) weeklyRescuedCount += 1;
      }
    } else if (act.type === 'discarded') {
      totalDiscardedEvents += 1;
      const reason = act.reason || 'Not specified';
      discardReasons[reason] = (discardReasons[reason] || 0) + 1;
    }
  }

  return {
    totalConsumedEvents,
    totalDiscardedEvents,
    itemsRescuedBeforeDeadline,
    totalValueRescued: Math.round(totalValueRescued * 100) / 100,
    weeklyConsumedCount,
    weeklyRescuedCount,
    hasPriceData,
    discardReasons
  };
}
