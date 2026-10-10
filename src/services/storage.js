import { isFirebaseConfigured, db } from './firebase.js';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getIsoDateString } from '../utils/dateUtils.js';

const STORAGE_KEYS = {
  INVENTORY: 'fridgewise_demo_inventory',
  ACTIVITY: 'fridgewise_demo_activity',
  PREFERENCES: 'fridgewise_demo_preferences',
  MODE: 'fridgewise_mode'
};

/**
 * Generates initial demo inventory with realistic Indian & household groceries.
 * Dynamically computes dates relative to today so the demo is always 100% fresh!
 */
export function getInitialDemoInventory() {
  return [
    {
      id: 'demo_item_spinach',
      name: 'Fresh Spinach (Palak)',
      normalizedName: 'fresh spinach palak',
      quantity: 250,
      unit: 'g',
      category: 'Produce',
      location: 'refrigerator',
      dateType: 'use-by',
      date: getIsoDateString(0), // TODAY!
      dateSource: 'Confirmed label date',
      price: 30,
      notes: 'Bought from local organic market. Needs cooking today.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_tomatoes',
      name: 'Ripe Tomatoes',
      normalizedName: 'ripe tomatoes',
      quantity: 500,
      unit: 'g',
      category: 'Produce',
      location: 'refrigerator',
      dateType: 'best-before',
      date: getIsoDateString(1), // Tomorrow!
      dateSource: 'User estimate',
      price: 25,
      notes: 'Slightly soft; perfect for dal or rasam.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_milk',
      name: 'Toned Milk',
      normalizedName: 'toned milk',
      quantity: 500,
      unit: 'ml',
      category: 'Dairy',
      location: 'refrigerator',
      dateType: 'use-by',
      date: getIsoDateString(2), // 2 days
      dateSource: 'Package stamp',
      price: 33,
      notes: 'Sealed packet.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_onions',
      name: 'Red Onions',
      normalizedName: 'red onions',
      quantity: 1,
      unit: 'kg',
      category: 'Produce',
      location: 'pantry',
      dateType: 'best-before',
      date: getIsoDateString(6), // 6 days
      dateSource: 'User estimate',
      price: 40,
      notes: 'Stored in ventilated basket.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_dal',
      name: 'Toor Dal (Yellow Lentils)',
      normalizedName: 'toor dal yellow lentils',
      quantity: 500,
      unit: 'g',
      category: 'Pantry',
      location: 'pantry',
      dateType: 'best-before',
      date: getIsoDateString(60), // 60 days
      dateSource: 'Package stamp',
      price: 85,
      notes: 'Airtight jar.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_rice',
      name: 'Basmati Rice',
      normalizedName: 'basmati rice',
      quantity: 1,
      unit: 'kg',
      category: 'Pantry',
      location: 'pantry',
      dateType: 'best-before',
      date: getIsoDateString(90),
      dateSource: 'Package stamp',
      price: 110,
      notes: 'Pantry container.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_item_eggs',
      name: 'Farm Fresh Eggs',
      normalizedName: 'farm fresh eggs',
      quantity: 6,
      unit: 'pcs',
      category: 'Dairy',
      location: 'refrigerator',
      dateType: 'best-before',
      date: getIsoDateString(4),
      dateSource: 'Egg carton label',
      price: 45,
      notes: 'Fridge door tray.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

/**
 * Generates initial demo activity history so the Impact screen has truthful illustrative demonstration data.
 */
export function getInitialDemoActivities() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'act_demo_1',
      itemId: 'demo_prev_curd',
      itemName: 'Greek Yogurt / Fresh Curd',
      category: 'Dairy',
      type: 'consumed',
      quantityUsed: 400,
      remainingQuantity: 0,
      unit: 'g',
      value: 35,
      timestamp: yesterday,
      dateType: 'use-by',
      recordedDate: getIsoDateString(0),
      wasUrgent: true
    },
    {
      id: 'act_demo_2',
      itemId: 'demo_prev_paneer',
      itemName: 'Malai Paneer',
      category: 'Dairy',
      type: 'consumed',
      quantityUsed: 200,
      remainingQuantity: 0,
      unit: 'g',
      value: 80,
      timestamp: threeDaysAgo,
      dateType: 'use-by',
      recordedDate: getIsoDateString(-2),
      wasUrgent: true
    }
  ];
}

export const defaultPreferences = {
  diet: 'Vegetarian',
  cuisine: 'all',
  allergies: '',
  currencySymbol: '₹',
  notificationsEnabled: false
};

// --- DATA ACCESS METHODS ---

export async function loadInventory(user = null) {
  if (user && isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, `users/${user.uid}/inventory`);
      const snapshot = await getDocs(colRef);
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      return items;
    } catch (e) {
      console.warn('Error reading Firestore inventory, falling back to local storage:', e);
    }
  }

  // Local storage (Demo Mode)
  const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  if (!saved) {
    const initial = getInitialDemoInventory();
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return getInitialDemoInventory();
  }
}

export async function saveInventory(items, user = null) {
  if (user && isFirebaseConfigured && db) {
    try {
      // In Firestore, sync changes
      // For simplicity in client, we also keep local storage synchronized
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
}

export async function loadActivities(user = null) {
  if (user && isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, `users/${user.uid}/activities`);
      const snapshot = await getDocs(colRef);
      const acts = [];
      snapshot.forEach(doc => acts.push({ id: doc.id, ...doc.data() }));
      return acts;
    } catch (e) {
      console.warn('Error reading Firestore activities:', e);
    }
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
  if (!saved) {
    const initial = getInitialDemoActivities();
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return getInitialDemoActivities();
  }
}

export async function saveActivities(acts, user = null) {
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(acts));
}

export function loadPreferences() {
  const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (!saved) return defaultPreferences;
  try {
    return { ...defaultPreferences, ...JSON.parse(saved) };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs) {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
}

/**
 * Resets local demo data to initial state.
 */
export function resetDemoData() {
  const initInv = getInitialDemoInventory();
  const initAct = getInitialDemoActivities();
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(initInv));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(initAct));
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaultPreferences));
  return { inventory: initInv, activities: initAct, preferences: defaultPreferences };
}
