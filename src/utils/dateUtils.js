/**
 * Safe date parsing and urgency classification utilities for FridgeWise AI.
 * Handles date-only inputs without UTC shifting.
 */

/**
 * Normalizes a date or date-string (YYYY-MM-DD or ISO) into local midnight Date object.
 * Prevents UTC timezone shifting where 2026-10-10 could become 2026-10-09 in local time.
 * @param {string|Date} dateInput
 * @returns {Date|null} Date at local midnight (00:00:00)
 */
export function parseLocalDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (typeof dateInput === 'string') {
    // Handle YYYY-MM-DD
    const match = dateInput.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
}

/**
 * Calculates days remaining between a target date and reference date (defaults to today).
 * Negative means days past the recorded date.
 * @param {string|Date} targetDate
 * @param {Date} [referenceDate]
 * @returns {number|null} Whole days remaining
 */
export function getDaysRemaining(targetDate, referenceDate = new Date()) {
  const target = parseLocalDate(targetDate);
  if (!target) return null;
  const ref = parseLocalDate(referenceDate);
  const diffMs = target.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export const URGENCY_LEVELS = {
  PAST_DATE: 'PAST_DATE',          // Past recorded date - requires condition check
  TODAY: 'TODAY',                  // Due today or tomorrow (0 or 1 day left)
  SOON: 'SOON',                    // 2 to 3 days left
  STABLE: 'STABLE',                // 4+ days left
  UNKNOWN: 'UNKNOWN'               // No valid date recorded
};

/**
 * Categorizes an inventory item's urgency based on date, date type, and location.
 * @param {Object} item
 * @param {Date} [referenceDate]
 * @returns {{ level: string, daysRemaining: number|null, label: string, badgeColor: string, explanation: string }}
 */
export function getUrgencyInfo(item, referenceDate = new Date()) {
  if (!item || !item.date) {
    return {
      level: URGENCY_LEVELS.UNKNOWN,
      daysRemaining: null,
      label: 'Date unrecorded',
      badgeColor: 'gray',
      explanation: 'No date recorded. Inspect condition and freshness regularly.'
    };
  }

  const days = getDaysRemaining(item.date, referenceDate);
  if (days === null) {
    return {
      level: URGENCY_LEVELS.UNKNOWN,
      daysRemaining: null,
      label: 'Invalid date',
      badgeColor: 'gray',
      explanation: 'Unrecognized date format. Please update item date.'
    };
  }

  const dateType = item.dateType || 'best-before'; // 'use-by', 'best-before', 'opened-date', 'expiry'
  const isUseBy = dateType === 'use-by' || dateType === 'expiry';

  if (days < 0) {
    const absDays = Math.abs(days);
    const dayStr = absDays === 1 ? '1 day' : `${absDays} days`;
    return {
      level: URGENCY_LEVELS.PAST_DATE,
      daysRemaining: days,
      label: `Past date (${dayStr} ago)`,
      badgeColor: 'amber',
      explanation: isUseBy
        ? `Past ${dateType} date by ${dayStr}. Check smell, texture, and packaging before consuming.`
        : `Past best-before date by ${dayStr}. Food may still be good; inspect quality.`
    };
  }

  if (days === 0) {
    return {
      level: URGENCY_LEVELS.TODAY,
      daysRemaining: 0,
      label: 'Needs attention today',
      badgeColor: 'red',
      explanation: `Recorded ${dateType} is today. Prioritize in your next meal.`
    };
  }

  if (days === 1) {
    return {
      level: URGENCY_LEVELS.TODAY,
      daysRemaining: 1,
      label: 'Due tomorrow',
      badgeColor: 'orange',
      explanation: `Recorded ${dateType} is tomorrow. Plan to use very soon.`
    };
  }

  if (days <= 3) {
    return {
      level: URGENCY_LEVELS.SOON,
      daysRemaining: days,
      label: `${days} days left`,
      badgeColor: 'yellow',
      explanation: `Approaching date in ${days} days. Good candidate for upcoming meals.`
    };
  }

  return {
    level: URGENCY_LEVELS.STABLE,
    daysRemaining: days,
    label: `${days} days left`,
    badgeColor: 'emerald',
    explanation: 'Fresh and well within recorded date window.'
  };
}

/**
 * Formats a date string nicely (e.g. "12 Oct 2026")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDisplayDate(dateInput) {
  const d = parseLocalDate(dateInput);
  if (!d) return 'No date';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns today's date formatted as YYYY-MM-DD for form default values.
 * @param {number} [offsetDays=0]
 * @returns {string}
 */
export function getIsoDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
