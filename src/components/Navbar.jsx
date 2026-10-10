import React from 'react';
import { Plus, Settings, RefreshCw, Sparkles, Refrigerator, Home, ListFilter, UtensilsCrossed, Award, Eye, Volume2, VolumeX } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenPreferences,
  onResetDemo,
  onPreviewLoading,
  isDemoMode,
  urgentCount = 0,
  soundMuted = false,
  onToggleSound
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-subtle-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-card group-hover:bg-forest-light transition-colors">
              <Refrigerator className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg text-forest tracking-tight">FridgeWise</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-mint text-forest border border-sage">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-secondary-text hidden sm:block">Less waste. Smarter meals.</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-ivory p-1 rounded-xl border border-subtle-border">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'today'
                ? 'bg-white text-forest shadow-xs'
                : 'text-secondary-text hover:text-forest hover:bg-white/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Today</span>
            {urgentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-error-red text-white font-bold">
                {urgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rescue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'rescue'
                ? 'bg-forest text-white shadow-xs'
                : 'text-forest hover:bg-mint/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-apricot" />
            <span>Rescue Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-forest shadow-xs'
                : 'text-secondary-text hover:text-forest hover:bg-white/60'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'recipes'
                ? 'bg-white text-forest shadow-xs'
                : 'text-secondary-text hover:text-forest hover:bg-white/60'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Recipes</span>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'impact'
                ? 'bg-white text-forest shadow-xs'
                : 'text-secondary-text hover:text-forest hover:bg-white/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Impact</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Preview Loading Animation Button */}
          <button
            onClick={onPreviewLoading}
            title="Preview Butterfly & Food Loading Animation"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-ivory hover:bg-mint text-forest border border-subtle-border text-xs font-bold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-primary-green" />
            <span className="hidden sm:inline">Animation</span>
          </button>

          {/* Reset Demo */}
          {isDemoMode && (
            <button
              onClick={onResetDemo}
              title="Reset sample demonstration data"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-secondary-text hover:text-forest hover:bg-ivory border border-subtle-border transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenPreferences}
            title="Settings & Preferences"
            className="p-2 rounded-xl text-secondary-text hover:text-forest hover:bg-ivory transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sound Effects Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={soundMuted ? "Sound effects muted (Click to enable audio)" : "Sound effects active (Click to mute audio)"}
              className={`p-2 rounded-xl border transition-colors ${
                soundMuted
                  ? 'text-secondary-text hover:text-forest hover:bg-ivory border-subtle-border'
                  : 'text-primary-green bg-mint/50 border-sage hover:bg-mint'
              }`}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-secondary-text" />
              ) : (
                <Volume2 className="w-4 h-4 text-primary-green" />
              )}
            </button>
          )}

          {/* Primary Add Food Action */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-card transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Food</span>
          </button>
        </div>
      </div>
    </header>
  );
}
