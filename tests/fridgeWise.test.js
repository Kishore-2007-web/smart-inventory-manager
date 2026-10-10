import { describe, it, expect } from 'vitest';
import { parseLocalDate, getDaysRemaining, getUrgencyInfo, URGENCY_LEVELS } from '../src/utils/dateUtils.js';
import { calculatePriorityScore, analyzeInventoryUrgency } from '../src/utils/priorityEngine.js';
import { evaluateRecipeMatch, getRecommendedRecipes, deductUsedIngredients, BUILT_IN_RECIPES } from '../src/utils/recipeEngine.js';
import { calculateImpactMetrics } from '../src/utils/impactTracker.js';

describe('FridgeWise Core Engine Tests', () => {
  describe('1. Date Calculations & Time Zone Safety', () => {
    it('parses YYYY-MM-DD at local midnight without UTC drift', () => {
      const parsed = parseLocalDate('2026-10-15');
      expect(parsed).not.toBeNull();
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9); // 0-indexed October
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getHours()).toBe(0);
    });

    it('calculates days remaining accurately', () => {
      const ref = new Date(2026, 9, 10); // 10 Oct 2026
      expect(getDaysRemaining('2026-10-10', ref)).toBe(0); // Today
      expect(getDaysRemaining('2026-10-11', ref)).toBe(1); // Tomorrow
      expect(getDaysRemaining('2026-10-13', ref)).toBe(3); // In 3 days
      expect(getDaysRemaining('2026-10-08', ref)).toBe(-2); // 2 days past
    });

    it('correctly classifies urgency levels', () => {
      const ref = new Date(2026, 9, 10);
      const itemToday = { name: 'Spinach', date: '2026-10-10', dateType: 'use-by' };
      const itemTomorrow = { name: 'Tomatoes', date: '2026-10-11', dateType: 'best-before' };
      const itemSoon = { name: 'Milk', date: '2026-10-13', dateType: 'use-by' };
      const itemPast = { name: 'Bread', date: '2026-10-09', dateType: 'best-before' };
      const itemNoDate = { name: 'Lentils' };

      expect(getUrgencyInfo(itemToday, ref).level).toBe(URGENCY_LEVELS.TODAY);
      expect(getUrgencyInfo(itemTomorrow, ref).level).toBe(URGENCY_LEVELS.TODAY);
      expect(getUrgencyInfo(itemSoon, ref).level).toBe(URGENCY_LEVELS.SOON);
      expect(getUrgencyInfo(itemPast, ref).level).toBe(URGENCY_LEVELS.PAST_DATE);
      expect(getUrgencyInfo(itemNoDate, ref).level).toBe(URGENCY_LEVELS.UNKNOWN);
    });
  });

  describe('2. Deterministic Rescue Priority Engine', () => {
    it('gives highest rescue urgency to items expiring today in refrigerator', () => {
      const ref = new Date(2026, 9, 10);
      const spinachToday = {
        id: '1',
        name: 'Fresh Spinach',
        date: '2026-10-10',
        dateType: 'use-by',
        location: 'refrigerator',
        category: 'produce',
        quantity: 250,
        unit: 'g'
      };
      const lentils = {
        id: '2',
        name: 'Toor Dal',
        date: '2026-12-10',
        dateType: 'best-before',
        location: 'pantry',
        category: 'pantry',
        quantity: 500,
        unit: 'g'
      };

      const scoreSpinach = calculatePriorityScore(spinachToday, ref);
      const scoreLentils = calculatePriorityScore(lentils, ref);

      expect(scoreSpinach).toBeGreaterThan(scoreLentils);
      expect(scoreSpinach).toBeGreaterThanOrEqual(100);

      const analysis = analyzeInventoryUrgency([spinachToday, lentils], ref);
      expect(analysis.needsAttentionToday.length).toBe(1);
      expect(analysis.topRescueItem.name).toBe('Fresh Spinach');
    });
  });

  describe('3. Recipe Matching & Urgent Ingredient Prioritization', () => {
    it('prioritizes recipes that rescue urgent ingredients', () => {
      const ref = new Date(2026, 9, 10);
      const inventory = [
        { id: '1', name: 'Fresh Spinach', date: '2026-10-10', dateType: 'use-by', quantity: 250, unit: 'g', location: 'refrigerator' },
        { id: '2', name: 'Toor Dal', date: '2026-12-10', dateType: 'best-before', quantity: 500, unit: 'g', location: 'pantry' },
        { id: '3', name: 'Tomatoes', date: '2026-10-12', dateType: 'best-before', quantity: 500, unit: 'g', location: 'refrigerator' },
        { id: '4', name: 'Onions', date: '2026-10-20', dateType: 'best-before', quantity: 1, unit: 'kg', location: 'pantry' }
      ];

      const scoredInventory = analyzeInventoryUrgency(inventory, ref).sortedItems;
      const recommendations = getRecommendedRecipes(scoredInventory);

      expect(recommendations.length).toBeGreaterThan(0);
      const topRecipe = recommendations[0];
      // Palak Dal should be top recommended because it rescues urgent spinach
      expect(topRecipe.id).toBe('spinach-dal');
      expect(topRecipe.urgentRescueCount).toBeGreaterThan(0);
      expect(topRecipe.availableIngredients.some(i => i.name === 'Spinach')).toBe(true);
    });
  });

  describe('4. Inventory Deduction (Partial & Complete)', () => {
    it('accurately deducts partial quantity and records activity event', () => {
      const inventory = [
        { id: 'item_spinach', name: 'Spinach', quantity: 300, unit: 'g', price: 30, status: 'active', date: '2026-10-10' }
      ];

      // Use 100g of 300g spinach
      const { updatedInventory, activityEvents } = deductUsedIngredients(inventory, [
        { itemId: 'item_spinach', quantityUsed: 100 }
      ]);

      expect(updatedInventory[0].quantity).toBe(200);
      expect(updatedInventory[0].status).toBe('active');
      expect(activityEvents.length).toBe(1);
      expect(activityEvents[0].type).toBe('partially_consumed');
      expect(activityEvents[0].quantityUsed).toBe(100);
      // Value portion: 100g/300g of ₹30 = ₹10
      expect(activityEvents[0].value).toBe(10);
    });

    it('marks item as consumed when full quantity is used', () => {
      const inventory = [
        { id: 'item_spinach', name: 'Spinach', quantity: 200, unit: 'g', price: 30, status: 'active', date: '2026-10-10' }
      ];

      const { updatedInventory, activityEvents } = deductUsedIngredients(inventory, [
        { itemId: 'item_spinach', quantityUsed: 200 }
      ]);

      expect(updatedInventory[0].quantity).toBe(0);
      expect(updatedInventory[0].status).toBe('consumed');
      expect(activityEvents[0].type).toBe('consumed');
      expect(activityEvents[0].value).toBe(30);
    });
  });

  describe('5. Verified Impact Calculations', () => {
    it('aggregates rescued items and financial savings from verified actions', () => {
      const ref = new Date(2026, 9, 10);
      const activities = [
        {
          id: '1',
          type: 'consumed',
          recordedDate: '2026-10-10',
          timestamp: '2026-10-09T18:00:00Z', // Rescued before deadline
          value: 30
        },
        {
          id: '2',
          type: 'partially_consumed',
          recordedDate: '2026-10-12',
          timestamp: '2026-10-10T12:00:00Z', // Rescued before deadline
          value: 15
        },
        {
          id: '3',
          type: 'discarded',
          reason: 'Spoiled due to humidity',
          timestamp: '2026-10-08T10:00:00Z'
        }
      ];

      const metrics = calculateImpactMetrics(activities, ref);
      expect(metrics.totalConsumedEvents).toBe(2);
      expect(metrics.itemsRescuedBeforeDeadline).toBe(2);
      expect(metrics.totalValueRescued).toBe(45);
      expect(metrics.totalDiscardedEvents).toBe(1);
      expect(metrics.discardReasons['Spoiled due to humidity']).toBe(1);
    });
  });

  describe('6. OCR Date Heuristics & Label Extraction', () => {
    it('correctly extracts ISO date from label text', async () => {
      const { extractDateAndDetails } = await import('../src/utils/ocrScanner.js');
      const text = 'AMUL BUTTER\nUSE BY 2026-11-20\nNET WT 500G';
      const parsed = extractDateAndDetails(text);
      expect(parsed.date).toBe('2026-11-20');
      expect(parsed.dateType).toBe('use-by');
      expect(parsed.name).toContain('AMUL BUTTER');
    });

    it('correctly extracts DD/MM/YYYY date from label text', async () => {
      const { extractDateAndDetails } = await import('../src/utils/ocrScanner.js');
      const text = 'ORGANIC MILK\nBEST BEFORE 15/10/2026\nKEEP REFRIGERATED';
      const parsed = extractDateAndDetails(text);
      expect(parsed.date).toBe('2026-10-15');
      expect(parsed.dateType).toBe('best-before');
    });

    it('handles text without any date gracefully without inventing dates', async () => {
      const { extractDateAndDetails } = await import('../src/utils/ocrScanner.js');
      const text = 'FRESH GREEN APPLES\nPRODUCT OF HIMACHAL';
      const parsed = extractDateAndDetails(text);
      expect(parsed.date).toBeNull();
      expect(parsed.notes).toContain('No clear date stamp recognized');
    });
  });

  describe('7. Safety & Negative Quantity Protection', () => {
    it('clamps quantity to 0 and never allows negative inventory', () => {
      const inventory = [
        { id: 'item_milk', name: 'Milk', quantity: 100, unit: 'ml', price: 10, status: 'active', date: '2026-10-10' }
      ];

      // Attempt to deduct 500ml from 100ml
      const { updatedInventory, activityEvents } = deductUsedIngredients(inventory, [
        { itemId: 'item_milk', quantityUsed: 500 }
      ]);

      expect(updatedInventory[0].quantity).toBe(0);
      expect(activityEvents[0].type).toBe('consumed');
    });
  });

  describe('8. Rescue Priority Algorithm & Explainability', () => {
    it('ranks items into explainable categories without UTC shifting', async () => {
      const { rankRescueInventory, RESCUE_CATEGORIES } = await import('../src/lib/rescuePriority.js');
      const ref = new Date(2026, 9, 10);
      const inventory = [
        { id: '1', name: 'Spinach', date: '2026-10-10', dateType: 'use-by', quantity: 250, unit: 'g', location: 'refrigerator', status: 'active' },
        { id: '2', name: 'Milk', date: '2026-10-12', dateType: 'best-before', quantity: 500, unit: 'ml', location: 'refrigerator', status: 'active' },
        { id: '3', name: 'Old Yogurt', date: '2026-10-08', dateType: 'use-by', quantity: 200, unit: 'g', location: 'refrigerator', status: 'active' },
        { id: '4', name: 'Salt', quantity: 500, unit: 'g', location: 'pantry', status: 'active' } // No date
      ];

      const res = rankRescueInventory(inventory, ref);
      expect(res.needsAttentionToday.length).toBe(1);
      expect(res.needsAttentionToday[0].name).toBe('Spinach');
      expect(res.pastDateReview.length).toBe(1);
      expect(res.pastDateReview[0].name).toBe('Old Yogurt');
      expect(res.comingUpSoon.length).toBe(1);
      expect(res.comingUpSoon[0].name).toBe('Milk');
      expect(res.unknownDateItems.length).toBe(1);
      expect(res.unknownDateItems[0].name).toBe('Salt');
      expect(res.summaryMessage).toContain('2 ingredients need your attention');
    });
  });

  describe('9. Web Audio Sound Effects & Preference Controls', () => {
    it('manages sound mute preferences in storage without throwing', async () => {
      const {
        isSoundMuted,
        setSoundMuted,
        playRecipeCompletedSound,
        playItemAddedSound,
        playItemUsedSound,
        playItemDiscardedSound,
        playClickSound,
        playAiSparkleSound,
        playFilterSelectSound,
        playQuantityStepSound,
        playModalOpenSound,
        playModalCloseSound,
        playBarcodeScanSound,
        playNotificationChime
      } = await import('../src/utils/soundEffects.js');

      setSoundMuted(true);
      expect(isSoundMuted()).toBe(true);

      // Verify triggering sound functions while muted executes gracefully
      expect(() => playRecipeCompletedSound()).not.toThrow();
      expect(() => playItemAddedSound()).not.toThrow();
      expect(() => playItemUsedSound()).not.toThrow();
      expect(() => playItemDiscardedSound()).not.toThrow();
      expect(() => playClickSound()).not.toThrow();
      expect(() => playAiSparkleSound()).not.toThrow();
      expect(() => playFilterSelectSound()).not.toThrow();
      expect(() => playQuantityStepSound(true)).not.toThrow();
      expect(() => playQuantityStepSound(false)).not.toThrow();
      expect(() => playModalOpenSound()).not.toThrow();
      expect(() => playModalCloseSound()).not.toThrow();
      expect(() => playBarcodeScanSound()).not.toThrow();
      expect(() => playNotificationChime()).not.toThrow();

      setSoundMuted(false);
      expect(isSoundMuted()).toBe(false);

      // Verify triggering sound functions while unmuted in headless environment executes safely
      expect(() => playRecipeCompletedSound()).not.toThrow();
      expect(() => playItemAddedSound()).not.toThrow();
      expect(() => playItemUsedSound()).not.toThrow();
      expect(() => playItemDiscardedSound()).not.toThrow();
      expect(() => playClickSound()).not.toThrow();
      expect(() => playAiSparkleSound()).not.toThrow();
      expect(() => playFilterSelectSound()).not.toThrow();
      expect(() => playQuantityStepSound(true)).not.toThrow();
      expect(() => playQuantityStepSound(false)).not.toThrow();
      expect(() => playModalOpenSound()).not.toThrow();
      expect(() => playModalCloseSound()).not.toThrow();
      expect(() => playBarcodeScanSound()).not.toThrow();
      expect(() => playNotificationChime()).not.toThrow();
    });
  });
});

