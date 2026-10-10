import React from 'react';
import { ChefHat, Sparkles, Clock, Users, ArrowRight, RotateCcw } from 'lucide-react';
import SmartLoadingIndicator from './SmartLoadingIndicator.jsx';
import { playAiSparkleSound, playFilterSelectSound } from '../utils/soundEffects.js';

export default function RecipesScreen({
  recipes = [],
  onSelectRecipe,
  onGenerateAiRecipe,
  isGeneratingAi,
  aiStatusMessage,
  selectedCuisine,
  setSelectedCuisine,
  selectedDiet,
  setSelectedDiet,
  pantryReadyOnly,
  setPantryReadyOnly
}) {
  return (
    <div className="space-y-7 pb-20 md:pb-12">
      {/* Header & AI Generator Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
            Rescue Recipes
          </h1>
          <p className="text-secondary-text text-sm sm:text-base mt-1">
            Recipes ranked by how effectively they rescue your groceries
          </p>
        </div>

        {/* AI Generator Action Button */}
        <button
          onClick={() => {
            playAiSparkleSound();
            onGenerateAiRecipe();
          }}
          disabled={isGeneratingAi}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-card transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-apricot" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* AI Loading State Animation */}
      {isGeneratingAi && (
        <div className="bg-white rounded-3xl p-8 border border-sage shadow-card">
          <SmartLoadingIndicator
            message="Analyzing fridge ingredients & generating tailored zero-waste recipe..."
          />
        </div>
      )}

      {/* AI Status Banner / Fallback Notice */}
      {aiStatusMessage && !isGeneratingAi && (
        <div className="p-4 bg-white rounded-2xl border border-subtle-border shadow-card flex items-center justify-between gap-3 text-xs text-main-text">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary-green shrink-0" />
            <span>{aiStatusMessage}</span>
          </div>
          <button
            onClick={() => {
              playAiSparkleSound();
              onGenerateAiRecipe();
            }}
            className="font-bold text-primary-green hover:text-forest flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-subtle-border shadow-card flex flex-wrap items-center justify-between gap-4">
        {/* Cuisine Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-secondary-text mr-1">Cuisine:</span>
          {['all', 'Indian', 'Global'].map((c) => (
            <button
              key={c}
              onClick={() => {
                playFilterSelectSound();
                setSelectedCuisine(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCuisine === c
                  ? 'bg-forest text-white'
                  : 'bg-ivory text-secondary-text hover:text-forest hover:bg-mint'
              }`}
            >
              {c === 'all' ? 'All Cuisines' : c}
            </button>
          ))}
        </div>

        {/* Diet & 100% Pantry Ready */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-secondary-text mr-1">Diet:</span>
            {['all', 'Vegetarian', 'Non-vegetarian'].map((d) => (
              <button
                key={d}
                onClick={() => {
                  playFilterSelectSound();
                  setSelectedDiet(d);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedDiet === d
                    ? 'bg-primary-green text-white'
                    : 'bg-ivory text-secondary-text hover:text-forest hover:bg-mint'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-forest cursor-pointer bg-mint/50 px-3 py-1.5 rounded-xl border border-sage">
            <input
              type="checkbox"
              checked={pantryReadyOnly}
              onChange={(e) => {
                playFilterSelectSound();
                setPantryReadyOnly(e.target.checked);
              }}
              className="rounded text-primary-green focus:ring-primary-green"
            />
            <span>100% Pantry Ready</span>
          </label>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-subtle-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center mx-auto">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-forest">No matching recipes</h3>
          <p className="text-secondary-text text-sm max-w-sm mx-auto">
            Adjust your cuisine or diet filters to discover more dishes from your fridge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => {
            const hasUrgentRescues = recipe.urgentRescueCount > 0;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl p-6 border border-subtle-border shadow-card hover:border-sage transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Urgent Rescue Badge */}
                  {hasUrgentRescues && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint border border-sage text-forest text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-apricot" />
                      <span>Rescues: {recipe.urgentRescuedNames.join(', ')}</span>
                    </div>
                  )}

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-forest group-hover:text-primary-green transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-secondary-text line-clamp-2 mt-1 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary-text" />
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-secondary-text" />
                      {recipe.servings} servings
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-ivory text-main-text text-[11px] font-semibold border border-subtle-border">
                      {recipe.diet}
                    </span>
                  </div>

                  {/* Match Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-main-text">Pantry Availability</span>
                      <span className={recipe.isPantryReady ? 'text-primary-green font-bold' : 'text-secondary-text'}>
                        {recipe.availableIngredients?.length || 0} of {recipe.requiredIngredients?.length || 0} owned ({recipe.matchPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-ivory rounded-full overflow-hidden border border-subtle-border">
                      <div
                        className={`h-full rounded-full ${
                          recipe.isPantryReady ? 'bg-primary-green' : 'bg-forest'
                        }`}
                        style={{ width: `${Math.min(100, recipe.matchPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Rationale */}
                  {recipe.whyRecommended && (
                    <p className="text-[11px] text-main-text bg-ivory p-3 rounded-2xl border border-subtle-border leading-relaxed">
                      💡 {recipe.whyRecommended}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onSelectRecipe(recipe)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-card"
                >
                  <ChefHat className="w-4 h-4 text-mint" />
                  View Recipe & Cook
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
