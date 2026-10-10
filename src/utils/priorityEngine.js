import { getUrgencyInfo, URGENCY_LEVELS, getDaysRemaining } from './dateUtils.js';

/**
 * Deterministic Rescue Priority Engine for FridgeWise AI.
 * Computes transparent, explainable urgency scores for inventory items.
 */

/**
 * Calculates a numerical priority score for an inventory item.
 * Higher score = higher rescue urgency.
 *
 * Scoring methodology:
 * - Days remaining is primary factor.
 * - 'use-by' or 'expiry' date type gets +15 urgency over 'best-before'.
 * - 'refrigerator' items get +10 urgency over 'freezer' (+0) or 'pantry' (+5 for produce, -10 for dry grains).
 * - Items with days < 0 are flagged for inspection (score 90).
 * - Items with days == 0 (today) score 100.
 * - Items with days == 1 (tomorrow) score 85.
 * - Items with days 2-3 score 60-70.
 * - Items 4+ days scale down smoothly.
 *
 * @param {Object} item
 * @param {Date} [referenceDate]
 * @returns {number} Score from 0 to 120
 */
export function calculatePriorityScore(item, referenceDate = new Date()) {
  if (!item || item.status === 'consumed' || item.status === 'discarded') {
    return 0;
  }

  const urgency = getUrgencyInfo(item, referenceDate);
  const days = urgency.daysRemaining;

  if (days === null) {
    // Unknown date: moderate urgency to encourage checking
    return 35;
  }

  let score = 0;

  if (days === 0) {
    score = 100;
  } else if (days < 0) {
    // Past date: needs immediate review/use or discard
    // Slightly capped below "today" because it may already need condition inspection
    score = Math.max(75, 95 - Math.abs(days) * 3);
  } else if (days === 1) {
    score = 85;
  } else if (days <= 3) {
    score = 70 - (days - 2) * 10; // day 2: 70, day 3: 60
  } else if (days <= 7) {
    score = 45 - (days - 4) * 5; // day 4: 45, day 7: 30
  } else {
    score = Math.max(5, 25 - Math.floor(days / 5));
  }

  // Date type modifier
  const dateType = (item.dateType || '').toLowerCase();
  if (dateType === 'use-by' || dateType === 'expiry') {
    score += 10;
  } else if (dateType === 'opened-date') {
    score += 8;
  }

  // Location / perishable modifier
  const location = (item.location || '').toLowerCase();
  const category = (item.category || '').toLowerCase();

  if (location === 'refrigerator') {
    score += 5;
  } else if (location === 'freezer') {
    score -= 10; // Frozen preserves longer
  }

  if (category === 'produce' || category === 'dairy') {
    score += 5; // Fresh items spoil faster
  } else if (category === 'pantry' && (item.unit === 'kg' || item.quantity > 500)) {
    score -= 5; // Dry bulk staples spoil slower
  }

  return Math.max(0, Math.round(score));
}

/**
 * Generates an explainable human-readable justification for an item's priority.
 * @param {Object} item
 * @param {Date} [referenceDate]
 * @returns {string}
 */
export function getPriorityExplanation(item, referenceDate = new Date()) {
  if (!item) return '';
  const urgency = getUrgencyInfo(item, referenceDate);
  const days = urgency.daysRemaining;
  const name = item.name || 'Item';
  const loc = item.location ? ` in the ${item.location}` : '';

  if (days === null) {
    return `${name} has no date recorded. We recommend checking freshness and updating the date.`;
  }
  if (days < 0) {
    const abs = Math.abs(days);
    return `${name} is ${abs} ${abs === 1 ? 'day' : 'days'} past its recorded date${loc}. Please inspect condition before cooking.`;
  }
  if (days === 0) {
    return `${name} reached its recorded date today${loc}. Prioritize this in your upcoming meal!`;
  }
  if (days === 1) {
    return `${name} is due tomorrow${loc}. Ideal candidate for today or tomorrow's recipe.`;
  }
  if (days <= 3) {
    return `${name} has ${days} days remaining${loc}. Good to incorporate into this week's meal plan.`;
  }
  return `${name} is safely stored with ${days} days remaining.`;
}

/**
 * Sorts and organizes inventory into actionable rescue groupings.
 * @param {Array<Object>} inventory
 * @param {Date} [referenceDate]
 * @returns {{
 *   sortedItems: Array<Object>,
 *   needsAttentionToday: Array<Object>,
 *   comingUpSoon: Array<Object>,
 *   pastDateReview: Array<Object>,
 *   stableItems: Array<Object>,
 *   topRescueItem: Object|null,
 *   rescueSummary: string
 * }}
 */
export function analyzeInventoryUrgency(inventory = [], referenceDate = new Date()) {
  const activeItems = (inventory || []).filter(item => item && item.status !== 'consumed' && item.status !== 'discarded');

  const scoredItems = activeItems.map(item => {
    const score = calculatePriorityScore(item, referenceDate);
    const urgency = getUrgencyInfo(item, referenceDate);
    const explanation = getPriorityExplanation(item, referenceDate);
    return {
      ...item,
      priorityScore: score,
      urgency,
      urgencyExplanation: explanation
    };
  });

  // Sort descending by priority score
  scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);

  const needsAttentionToday = scoredItems.filter(i => i.urgency.daysRemaining !== null && i.urgency.daysRemaining >= 0 && i.urgency.daysRemaining <= 1);
  const comingUpSoon = scoredItems.filter(i => i.urgency.daysRemaining !== null && i.urgency.daysRemaining >= 2 && i.urgency.daysRemaining <= 3);
  const pastDateReview = scoredItems.filter(i => i.urgency.daysRemaining !== null && i.urgency.daysRemaining < 0);
  const stableItems = scoredItems.filter(i => i.urgency.daysRemaining === null || i.urgency.daysRemaining >= 4);

  const topRescueItem = scoredItems.length > 0 ? scoredItems[0] : null;

  let rescueSummary = 'All ingredients look fresh and stable.';
  if (needsAttentionToday.length > 0) {
    rescueSummary = `${needsAttentionToday.length} ${needsAttentionToday.length === 1 ? 'item needs' : 'items need'} attention today.`;
  } else if (pastDateReview.length > 0) {
    rescueSummary = `${pastDateReview.length} ${pastDateReview.length === 1 ? 'item requires' : 'items require'} condition review.`;
  } else if (comingUpSoon.length > 0) {
    rescueSummary = `${comingUpSoon.length} ${comingUpSoon.length === 1 ? 'item coming' : 'items coming'} up in 2-3 days.`;
  }

  return {
    sortedItems: scoredItems,
    needsAttentionToday,
    comingUpSoon,
    pastDateReview,
    stableItems,
    topRescueItem,
    rescueSummary
  };
}
