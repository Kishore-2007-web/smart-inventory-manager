import React, { useState, useEffect } from 'react';
import { X, Clock, Users, CheckCircle2, AlertCircle, ChefHat, Sparkles } from 'lucide-react';
import {
  playModalOpenSound,
  playModalCloseSound,
  playClickSound,
  playQuantityStepSound
} from '../utils/soundEffects.js';

export default function RecipeDetailModal({
  recipe,
  onClose,
  onConfirmCooking,
  currencySymbol = '₹'
}) {
  useEffect(() => {
    if (recipe) {
      playModalOpenSound();
    }
  }, [recipe]);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  if (!recipe) return null;

  // Track consumption quantities
  const [cookingMode, setCookingMode] = useState(false);
  const [usedQuantities, setUsedQuantities] = useState(() => {
    const initial = {};
    (recipe.availableIngredients || []).forEach(item => {
      if (item.inventoryItem) {
        const def = Math.min(item.neededQuantity || 1, item.ownedQuantity || 1);
        initial[item.inventoryItem.id] = def;
      }
    });
    return initial;
  });

  const handleQtyChange = (itemId, val) => {
    const num = parseFloat(val);
    setUsedQuantities(prev => ({
      ...prev,
      [itemId]: isNaN(num) ? 0 : num
    }));
  };

  const handleFinishCooking = (e) => {
    e.preventDefault();
    const deductions = [];
    for (const [itemId, qty] of Object.entries(usedQuantities)) {
      if (qty > 0) {
        deductions.push({ itemId, quantityUsed: qty });
      }
    }
    onConfirmCooking(recipe, deductions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-card border border-subtle-border relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-secondary-text hover:text-forest hover:bg-ivory transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badges */}
        <div className="space-y-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-ivory text-main-text text-xs font-bold border border-subtle-border">
              {recipe.cuisine}
            </span>
            <span className="px-3 py-1 rounded-lg bg-mint text-forest text-xs font-bold border border-sage">
              {recipe.diet}
            </span>
            {recipe.urgentRescueCount > 0 && (
              <span className="px-3 py-1 rounded-lg bg-red-50 text-error-red border border-red-200 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Rescues {recipe.urgentRescuedNames.join(', ')}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-forest">{recipe.name}</h2>
          <p className="text-secondary-text text-sm leading-relaxed">{recipe.description}</p>
        </div>

        {/* Times & Servings Bar */}
        <div className="grid grid-cols-3 gap-3 my-5 p-4 bg-ivory rounded-2xl border border-subtle-border text-center text-xs">
          <div>
            <span className="text-secondary-text block text-[11px]">Prep Time</span>
            <span className="font-bold text-forest">{recipe.prepTimeMinutes || 10} mins</span>
          </div>
          <div>
            <span className="text-secondary-text block text-[11px]">Cook Time</span>
            <span className="font-bold text-forest">{recipe.cookTimeMinutes || 20} mins</span>
          </div>
          <div>
            <span className="text-secondary-text block text-[11px]">Servings</span>
            <span className="font-bold text-forest">{recipe.servings || 2} persons</span>
          </div>
        </div>

        {/* Why Recommended */}
        {recipe.whyRecommended && (
          <div className="mb-5 p-4 bg-mint/50 rounded-2xl border border-sage text-xs text-forest space-y-1">
            <h4 className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-apricot" />
              Why FridgeWise Recommends This
            </h4>
            <p className="leading-relaxed">{recipe.whyRecommended}</p>
          </div>
        )}

        {/* Cooking Confirmation View */}
        {cookingMode ? (
          <form onSubmit={handleFinishCooking} className="space-y-5">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <h4 className="font-bold flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-700" />
                Confirm Quantities Actually Used
              </h4>
              <p className="leading-relaxed">
                Adjust amounts below based on what you actually cooked. Unused portions remain in your fridge without being deleted.
              </p>
            </div>

            <div className="space-y-3">
              {recipe.availableIngredients?.map((item) => {
                if (!item.inventoryItem) return null;
                const itemId = item.inventoryItem.id;
                const currentUsed = usedQuantities[itemId] ?? 0;

                return (
                  <div
                    key={itemId}
                    className="p-4 bg-ivory rounded-2xl border border-subtle-border flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-forest text-sm">
                        {item.inventoryItem.name}
                      </h4>
                      <p className="text-xs text-secondary-text">
                        Owned: {item.ownedQuantity} {item.ownedUnit} • Recipe asks for: {item.neededQuantity} {item.neededUnit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-main-text font-semibold">Used:</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={item.ownedQuantity}
                        value={currentUsed}
                        onChange={(e) => handleQtyChange(itemId, e.target.value)}
                        className="w-20 px-3 py-1.5 bg-white border border-subtle-border rounded-xl text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                      <span className="text-xs font-bold text-forest w-8">
                        {item.ownedUnit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-subtle-border">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCookingMode(false);
                }}
                className="px-4 py-2.5 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory"
              >
                Back to Recipe
              </button>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-card flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-mint" />
                Confirm & Update Fridge
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Ingredients Breakdown */}
            <div className="space-y-3">
              <h3 className="font-bold text-forest text-sm flex items-center justify-between">
                <span>Ingredients Breakdown</span>
                <span className="text-xs font-bold text-primary-green">
                  {recipe.availableIngredients?.length || 0} Owned / {recipe.missingIngredients?.length || 0} Missing
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Available */}
                {recipe.availableIngredients?.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-mint/50 rounded-2xl border border-sage flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-green shrink-0" />
                      <div>
                        <span className="font-bold text-forest">{ing.name}</span>
                        {ing.isUrgent && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-error-red text-white font-bold">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-main-text font-semibold shrink-0">
                      {ing.neededQuantity} {ing.neededUnit}
                    </span>
                  </div>
                ))}

                {/* Missing */}
                {recipe.missingIngredients?.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-ivory rounded-2xl border border-subtle-border flex items-center justify-between text-xs opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-apricot shrink-0" />
                      <span className="text-secondary-text font-medium">
                        {ing.name} {ing.optional ? '(optional)' : ''}
                      </span>
                    </div>
                    <span className="text-secondary-text shrink-0">
                      {ing.neededQuantity} {ing.neededUnit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h3 className="font-bold text-forest text-sm">Step-by-Step Instructions</h3>
              <ol className="space-y-3">
                {(recipe.instructions || []).map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-main-text leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-forest text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Start Cooking Button */}
            <div className="pt-4 border-t border-subtle-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCookingMode(true);
                }}
                className="px-6 py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-card flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-mint" />
                Start Cooking & Update Fridge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
