import { parseLocalDate, getDaysRemaining } from '../utils/dateUtils.js';

/**
 * rescuePriority.js
 * Deterministic and explainable Rescue Mode Priority Algorithm for FridgeWise AI.
 */

export const RESCUE_CATEGORIES = {
  PAST_DATE_REVIEW: 'PAST_DATE_REVIEW',
  NEEDS_ATTENTION_TODAY: 'NEEDS_ATTENTION_TODAY',
  COMING_UP_SOON: 'COMING_UP_SOON',
  UNKNOWN_DATE: 'UNKNOWN_DATE',
  STABLE: 'STABLE'
};

/**
 * Evaluates an individual inventory item and assigns an attention category and explanation.
 * Excludes UTC shifting by normalizing to local midnight.
 *
 * @param {Object} item
 * @param {Date} [referenceDate]
 * @returns {{
 *   category: string,
 *   daysRemaining: number|null,
 *   priorityRank: number,
 *   label: string,
 *   explanation: string,
 *   isReviewRecommended: boolean
 * }}
 */
export function evaluateItemPriority(item, referenceDate = new Date()) {
  if (!item || item.status === 'consumed' || item.status === 'discarded' || Number(item.quantity) <= 0) {
    return {
      category: RESCUE_CATEGORIES.STABLE,
      daysRemaining: null,
      priorityRank: 999,
      label: 'Inactive',
      explanation: 'Item is fully consumed or discarded.',
      isReviewRecommended: false
    };
  }

  if (!item.date) {
    return {
      category: RESCUE_CATEGORIES.UNKNOWN_DATE,
      daysRemaining: null,
      priorityRank: 40,
      label: 'Date unrecorded',
      explanation: `${item.name} has no recorded date. Check packaging freshness and inspect regularly.`,
      isReviewRecommended: true
    };
  }

  const daysRemaining = getDaysRemaining(item.date, referenceDate);
  if (daysRemaining === null) {
    return {
      category: RESCUE_CATEGORIES.UNKNOWN_DATE,
      daysRemaining: null,
      priorityRank: 40,
      label: 'Unrecognized date',
      explanation: `Could not parse date for ${item.name}. Please verify date format.`,
      isReviewRecommended: true
    };
  }

  const dateType = (item.dateType || 'best-before').toLowerCase();
  const isUseBy = dateType === 'use-by' || dateType === 'expiry';
  const location = item.location ? ` in the ${item.location}` : '';

  // 1. Past recorded date — review
  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    const dayStr = absDays === 1 ? '1 day' : `${absDays} days`;
    return {
      category: RESCUE_CATEGORIES.PAST_DATE_REVIEW,
      daysRemaining,
      priorityRank: 10 + Math.min(absDays, 10),
      label: `Past recorded date (${dayStr} ago)`,
      explanation: isUseBy
        ? `${item.name} is past its ${dateType} date by ${dayStr}${location}. Inspect odor, texture, and packaging before consuming.`
        : `${item.name} is past its best-before date by ${dayStr}${location}. Quality date passed; inspect condition.`,
      isReviewRecommended: true
    };
  }

  // 2. Needs attention today (0 or 1 day left)
  if (daysRemaining === 0) {
    return {
      category: RESCUE_CATEGORIES.NEEDS_ATTENTION_TODAY,
      daysRemaining: 0,
      priorityRank: 1, // Highest urgency
      label: 'Review today',
      explanation: `${item.name} has reached its recorded ${dateType} date today${location}. Prioritize in your next meal.`,
      isReviewRecommended: true
    };
  }

  if (daysRemaining === 1) {
    return {
      category: RESCUE_CATEGORIES.NEEDS_ATTENTION_TODAY,
      daysRemaining: 1,
      priorityRank: 2,
      label: 'Due tomorrow',
      explanation: `${item.name} is due tomorrow${location}. Plan to cook or freeze within 24 hours.`,
      isReviewRecommended: true
    };
  }

  // 3. Coming up soon (2-3 days)
  if (daysRemaining <= 3) {
    return {
      category: RESCUE_CATEGORIES.COMING_UP_SOON,
      daysRemaining,
      priorityRank: 20 + daysRemaining,
      label: `${daysRemaining} days left`,
      explanation: `${item.name} is coming up in ${daysRemaining} days${location}. Ideal candidate for this week's meal plan.`,
      isReviewRecommended: false
    };
  }

  // 4. Stable (4+ days)
  return {
    category: RESCUE_CATEGORIES.STABLE,
    daysRemaining,
    priorityRank: 100 + daysRemaining,
    label: `${daysRemaining} days left`,
    explanation: `${item.name} is fresh and well within its recorded shelf life.`,
    isReviewRecommended: false
  };
}

