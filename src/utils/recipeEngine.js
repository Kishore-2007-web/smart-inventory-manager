/**
 * Recipe Engine for FridgeWise AI.
 * Handles deterministic matching of recipes against current inventory,
 * urgent-ingredient prioritization, missing ingredient detection,
 * inventory consumption deduction, and fallback templates.
 */

/**
 * Built-in recipe templates covering Indian and versatile everyday dishes.
 */
export const BUILT_IN_RECIPES = [
  {
    id: 'spinach-dal',
    name: 'Palak Dal (Spinach Lentil Stew)',
    description: 'A comforting, protein-packed lentil stew infused with fresh spinach, garlic, and tempered spices.',
    cuisine: 'Indian',
    diet: 'Vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    keyUrgentIngredients: ['spinach', 'palak'],
    requiredIngredients: [
      { name: 'Spinach', keywords: ['spinach', 'palak'], quantity: 200, unit: 'g' },
      { name: 'Toor Dal / Lentils', keywords: ['toor dal', 'lentils', 'moong dal', 'dal'], quantity: 150, unit: 'g' },
      { name: 'Tomatoes', keywords: ['tomato', 'tomatoes'], quantity: 2, unit: 'pcs' },
      { name: 'Onions', keywords: ['onion', 'onions'], quantity: 1, unit: 'pcs' },
      { name: 'Garlic & Spices', keywords: ['garlic', 'ginger', 'spices', 'cumin', 'chilli'], quantity: 1, unit: 'tbsp', optional: true }
    ],
    instructions: [
      'Rinse toor dal thoroughly and pressure cook or boil with 2 cups of water and a pinch of turmeric until soft (12-15 mins).',
      'Wash and finely chop fresh spinach leaves and dice the tomatoes and onions.',
      'In a pan, heat 1 tbsp oil or ghee. Add cumin seeds, chopped garlic, and sliced onions; saute until golden.',
      'Add chopped tomatoes and cook until mushy. Add turmeric, red chili powder, and salt.',
      'Add the chopped spinach and cook for 3-4 minutes until wilted.',
      'Pour in the cooked dal, stir well, add water to desired consistency, and simmer on low for 5 minutes.',
      'Serve hot with steamed rice or warm rotis.'
    ],
    whyRecommended: 'Perfect for rescuing spinach that needs attention today, paired with long-lasting pantry lentils.'
  },
  {
    id: 'tomato-onion-uttapam',
    name: 'Tomato Onion Uttapam / Savory Pancake',
    description: 'Crisp-edged, fluffy savory pancakes topped with juicy diced tomatoes, onions, and green chilies.',
    cuisine: 'Indian',
    diet: 'Vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 2,
    keyUrgentIngredients: ['tomatoes', 'tomato'],
    requiredIngredients: [
      { name: 'Dosa Batter / Rice Batter', keywords: ['dosa batter', 'batter', 'rice flour', 'semolina', 'suji'], quantity: 250, unit: 'ml' },
      { name: 'Tomatoes', keywords: ['tomato', 'tomatoes'], quantity: 2, unit: 'pcs' },
      { name: 'Onions', keywords: ['onion', 'onions'], quantity: 1, unit: 'pcs' },
      { name: 'Green Chillies & Coriander', keywords: ['chilli', 'coriander', 'cilantro'], quantity: 1, unit: 'tbsp', optional: true }
    ],
    instructions: [
      'Finely dice the tomatoes and onions, discarding excess seeds from tomatoes.',
      'Heat a flat tawa or skillet on medium-high heat. Drizzle a few drops of oil and wipe clean.',
      'Pour a thick ladle of batter and spread gently into a round disc.',
      'Immediately sprinkle chopped tomatoes and onions over the wet surface and press gently with a spatula.',
      'Drizzle half a teaspoon of oil around the edges. Cook on medium heat until golden brown underneath.',
      'Flip gently and cook for 1-2 minutes until toppings are caramelized.',
      'Serve hot with coconut chutney or sambar.'
    ],
    whyRecommended: 'Quickly uses up ripe tomatoes and onions with minimal pantry batter.'
  },
  {
    id: 'egg-bhurji',
    name: 'Desi Egg Bhurji (Spiced Scrambled Eggs)',
    description: 'Flavorful Indian street-style scrambled eggs tossed with sautéed onions, ripe tomatoes, and fragrant spices.',
    cuisine: 'Indian',
    diet: 'Non-vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    keyUrgentIngredients: ['eggs', 'egg', 'tomatoes'],
    requiredIngredients: [
      { name: 'Eggs', keywords: ['egg', 'eggs'], quantity: 4, unit: 'pcs' },
      { name: 'Onions', keywords: ['onion', 'onions'], quantity: 1, unit: 'pcs' },
      { name: 'Tomatoes', keywords: ['tomato', 'tomatoes'], quantity: 1, unit: 'pcs' },
      { name: 'Ginger & Green Chillies', keywords: ['ginger', 'chilli', 'green chilli'], quantity: 1, unit: 'tsp', optional: true }
    ],
    instructions: [
      'Whisk eggs in a bowl with a pinch of salt and black pepper.',
      'Heat 1 tbsp oil or butter in a skillet over medium heat.',
      'Add finely chopped onions and green chilies. Saute until onions turn translucent.',
      'Add chopped tomatoes, a pinch of turmeric, and red chili powder. Cook for 2 minutes until soft.',
      'Pour in whisked eggs and stir continuously on low-medium heat until soft curds form.',
      'Turn off heat while still moist and tender. Garnish with chopped coriander.',
      'Serve immediately with toast, pav, or warm parathas.'
    ],
    whyRecommended: 'High-protein 15-minute rescue meal using eggs, tomatoes, and everyday pantry onions.'
  },
  {
    id: 'vegetable-khichdi',
    name: 'One-Pot Vegetable Dal Khichdi',
    description: 'Wholesome, soothing one-pot rice and lentil porridge infused with ghee, cumin, and whatever veggies are in your fridge.',
    cuisine: 'Indian',
    diet: 'Vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    keyUrgentIngredients: ['vegetables', 'spinach', 'tomatoes', 'potatoes'],
    requiredIngredients: [
      { name: 'Rice', keywords: ['rice', 'basmati rice'], quantity: 150, unit: 'g' },
      { name: 'Moong Dal or Toor Dal', keywords: ['moong dal', 'toor dal', 'dal', 'lentils'], quantity: 100, unit: 'g' },
      { name: 'Mixed Vegetables / Spinach / Tomato', keywords: ['spinach', 'tomato', 'potato', 'vegetable', 'carrot', 'peas'], quantity: 150, unit: 'g' },
      { name: 'Onions', keywords: ['onion', 'onions'], quantity: 1, unit: 'pcs' }
    ],
    instructions: [
      'Wash rice and lentils together until water runs clear; soak for 15 minutes if time permits.',
      'In a pressure cooker or heavy pot, heat 1 tbsp ghee or oil. Add cumin seeds and sliced onions; saute until soft.',
      'Add available diced vegetables (spinach, tomatoes, carrots, or potatoes) and spices (turmeric, salt).',
      'Add the drained rice and dal. Roast gently for 1 minute.',
      'Add 4 cups of water (for a comforting porridge consistency).',
      'Pressure cook for 3 whistles or simmer covered for 20 minutes until creamy and fully cooked.',
      'Stir in a spoonful of ghee and serve hot with curd or pickle.'
    ],
    whyRecommended: 'The ultimate zero-waste kitchen staple: absorbs almost any vegetable needing attention.'
  },
  {
    id: 'quick-veggie-pasta',
    name: 'Garlic & Herb Veggie Toss Pasta',
    description: 'Fast 20-minute pasta sautéed in olive oil, garlic, wilted greens, and juicy blistered tomatoes.',
    cuisine: 'Global',
    diet: 'Vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 2,
    keyUrgentIngredients: ['spinach', 'tomatoes'],
    requiredIngredients: [
      { name: 'Pasta', keywords: ['pasta', 'spaghetti', 'penne', 'macaroni'], quantity: 150, unit: 'g' },
      { name: 'Tomatoes', keywords: ['tomato', 'tomatoes'], quantity: 2, unit: 'pcs' },
      { name: 'Spinach or Greens', keywords: ['spinach', 'palak', 'greens', 'kale'], quantity: 100, unit: 'g' },
      { name: 'Garlic or Olive Oil', keywords: ['garlic', 'oil', 'olive oil'], quantity: 1, unit: 'tbsp', optional: true }
    ],
    instructions: [
      'Boil pasta in salted water until al dente (8-10 minutes); reserve 1/4 cup pasta water and drain.',
      'Heat 2 tbsp oil in a large skillet. Add thinly sliced garlic and sauté until fragrant (30 seconds).',
      'Add chopped tomatoes and cook over medium-high heat until they blister and soften.',
      'Toss in washed spinach leaves and cook for 1 minute until wilted.',
      'Add drained pasta and reserved pasta water. Season with salt, pepper, and chili flakes.',
      'Toss vigorously to coat pasta in the pan sauce. Serve immediately.'
    ],
    whyRecommended: 'Uses fresh spinach and tomatoes in a fast, familiar meal.'
  },
  {
    id: 'paneer-bhurji',
    name: 'Spiced Paneer / Tofu Scramble',
    description: 'Crumbled cottage cheese or tofu tossed with sweet sautéed onions, ripe tomatoes, and aromatic cumin.',
    cuisine: 'Indian',
    diet: 'Vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    servings: 2,
    keyUrgentIngredients: ['paneer', 'tofu', 'tomatoes'],
    requiredIngredients: [
      { name: 'Paneer or Tofu', keywords: ['paneer', 'tofu', 'cottage cheese'], quantity: 200, unit: 'g' },
      { name: 'Onions', keywords: ['onion', 'onions'], quantity: 1, unit: 'pcs' },
      { name: 'Tomatoes', keywords: ['tomato', 'tomatoes'], quantity: 2, unit: 'pcs' },
      { name: 'Green Chillies / Capsicum', keywords: ['capsicum', 'bell pepper', 'chilli'], quantity: 1, unit: 'pcs', optional: true }
    ],
    instructions: [
      'Crumble fresh paneer or pressed tofu with your hands.',
      'Heat oil or ghee in a pan. Sauté chopped onions and green chillies until soft.',
      'Add chopped tomatoes and spices (turmeric, cumin, garam masala, salt). Cook until tomatoes soften.',
      'Fold in the crumbled paneer or tofu. Cook on low heat for 3-4 minutes (do not overcook to keep soft).',
      'Turn off heat, garnish with coriander leaves, and serve with roti or bread.'
    ],
    whyRecommended: 'Rescues dairy or tofu approaching its date, combined with everyday vegetables.'
  }
];

