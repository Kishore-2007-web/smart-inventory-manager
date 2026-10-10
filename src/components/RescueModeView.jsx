import React from 'react';
import { Sparkles, ChefHat, CheckCircle2, Clock, Users, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils.js';

export default function RescueModeView({
  analysis,
  recommendedRecipes = [],
  onSelectRecipe,
  onOpenAddModal
}) {
  const {
    sortedItems = [],
    needsAttentionToday = [],
    pastDateReview = [],
    comingUpSoon = [],
    topPriorityItem
  } = analysis;

  const totalReviewItems = needsAttentionToday.length + pastDateReview.length;

  // Primary rescue recipe match
  const topRecipe = recommendedRecipes.length > 0 ? recommendedRecipes[0] : null;
  const secondaryRecipes = recommendedRecipes.slice(1, 4);

  return (
    <div className="space-y-8 pb-20 md:pb-12">
      {/* 1. Header */}
      <div className="bg-forest text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-mint text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-apricot" />
            Decision Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rescue Mode
          </h1>
          <p className="text-sage text-sm sm:text-base leading-relaxed">
            Let's use the food that needs attention first.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-lg bg-mint text-forest text-xs font-bold">
              {totalReviewItems} {totalReviewItems === 1 ? 'item requires' : 'items require'} review
            </span>
          </div>
        </div>
      </div>

      {/* 2. Priority List of Items Needing Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-forest">
          Inventory Urgency Review
        </h2>

        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-subtle-border text-center">
            <p className="text-secondary-text text-sm">Your inventory is empty. Add food to calculate rescue priorities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedItems.slice(0, 6).map((item) => {
              const evalRes = item.rescueEvaluation || {};
              const isUrgent = evalRes.category === 'NEEDS_ATTENTION_TODAY';
              const isPast = evalRes.category === 'PAST_DATE_REVIEW';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col justify-between space-y-3 ${
                    isUrgent
                      ? 'border-red-200 ring-1 ring-red-100'
                      : isPast
                      ? 'border-amber-200'
                      : 'border-subtle-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-forest text-base">
                        {item.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          isUrgent
                            ? 'bg-red-50 text-error-red border border-red-200'
                            : isPast
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-mint text-forest border border-sage'
                        }`}
                      >
                        {evalRes.label || item.urgency?.label}
                      </span>
                    </div>

                    <p className="text-xs text-secondary-text">
                      Quantity: <strong>{item.quantity} {item.unit}</strong> • Stored in <strong>{item.location}</strong>
                    </p>

                    <p className="text-xs text-main-text bg-ivory p-2.5 rounded-xl border border-subtle-border leading-relaxed">
                      {evalRes.explanation || item.urgencyExplanation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-subtle-border flex items-center justify-between text-xs">
                    <span className="text-secondary-text">
                      {item.dateType}: <strong>{formatDisplayDate(item.date)}</strong>
                    </span>
                    <button
                      onClick={() => topRecipe && onSelectRecipe(topRecipe)}
                      className="font-bold text-primary-green hover:text-forest transition-colors"
                    >
                      Find recipes →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Recommended Meal (Centerpiece) */}
      {topRecipe && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage shadow-card space-y-5">
          <div className="flex items-center gap-2 text-forest text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-apricot" />
            <span>Recommended Meal Match</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="text-2xl font-extrabold text-forest">
                {topRecipe.name}
              </h3>
              <span className="px-3 py-1 rounded-xl bg-mint text-forest font-bold text-xs border border-sage self-start sm:self-auto">
                {topRecipe.matchPercent}% Pantry Ready
              </span>
            </div>

            <p className="text-main-text text-sm sm:text-base leading-relaxed">
              {topRecipe.description}
            </p>

            <div className="p-3.5 bg-mint/50 rounded-2xl border border-sage text-xs text-forest space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                💡 Why this meal is recommended:
              </span>
              <p className="leading-relaxed">
                {topRecipe.whyRecommended}
              </p>
            </div>
          </div>

          {/* Times & Servings */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-ivory rounded-2xl border border-subtle-border text-center text-xs">
            <div>
              <span className="text-secondary-text block text-[11px]">Prep Time</span>
              <span className="font-bold text-forest">{topRecipe.prepTimeMinutes || 10} mins</span>
            </div>
            <div>
              <span className="text-secondary-text block text-[11px]">Cook Time</span>
              <span className="font-bold text-forest">{topRecipe.cookTimeMinutes || 20} mins</span>
            </div>
            <div>
              <span className="text-secondary-text block text-[11px]">Servings</span>
              <span className="font-bold text-forest">{topRecipe.servings || 2} persons</span>
            </div>
          </div>

          {/* Available vs Missing Ingredients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Ingredients Available */}
            <div className="p-4 bg-mint/30 rounded-2xl border border-sage space-y-2">
              <h4 className="font-bold text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-green" />
                Ingredients You Already Have ({topRecipe.availableIngredients?.length || 0})
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-main-text">
                {topRecipe.availableIngredients?.map((ing, i) => (
                  <li key={i}>
                    {ing.name} ({ing.neededQuantity} {ing.neededUnit})
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Ingredients */}
            <div className="p-4 bg-ivory rounded-2xl border border-subtle-border space-y-2">
              <h4 className="font-bold text-secondary-text">
                Missing Ingredients ({topRecipe.missingIngredients?.length || 0})
              </h4>
              {topRecipe.missingIngredients?.length === 0 ? (
                <p className="text-primary-green font-semibold">None! You have everything required.</p>
              ) : (
                <ul className="space-y-1 pl-5 list-disc text-secondary-text">
                  {topRecipe.missingIngredients?.map((ing, i) => (
                    <li key={i}>
                      {ing.name} {ing.optional ? '(optional)' : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={() => onSelectRecipe(topRecipe)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-card transition-all"
            >
              <ChefHat className="w-4 h-4 text-mint" />
              View recipe & start cooking
            </button>
          </div>
        </div>
      )}

      {/* 4. Other Rescue Options */}
      {secondaryRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-forest">
            Alternative Rescue Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {secondaryRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl p-5 border border-subtle-border shadow-card flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-forest text-base">{recipe.name}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-mint text-forest border border-sage shrink-0">
                      {recipe.matchPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-secondary-text line-clamp-2">
                    {recipe.description}
                  </p>
                  <p className="text-[11px] text-main-text bg-ivory p-2 rounded-xl">
                    {recipe.whyRecommended}
                  </p>
                </div>

                <button
                  onClick={() => onSelectRecipe(recipe)}
                  className="w-full py-2.5 rounded-xl bg-ivory hover:bg-mint text-forest font-bold text-xs border border-subtle-border transition-colors flex items-center justify-center gap-1"
                >
                  View Option →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
