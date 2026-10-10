import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import TodayScreen from './components/TodayScreen.jsx';
import RescueModeView from './components/RescueModeView.jsx';
import InventoryScreen from './components/InventoryScreen.jsx';
import RecipesScreen from './components/RecipesScreen.jsx';
import ImpactScreen from './components/ImpactScreen.jsx';
import AddEditFoodModal from './components/AddEditFoodModal.jsx';
import RecipeDetailModal from './components/RecipeDetailModal.jsx';
import PreferencesModal from './components/PreferencesModal.jsx';
import FloatingButterfliesBackground from './components/FloatingButterfliesBackground.jsx';
import SmartLoadingIndicator from './components/SmartLoadingIndicator.jsx';

import {
  loadInventory,
  saveInventory,
  loadActivities,
  saveActivities,
  loadPreferences,
  savePreferences,
  resetDemoData
} from './services/storage.js';

import { rankRescueInventory } from './lib/rescuePriority.js';
import { getRecommendedRecipes, deductUsedIngredients } from './utils/recipeEngine.js';
import { calculateImpactMetrics } from './utils/impactTracker.js';
import {
  playRecipeCompletedSound,
  playItemAddedSound,
  playItemUsedSound,
  playItemDiscardedSound,
  playClickSound,
  isSoundMuted,
  setSoundMuted
} from './utils/soundEffects.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [user, setUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Sound Effects State
  const [soundMuted, setSoundMutedState] = useState(() => isSoundMuted());
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (title, message) => {
    setToastNotification({ title, message });
    setTimeout(() => {
      setToastNotification(null);
    }, 3800);
  };

  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) {
      playItemAddedSound();
    }
  };

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      playClickSound();
    }
    setActiveTab(tab);
  };

  // Initial App Launch Loading State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showLoadingPreview, setShowLoadingPreview] = useState(false);

  // Core Data State
  const [inventory, setInventory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState(loadPreferences());
  const [aiCustomRecipes, setAiCustomRecipes] = useState([]);

  // Recipe Filters
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [pantryReadyOnly, setPantryReadyOnly] = useState(false);

  // Modals & Active View Items
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // Initial Load with smooth splash transition
  useEffect(() => {
    async function init() {
      const inv = await loadInventory(user);
      const acts = await loadActivities(user);
      const prefs = loadPreferences();
      setInventory(inv);
      setActivities(acts);
      setPreferences(prefs);

      // Snappy 2.5-second loading splash with butterfly animation and smart meal planning messages
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 2500);
    }
    init();
  }, [user]);

  // Priority Analysis using deterministic rescuePriority engine
  const analysis = useMemo(() => {
    return rankRescueInventory(inventory);
  }, [inventory]);

  // Recommended Recipes matching inventory
  const recommendedRecipes = useMemo(() => {
    return getRecommendedRecipes(
      analysis.sortedItems,
      {
        cuisine: selectedCuisine,
        diet: selectedDiet,
        pantryReadyOnly
      },
      aiCustomRecipes
    );
  }, [analysis.sortedItems, selectedCuisine, selectedDiet, pantryReadyOnly, aiCustomRecipes]);

  // Impact Metrics
  const impactMetrics = useMemo(() => {
    return calculateImpactMetrics(activities);
  }, [activities]);

  // Browser Notification Trigger
  useEffect(() => {
    if (preferences.notificationsEnabled && analysis.needsAttentionToday.length > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        const topItem = analysis.needsAttentionToday[0];
        new Notification('FridgeWise AI Alert', {
          body: `${topItem.name} needs attention today. Open FridgeWise to view rescue recipes!`
        });
      }
    }
  }, [analysis.needsAttentionToday.length, preferences.notificationsEnabled]);

  // --- CRUD Handlers ---

  const handleSaveFoodItem = (savedItem) => {
    let updated;
    const exists = inventory.some(i => i.id === savedItem.id);
    if (exists) {
      updated = inventory.map(i => i.id === savedItem.id ? savedItem : i);
    } else {
      updated = [savedItem, ...inventory];
    }
    setInventory(updated);
    saveInventory(updated, user);
    playItemAddedSound();
    showToast('Food Saved! 🥬', `${savedItem.name} saved to inventory.`);
  };

  const handleDeleteItem = (itemId) => {
    const updated = inventory.filter(i => i.id !== itemId);
    setInventory(updated);
    saveInventory(updated, user);
    playItemDiscardedSound();
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    const updated = inventory.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          quantity: newQuantity,
          status: newQuantity <= 0 ? 'consumed' : i.status,
          updatedAt: new Date().toISOString()
        };
      }
      return i;
    });
    setInventory(updated);
    saveInventory(updated, user);
    playClickSound();
  };

  const handleMarkConsumed = (item, qtyUsed) => {
    const { updatedInventory, activityEvents } = deductUsedIngredients(inventory, [
      { itemId: item.id, quantityUsed: qtyUsed }
    ]);
    const updatedActs = [...activityEvents, ...activities];
    setInventory(updatedInventory);
    setActivities(updatedActs);
    saveInventory(updatedInventory, user);
    saveActivities(updatedActs, user);
    playItemUsedSound();
    showToast('Item Consumed! 🍽️', `Recorded ${qtyUsed} ${item.unit || ''} of ${item.name}. Impact score updated!`);
  };

  const handleMarkDiscarded = (item, reason) => {
    const now = new Date().toISOString();
    const updated = inventory.map(i => {
      if (i.id === item.id) {
        return { ...i, status: 'discarded', updatedAt: now };
      }
      return i;
    });

    const discardEvent = {
      id: `act_${Date.now()}_discard`,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      type: 'discarded',
      quantityUsed: item.quantity,
      unit: item.unit,
      value: 0,
      timestamp: now,
      reason: reason || 'Spoiled / Expired'
    };

    const updatedActs = [discardEvent, ...activities];
    setInventory(updated);
    setActivities(updatedActs);
    saveInventory(updated, user);
    saveActivities(updatedActs, user);
    playItemDiscardedSound();
    showToast('Food Discarded', `Logged ${item.name} for food waste tracking.`);
  };

  const handleConfirmCooking = (recipe, deductions) => {
    const { updatedInventory, activityEvents } = deductUsedIngredients(inventory, deductions);
    const updatedActs = [...activityEvents, ...activities];
    setInventory(updatedInventory);
    setActivities(updatedActs);
    saveInventory(updatedInventory, user);
    saveActivities(updatedActs, user);
    playRecipeCompletedSound();
    showToast('Recipe Completed! 🎉', `Prepared "${recipe.name}". Ingredients deducted & rescue impact updated!`);
  };

  const handleResetDemo = () => {
    const fresh = resetDemoData();
    setInventory(fresh.inventory);
    setActivities(fresh.activities);
    setPreferences(fresh.preferences);
    setAiCustomRecipes([]);
    playItemAddedSound();
    showToast('Demo Reset', 'Fresh demo inventory, recipes, and impact data reloaded.');
  };

  const handleSavePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  // --- AI Recipe Generation ---

  const handleGenerateAiRecipe = async () => {
    setIsGeneratingAi(true);
    setAiStatusMessage('');

    try {
      const response = await fetch('/api/recipes/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: analysis.sortedItems,
          preferences: {
            cuisine: selectedCuisine,
            diet: preferences.diet,
            allergies: preferences.allergies,
            servings: 2
          }
        })
      });

      const data = await response.json();
      setIsGeneratingAi(false);

      if (data.success && data.recipes && data.recipes.length > 0) {
        setAiCustomRecipes(prev => [...data.recipes, ...prev]);
        setAiStatusMessage(`Generated ${data.recipes.length} custom AI recipe(s) using your inventory! (${data.provider || 'AI Engine'})`);
      } else {
        setAiStatusMessage(data.message || 'Displaying verified built-in rescue recipes.');
      }
    } catch (err) {
      setIsGeneratingAi(false);
      setAiStatusMessage('AI server not reachable. Displaying verified built-in rescue recipes.');
    }
  };

  const urgentCount = analysis.needsAttentionToday.length + analysis.pastDateReview.length;

  // Initial Loading Splash Screen
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6 relative overflow-hidden">
        <FloatingButterfliesBackground />
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-sage shadow-card relative z-10 max-w-sm w-full">
          <SmartLoadingIndicator durationSeconds={2.5} showProgress={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-main-text flex flex-col font-sans relative selection:bg-mint selection:text-forest">
      {/* Three.js Floating 3D Butterfly Background */}
      <FloatingButterfliesBackground />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAddModal={() => {
          playClickSound();
          setEditItem(null);
          setIsAddModalOpen(true);
        }}
        onOpenPreferences={() => {
          playClickSound();
          setIsPreferencesOpen(true);
        }}
        onResetDemo={handleResetDemo}
        onPreviewLoading={() => {
          playClickSound();
          setShowLoadingPreview(true);
        }}
        isDemoMode={isDemoMode}
        urgentCount={urgentCount}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Centered Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-7 relative z-10">
        {activeTab === 'today' && (
          <TodayScreen
            analysis={analysis}
            recommendedRecipes={recommendedRecipes}
            impactMetrics={impactMetrics}
            currencySymbol={preferences.currencySymbol}
            onSelectRecipe={(recipe) => {
              playClickSound();
              setSelectedRecipe(recipe);
            }}
            onOpenAddModal={() => {
              playClickSound();
              setEditItem(null);
              setIsAddModalOpen(true);
            }}
            onViewInventory={() => handleTabChange('inventory')}
            onOpenRescueMode={() => handleTabChange('rescue')}
          />
        )}

        {activeTab === 'rescue' && (
          <RescueModeView
            analysis={analysis}
            recommendedRecipes={recommendedRecipes}
            onSelectRecipe={(recipe) => {
              playClickSound();
              setSelectedRecipe(recipe);
            }}
            onOpenAddModal={() => {
              playClickSound();
              setEditItem(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryScreen
            inventory={inventory}
            currencySymbol={preferences.currencySymbol}
            onOpenAddModal={() => {
              playClickSound();
              setEditItem(null);
              setIsAddModalOpen(true);
            }}
            onEditItem={(item) => {
              playClickSound();
              setEditItem(item);
              setIsAddModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onUpdateQuantity={handleUpdateQuantity}
            onMarkConsumed={handleMarkConsumed}
            onMarkDiscarded={handleMarkDiscarded}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesScreen
            recipes={recommendedRecipes}
            onSelectRecipe={(recipe) => {
              playClickSound();
              setSelectedRecipe(recipe);
            }}
            onGenerateAiRecipe={handleGenerateAiRecipe}
            isGeneratingAi={isGeneratingAi}
            aiStatusMessage={aiStatusMessage}
            selectedCuisine={selectedCuisine}
            setSelectedCuisine={setSelectedCuisine}
            selectedDiet={selectedDiet}
            setSelectedDiet={setSelectedDiet}
            pantryReadyOnly={pantryReadyOnly}
            setPantryReadyOnly={setPantryReadyOnly}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactScreen
            impactMetrics={impactMetrics}
            activities={activities}
            currencySymbol={preferences.currencySymbol}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        urgentCount={urgentCount}
      />

      {/* Modals */}
      <AddEditFoodModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSaveFoodItem}
        editItem={editItem}
        currencySymbol={preferences.currencySymbol}
      />

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onConfirmCooking={handleConfirmCooking}
        currencySymbol={preferences.currencySymbol}
      />

      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onResetDemo={handleResetDemo}
        isDemoMode={isDemoMode}
        user={user}
        setUser={setUser}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Action / Celebration Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-bounce-subtle pointer-events-none">
          <div className="bg-forest text-white px-5 py-3.5 rounded-2xl shadow-floating border border-mint/20 max-w-sm flex items-start gap-3 backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-mint mt-1.5 shrink-0 animate-pulse" />
            <div>
              <h5 className="font-bold text-xs text-mint tracking-wide">
                {toastNotification.title}
              </h5>
              <p className="text-xs text-ivory/90 mt-0.5 leading-snug">
                {toastNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Animation Preview Modal */}
      {showLoadingPreview && (
        <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-sage relative">
            <button
              onClick={() => setShowLoadingPreview(false)}
              className="absolute right-4 top-4 px-2 py-1 text-xs font-bold text-secondary-text hover:text-forest hover:bg-ivory rounded-lg transition-colors"
            >
              ✕ Close
            </button>
            <div className="pt-2">
              <SmartLoadingIndicator />
            </div>
            <p className="text-[10px] text-center text-secondary-text mt-2 font-medium">
              Orbiting organic leaf & apricot tomato with 3D flapping butterfly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