/**
 * Normalizes food item name for keyword matching.
 * @param {string} str
 * @returns {string}
 */
export function normalizeIngredientName(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

/**
 * Checks whether an inventory item matches any ingredient keywords.
 * @param {Object} inventoryItem
 * @param {Array<string>} keywords
 * @returns {boolean}
 */
export function itemMatchesKeywords(inventoryItem, keywords = []) {
  if (!inventoryItem || !inventoryItem.name) return false;
  const normalized = normalizeIngredientName(inventoryItem.name);
  return keywords.some(kw => {
    const normKw = normalizeIngredientName(kw);
    return normalized.includes(normKw) || normKw.includes(normalized);
  });
}

/**
 * Matches a single recipe against the user's active inventory.
 * Determines available items, missing items, and urgent item rescue bonus.
 *
 * @param {Object} recipe
 * @param {Array<Object>} activeInventory
 * @returns {Object} Match details and score
 */
export function evaluateRecipeMatch(recipe, activeInventory = []) {
  const availableIngredients = [];
  const missingIngredients = [];
  let urgentRescueCount = 0;
  const urgentRescuedNames = [];

  for (const req of recipe.requiredIngredients) {
    // Find matching item in inventory
    const matchedItem = activeInventory.find(invItem =>
      invItem.status !== 'consumed' &&
      invItem.status !== 'discarded' &&
      itemMatchesKeywords(invItem, req.keywords)
    );

    if (matchedItem) {
      const isUrgent = matchedItem.priorityScore >= 70 ||
        (matchedItem.urgency && (matchedItem.urgency.daysRemaining !== null && matchedItem.urgency.daysRemaining <= 1));

      if (isUrgent) {
        urgentRescueCount += 1;
        urgentRescuedNames.push(matchedItem.name);
      }

      availableIngredients.push({
        name: req.name,
        neededQuantity: req.quantity,
        neededUnit: req.unit,
        inventoryItem: matchedItem,
        ownedQuantity: matchedItem.quantity,
        ownedUnit: matchedItem.unit,
        isUrgent
      });
    } else {
      missingIngredients.push({
        name: req.name,
        neededQuantity: req.quantity,
        neededUnit: req.unit,
        optional: !!req.optional
      });
    }
  }

  // Calculate matching ratio (ignore optional ingredients in denominator)
  const mandatoryRequirements = recipe.requiredIngredients.filter(r => !r.optional);
  const mandatoryAvailable = availableIngredients.filter(a => {
    const original = recipe.requiredIngredients.find(r => r.name === a.name);
    return original && !original.optional;
  });

  const matchRatio = mandatoryRequirements.length > 0
    ? mandatoryAvailable.length / mandatoryRequirements.length
    : 1;

  // Rescue Score:
  // Base match % (0 to 100) + (urgent rescues * 35 bonus points)
  let score = Math.round(matchRatio * 100);
  score += urgentRescueCount * 35;

  // Penalize missing essential ingredients
  const essentialMissing = missingIngredients.filter(m => !m.optional);
  if (essentialMissing.length === 0) {
    score += 15; // 100% pantry ready bonus!
  }

  return {
    ...recipe,
    matchScore: score,
    matchRatio,
    matchPercent: Math.round(matchRatio * 100),
    isPantryReady: essentialMissing.length === 0,
    urgentRescueCount,
    urgentRescuedNames,
    availableIngredients,
    missingIngredients
  };
}

/**
 * Searches and ranks recipes for the user's inventory.
 *
 * @param {Array<Object>} inventory
 * @param {Object} [filters]
 * @param {string} [filters.cuisine] 'all' | 'Indian' | 'Global'
 * @param {string} [filters.diet] 'all' | 'Vegetarian' | 'Non-vegetarian'
 * @param {boolean} [filters.pantryReadyOnly]
 * @param {Array<Object>} [customRecipes] optional additional recipes
 * @returns {Array<Object>} Sorted recipe matches
 */
export function getRecommendedRecipes(inventory = [], filters = {}, customRecipes = []) {
  const allRecipes = [...BUILT_IN_RECIPES, ...customRecipes];

  const matched = allRecipes.map(recipe => evaluateRecipeMatch(recipe, inventory));

  // Filter
  const filtered = matched.filter(r => {
    if (filters.cuisine && filters.cuisine !== 'all' && r.cuisine !== filters.cuisine) {
      return false;
    }
    if (filters.diet && filters.diet !== 'all' && r.diet !== filters.diet) {
      return false;
    }
    if (filters.pantryReadyOnly && !r.isPantryReady) {
      return false;
    }
    return true;
  });

  // Sort: highest score first (recipes rescuing urgent items with highest pantry match)
  filtered.sort((a, b) => {
    if (b.urgentRescueCount !== a.urgentRescueCount) {
      return b.urgentRescueCount - a.urgentRescueCount;
    }
    return b.matchScore - a.matchScore;
  });

  return filtered;
}

/**
 * Executes a verified inventory deduction when a user cooks a recipe.
 * If user used entire quantity or more, marks item as consumed.
 * If user used partial quantity, decreases quantity and keeps item active.
 *
 * @param {Array<Object>} inventory
 * @param {Array<{ itemId: string, quantityUsed: number }>} usedItems
 * @returns {{
 *   updatedInventory: Array<Object>,
 *   activityEvents: Array<Object>
 * }}
 */
export function deductUsedIngredients(inventory = [], usedItems = []) {
  const updatedInventory = [...inventory];
  const activityEvents = [];
  const now = new Date().toISOString();

  for (const usage of usedItems) {
    const index = updatedInventory.findIndex(item => item.id === usage.itemId);
    if (index === -1) continue;

    const currentItem = { ...updatedInventory[index] };
    const usedQty = Number(usage.quantityUsed) || 0;
    if (usedQty <= 0) continue;

    const originalQty = Number(currentItem.quantity) || 0;
    const remainingQty = Math.max(0, originalQty - usedQty);

    let eventType = 'consumed';
    let isFullyConsumed = remainingQty === 0;

    if (remainingQty > 0) {
      eventType = 'partially_consumed';
      currentItem.quantity = remainingQty;
      currentItem.updatedAt = now;
      updatedInventory[index] = currentItem;
    } else {
      currentItem.quantity = 0;
      currentItem.status = 'consumed';
      currentItem.consumedAt = now;
      currentItem.updatedAt = now;
      updatedInventory[index] = currentItem;
    }

    // Calculate value of rescued portion if purchase price exists
    let valueRescued = 0;
    if (currentItem.price && originalQty > 0) {
      const priceVal = Number(currentItem.price) || 0;
      const fractionUsed = Math.min(1, usedQty / originalQty);
      valueRescued = Math.round(priceVal * fractionUsed * 100) / 100;
    }

    activityEvents.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      itemId: currentItem.id,
      itemName: currentItem.name,
      category: currentItem.category,
      type: eventType,
      quantityUsed: usedQty,
      remainingQuantity: remainingQty,
      unit: currentItem.unit,
      value: valueRescued,
      timestamp: now,
      dateType: currentItem.dateType,
      recordedDate: currentItem.date,
      wasUrgent: (currentItem.priorityScore || 0) >= 70
    });
  }

  return {
    updatedInventory,
    activityEvents
  };
}
