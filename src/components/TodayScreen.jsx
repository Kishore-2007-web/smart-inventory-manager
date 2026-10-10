import React from 'react';
import { Sparkles, ArrowRight, Plus, ChefHat, Clock, AlertCircle, ChevronRight, Refrigerator, CheckCircle2 } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils.js';
import AiMascotCharacter from './AiMascotCharacter.jsx';

export default function TodayScreen({
  analysis,
  recommendedRecipes = [],
  impactMetrics,
  currencySymbol = '₹',
  onSelectRecipe,
  onOpenAddModal,
  onViewInventory,
  onOpenRescueMode
}) {
  const {
    sortedItems = [],
    needsAttentionToday = [],
    pastDateReview = [],
    comingUpSoon = [],
    topPriorityItem,
    summaryMessage
  } = analysis;

  const totalUrgent = needsAttentionToday.length + pastDateReview.length;
  const activeCount = sortedItems.length;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Centerpiece recipe match
  const topRecipe = recommendedRecipes.length > 0 ? recommendedRecipes[0] : null;

  // Maximum 3 priority items on Home screen
  const priorityItems = [...needsAttentionToday, ...pastDateReview, ...comingUpSoon].slice(0, 3);

  // E. Welcoming Empty State if zero inventory
  if (activeCount === 0) {
    return (
      <div className="py-4 px-2 max-w-xl mx-auto space-y-6">
        <AiMascotCharacter
          analysis={analysis}
          recommendedRecipes={recommendedRecipes}
          onSelectRecipe={onSelectRecipe}
          onOpenRescueMode={onOpenRescueMode}
          onOpenAddModal={onOpenAddModal}
        />
        <div className="text-center space-y-4 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-mint text-forest flex items-center justify-center mx-auto shadow-card border border-sage">
            <Refrigerator className="w-8 h-8 text-forest" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-forest">Your fridge starts here.</h2>
            <p className="text-secondary-text text-sm leading-relaxed max-w-md mx-auto">
              Add a few ingredients to discover recipes, monitor freshness, and prevent avoidable food waste.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-light text-white font-semibold text-sm shadow-card transition-all"
          >
            <Plus className="w-4 h-4" />
            Add your first ingredient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-20 md:pb-12">
      {/* A. Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
            {greetingTime}.
          </h1>
          <p className="text-secondary-text text-sm sm:text-base mt-1">
            Let's make the most of what's in your fridge.
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-mint border border-sage text-forest text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${totalUrgent > 0 ? 'bg-error-red animate-pulse' : 'bg-primary-green'}`} />
            <span>{summaryMessage}</span>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-card transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Food Item
        </button>
      </div>

      {/* AI Sous-Chef Mascot Character Greeting & Tips */}
      <AiMascotCharacter
        analysis={analysis}
        recommendedRecipes={recommendedRecipes}
        onSelectRecipe={onSelectRecipe}
        onOpenRescueMode={onOpenRescueMode}
        onOpenAddModal={onOpenAddModal}
      />

      {/* B. Compact Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total In Inventory */}
        <div className="bg-white rounded-2xl p-4 border border-subtle-border shadow-card space-y-1">
          <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
            In Inventory
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-forest">{activeCount}</span>
            <span className="text-xs text-secondary-text">items</span>
          </div>
        </div>

        {/* Needs Attention */}
        <div className={`bg-white rounded-2xl p-4 border shadow-card space-y-1 ${
          totalUrgent > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-subtle-border'
        }`}>
          <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
            Needs Attention
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${totalUrgent > 0 ? 'text-amber-800' : 'text-forest'}`}>
              {totalUrgent}
            </span>
            <span className="text-xs text-secondary-text">ingredients</span>
          </div>
        </div>

        {/* Used This Week */}
        <div className="bg-white rounded-2xl p-4 border border-subtle-border shadow-card space-y-1">
          <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
            Used This Week
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-primary-green">
              {impactMetrics.weeklyConsumedCount || 0}
            </span>
            <span className="text-xs text-secondary-text">portions</span>
          </div>
        </div>

        {/* Verified Rescued Value (Only if price exists) */}
        <div className="bg-white rounded-2xl p-4 border border-subtle-border shadow-card space-y-1">
          <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
            Value Rescued
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-forest">
              {impactMetrics.hasPriceData ? `${currencySymbol}${impactMetrics.totalValueRescued}` : '—'}
            </span>
            <span className="text-[11px] text-secondary-text">
              {impactMetrics.hasPriceData ? 'saved' : 'track prices'}
            </span>
          </div>
        </div>
      </div>

      {/* C. Main Rescue Recommendation (Visual Centerpiece) */}
      {topPriorityItem && topRecipe ? (
        <div className="bg-gradient-to-br from-white via-mint/40 to-white rounded-3xl p-6 sm:p-7 border border-sage shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 text-forest text-xs font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-4 h-4 text-apricot" />
            <span>Featured Food Rescue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Description */}
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-forest leading-snug">
                Your <span className="text-primary-green underline decoration-sage underline-offset-4">{topPriorityItem.name}</span> needs attention.
              </h2>
              <p className="text-main-text text-sm sm:text-base leading-relaxed">
                <strong>{topRecipe.name}</strong> is a great match because it uses your {topPriorityItem.name} and several ingredients you already have.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-xl bg-white border border-subtle-border font-medium text-main-text">
                  ⏱ {topRecipe.prepTimeMinutes + topRecipe.cookTimeMinutes} mins
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-subtle-border font-medium text-main-text">
                  👥 {topRecipe.servings} Servings
                </span>
                <span className="px-3 py-1 rounded-xl bg-mint text-forest font-bold border border-sage">
                  ✓ {topRecipe.availableIngredients?.length || 0} of {topRecipe.requiredIngredients?.length || 0} owned
                </span>
              </div>
            </div>

            {/* Right Action Box */}
            <div className="flex flex-col gap-2.5 justify-center">
              <button
                onClick={() => onSelectRecipe(topRecipe)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-card transition-all"
              >
                <ChefHat className="w-4 h-4 text-mint" />
                Cook this meal
              </button>

              <button
                onClick={onOpenRescueMode}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-ivory text-forest border border-subtle-border font-semibold text-xs transition-colors"
              >
                View all rescue options
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* D. Ingredients Needing Attention (Max 3 on Home) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest flex items-center gap-2">
            <span>Ingredients Needing Attention</span>
            {totalUrgent > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-error-red text-white font-bold">
                {totalUrgent}
              </span>
            )}
          </h2>

          <button
            onClick={onViewInventory}
            className="text-xs font-semibold text-primary-green hover:text-forest flex items-center gap-1 transition-colors"
          >
            View all inventory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {priorityItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-subtle-border text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-mint text-forest flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-primary-green" />
            </div>
            <h3 className="font-semibold text-forest text-sm">All groceries in great shape</h3>
            <p className="text-secondary-text text-xs max-w-sm mx-auto">
              No items require immediate attention today. Everything is safely stored.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityItems.map((item) => {
              const evalRes = item.rescueEvaluation || {};
              const isUrgent = evalRes.category === 'NEEDS_ATTENTION_TODAY';
              const isPast = evalRes.category === 'PAST_DATE_REVIEW';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col justify-between space-y-3 transition-all ${
                    isUrgent
                      ? 'border-red-200 ring-1 ring-red-100'
                      : isPast
                      ? 'border-amber-200'
                      : 'border-subtle-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-forest text-base leading-snug">
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
                        {evalRes.label || item.urgency?.label || 'Active'}
                      </span>
                    </div>

                    <p className="text-xs text-secondary-text">
                      {item.quantity} {item.unit} • {item.location}
                    </p>

                    <p className="text-xs text-main-text bg-ivory p-2.5 rounded-xl border border-subtle-border leading-relaxed">
                      {item.urgencyExplanation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-subtle-border flex items-center justify-between text-xs">
                    <span className="text-secondary-text">
                      {item.dateType}: <strong>{formatDisplayDate(item.date)}</strong>
                    </span>
                    <button
                      onClick={onOpenRescueMode}
                      className="font-bold text-primary-green hover:text-forest flex items-center gap-0.5 transition-colors"
                    >
                      Find recipes
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