/**
 * Sorts and groups active inventory by explainable rescue urgency.
 *
 * @param {Array<Object>} inventory
 * @param {Date} [referenceDate]
 * @returns {{
 *   sortedItems: Array<Object>,
 *   needsAttentionToday: Array<Object>,
 *   pastDateReview: Array<Object>,
 *   comingUpSoon: Array<Object>,
 *   unknownDateItems: Array<Object>,
 *   stableItems: Array<Object>,
 *   topPriorityItem: Object|null,
 *   summaryMessage: string
 * }}
 */
export function rankRescueInventory(inventory = [], referenceDate = new Date()) {
  const activeItems = (inventory || []).filter(item =>
    item &&
    item.status !== 'consumed' &&
    item.status !== 'discarded' &&
    Number(item.quantity) > 0
  );

  const evaluated = activeItems.map(item => {
    const evalResult = evaluateItemPriority(item, referenceDate);
    return {
      ...item,
      rescueEvaluation: evalResult,
      // For backward compatibility with existing components
      urgency: {
        level: evalResult.category,
        daysRemaining: evalResult.daysRemaining,
        label: evalResult.label,
        badgeColor: evalResult.category === RESCUE_CATEGORIES.NEEDS_ATTENTION_TODAY
          ? 'red'
          : evalResult.category === RESCUE_CATEGORIES.PAST_DATE_REVIEW
          ? 'amber'
          : evalResult.category === RESCUE_CATEGORIES.COMING_UP_SOON
          ? 'yellow'
          : 'emerald',
        explanation: evalResult.explanation
      },
      priorityScore: 100 - Math.min(100, evalResult.priorityRank),
      urgencyExplanation: evalResult.explanation
    };
  });

  // Sort ascending by priorityRank (lowest rank number = highest urgency)
  evaluated.sort((a, b) => a.rescueEvaluation.priorityRank - b.rescueEvaluation.priorityRank);

  const needsAttentionToday = evaluated.filter(i => i.rescueEvaluation.category === RESCUE_CATEGORIES.NEEDS_ATTENTION_TODAY);
  const pastDateReview = evaluated.filter(i => i.rescueEvaluation.category === RESCUE_CATEGORIES.PAST_DATE_REVIEW);
  const comingUpSoon = evaluated.filter(i => i.rescueEvaluation.category === RESCUE_CATEGORIES.COMING_UP_SOON);
  const unknownDateItems = evaluated.filter(i => i.rescueEvaluation.category === RESCUE_CATEGORIES.UNKNOWN_DATE);
  const stableItems = evaluated.filter(i => i.rescueEvaluation.category === RESCUE_CATEGORIES.STABLE);

  const topPriorityItem = evaluated.length > 0 && evaluated[0].rescueEvaluation.priorityRank < 50
    ? evaluated[0]
    : null;

  let summaryMessage = 'All ingredients look fresh and stable.';
  const totalUrgent = needsAttentionToday.length + pastDateReview.length;

  if (totalUrgent === 1) {
    summaryMessage = '1 ingredient needs your attention.';
  } else if (totalUrgent > 1) {
    summaryMessage = `${totalUrgent} ingredients need your attention.`;
  } else if (comingUpSoon.length > 0) {
    summaryMessage = `${comingUpSoon.length} item(s) coming up in 2-3 days.`;
  }

  return {
    sortedItems: evaluated,
    needsAttentionToday,
    pastDateReview,
    comingUpSoon,
    unknownDateItems,
    stableItems,
    topPriorityItem,
    summaryMessage
  };
}

/**
 * Explains why a recipe is recommended in transparent natural language.
 *
 * @param {Object} recipe
 * @param {Object} topItem
 * @returns {string}
 */
export function generateRecipeRationale(recipe, topItem = null) {
  const availableCount = recipe.availableIngredients?.length || 0;
  const totalCount = recipe.requiredIngredients?.length || 0;

  if (topItem && recipe.urgentRescuedNames?.length > 0) {
    return `Recommended because it uses ${topItem.name} that needs attention today, and ${availableCount} of the ${totalCount} required ingredients are already available.`;
  }

  if (availableCount === totalCount && totalCount > 0) {
    return `100% pantry ready: you already have all ${totalCount} required ingredients in your fridge and pantry.`;
  }

  return `Uses ${availableCount} of ${totalCount} ingredients you already own.`;
}
