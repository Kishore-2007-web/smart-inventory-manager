import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Lightbulb, ChevronRight, X, Volume2, Heart } from 'lucide-react';
import { playClickSound, playItemAddedSound } from '../utils/soundEffects.js';

const KITCHEN_TIPS = [
  "Wrap fresh herbs in a damp paper towel inside a container to keep them crisp for 2 weeks!",
  "Store tomatoes at room temperature — refrigeration halts ripening and dulls their sweet flavor!",
  "Keep potatoes and onions in separate cool, dark baskets — onions produce gas that makes potatoes sprout!",
  "Slice and freeze ripe bananas with peel removed — perfect for zero-waste smoothies and baking!",
  "Revive slightly wilted celery or carrots by placing their stems in a jar of cold water for 30 minutes!",
  "Label opened milk, cream or sauces with the date you opened them so you never second-guess freshness!"
];

export default function AiMascotCharacter({
  analysis,
  recommendedRecipes = [],
  onSelectRecipe,
  onOpenRescueMode,
  onOpenAddModal
}) {
  const [isWaving, setIsWaving] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [mode, setMode] = useState('greeting'); // 'greeting' | 'tip'
  const [isDismissed, setIsDismissed] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);

  const { needsAttentionToday = [], pastDateReview = [], sortedItems = [] } = analysis || {};
  const urgentCount = needsAttentionToday.length + pastDateReview.length;
  const topUrgent = needsAttentionToday[0] || pastDateReview[0];
  const topRecipe = recommendedRecipes.length > 0 ? recommendedRecipes[0] : null;

  // Trigger gentle entrance wave
  useEffect(() => {
    setIsWaving(true);
    const waveTimer = setTimeout(() => {
      // Keep waving active for a lively welcoming feel
    }, 4000);
    return () => clearTimeout(waveTimer);
  }, []);

  const handleMascotClick = () => {
    playItemAddedSound();
    setIsWaving(true);
    // Cycle to next tip
    setMode('tip');
    setTipIndex((prev) => (prev + 1) % KITCHEN_TIPS.length);
    setBubbleKey((prev) => prev + 1);
  };

  const handleShowGreeting = () => {
    playClickSound();
    setMode('greeting');
    setBubbleKey((prev) => prev + 1);
  };

  if (isDismissed) {
    return (
      <button
        onClick={() => {
          playClickSound();
          setIsDismissed(false);
        }}
        title="Say hello to Sprout the AI chef!"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-mint text-forest text-xs font-bold border border-sage shadow-xs transition-all hover:scale-105"
      >
        <span className="text-sm animate-wave-hand inline-block">👋</span>
        <span>Sprout AI Companion</span>
      </button>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-white/95 via-mint/30 to-white/95 rounded-3xl p-4 sm:p-5 border border-sage shadow-card backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Decorative ambient background accents */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-mint/40 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-apricot/20 blur-xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={() => {
          playClickSound();
          setIsDismissed(true);
        }}
        title="Minimize Sprout companion"
        className="absolute top-3 right-3 p-1.5 text-secondary-text hover:text-forest hover:bg-ivory rounded-xl transition-colors z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
        {/* Animated Sprout Character Avatar */}
        <div
          onClick={handleMascotClick}
          className="relative shrink-0 cursor-pointer group select-none"
          title="Click Sprout to say hello or get a cooking tip!"
        >
          {/* Pulsing glow aura */}
          <div className="absolute inset-0 rounded-full bg-sage/30 blur-md group-hover:bg-primary-green/30 transition-all duration-300 scale-95 group-hover:scale-110" />

          {/* SVG Character Sprout */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 relative animate-mascot-bounce">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md overflow-visible"
            >
              {/* Little companion butterfly above hat */}
              <g className="animate-bounce-subtle" transform="translate(18, -4)">
                {/* Left wing */}
                <ellipse cx="6" cy="4" rx="4" ry="2.5" fill="#F0B779" opacity="0.9" transform="rotate(-30 6 4)" />
                {/* Right wing */}
                <ellipse cx="12" cy="4" rx="4" ry="2.5" fill="#F0B779" opacity="0.9" transform="rotate(30 12 4)" />
                {/* Body */}
                <circle cx="9" cy="4" r="1.2" fill="#183D2B" />
              </g>

              {/* Chef Hat */}
              <g id="chef-hat">
                <path
                  d="M 36 28 C 34 16, 44 10, 50 14 C 56 9, 66 16, 64 28 Z"
                  fill="#FFFFFF"
                  stroke="#CDE2D0"
                  strokeWidth="1.5"
                />
                <circle cx="42" cy="18" r="7" fill="#FFFFFF" />
                <circle cx="50" cy="14" r="8" fill="#FFFFFF" />
                <circle cx="58" cy="18" r="7" fill="#FFFFFF" />
                {/* Hat Band */}
                <rect x="35" y="27" width="30" height="7" rx="3" fill="#183D2B" />
                {/* Gold Apricot Badge on Hat */}
                <circle cx="50" cy="30.5" r="2.2" fill="#F0B779" />
              </g>

              {/* Sprout Leaf on Hat */}
              <g id="hat-sprout" transform="translate(50, 10)">
                <path
                  d="M 0 0 C -4 -7, -2 -11, 0 -11 C 3 -11, 4 -7, 0 0 Z"
                  fill="#367653"
                />
                <path
                  d="M 0 -2 C 4 -6, 7 -7, 8 -4 C 8 -2, 5 0, 0 -2 Z"
                  fill="#CDE2D0"
                />
              </g>

              {/* Sprout Body */}
              <ellipse
                cx="50"
                cy="62"
                rx="28"
                ry="26"
                fill="url(#sproutGradient)"
                stroke="#367653"
                strokeWidth="2"
              />

              {/* Soft Gradient for Body */}
              <defs>
                <linearGradient id="sproutGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EAF3E9" />
                  <stop offset="70%" stopColor="#CDE2D0" />
                  <stop offset="100%" stopColor="#A8CEB0" />
                </linearGradient>
              </defs>

              {/* Left Arm (Resting on Hip) */}
              <path
                d="M 23 60 C 17 65, 18 72, 24 73"
                stroke="#367653"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Arm & Waving Hand */}
              <g className="animate-wave-hand">
                {/* Arm */}
                <path
                  d="M 75 58 C 82 50, 87 42, 85 35"
                  stroke="#367653"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Waving Mitten/Hand */}
                <ellipse cx="85" cy="33" rx="5.5" ry="5.5" fill="#FFFFFF" stroke="#367653" strokeWidth="1.5" />
                {/* Thumb */}
                <circle cx="81" cy="34" r="2.2" fill="#FFFFFF" stroke="#367653" strokeWidth="1" />
                {/* Cute greeting sparkles near waving hand */}
                <path
                  d="M 93 25 L 94 28 L 97 29 L 94 30 L 93 33 L 92 30 L 89 29 L 92 28 Z"
                  fill="#F0B779"
                />
              </g>

              {/* Rosy Cheeks */}
              <ellipse cx="38" cy="62" rx="4" ry="2.5" fill="#F0B779" opacity="0.65" />
              <ellipse cx="62" cy="62" rx="4" ry="2.5" fill="#F0B779" opacity="0.65" />

              {/* Happy Eyes */}
              <path
                d="M 37 54 C 39 50, 43 50, 45 54"
                stroke="#183D2B"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 55 54 C 57 50, 61 50, 63 54"
                stroke="#183D2B"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Cheerful Smile */}
              <path
                d="M 44 64 C 47 69, 53 69, 56 64"
                stroke="#183D2B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Little Chef Apron Bow */}
              <ellipse cx="50" cy="74" rx="3.5" ry="2" fill="#F0B779" />
              <path d="M 48 75 L 45 81" stroke="#F0B779" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 52 75 L 55 81" stroke="#F0B779" strokeWidth="1.8" strokeLinecap="round" />
            </svg>

            {/* Click me hint badge */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-forest text-[9px] font-bold text-mint shadow-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Tap me!
            </span>
          </div>
        </div>

        {/* Speech Bubble Content */}
        <div key={bubbleKey} className="flex-1 text-center sm:text-left space-y-2 animate-speech-pop">
          {/* Header & Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest text-mint text-xs font-bold">
              <Sparkles className="w-3 h-3 text-apricot" />
              <span>Sprout • AI Companion</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleShowGreeting}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
                  mode === 'greeting'
                    ? 'bg-mint text-forest border border-sage'
                    : 'text-secondary-text hover:text-forest'
                }`}
              >
                Welcome
              </button>
              <button
                onClick={handleMascotClick}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  mode === 'tip'
                    ? 'bg-mint text-forest border border-sage'
                    : 'text-secondary-text hover:text-forest'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-apricot" />
                <span>Chef Tip</span>
              </button>
            </div>
          </div>

          {/* Dynamic Dialogue */}
          {mode === 'greeting' ? (
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-forest leading-snug">
                {urgentCount > 0 ? (
                  <>
                    "Hi there! 👋 I'm <strong className="text-forest underline decoration-apricot underline-offset-2">Sprout</strong>, and I found{' '}
                    <span className="text-error-red font-extrabold">{urgentCount} item{urgentCount > 1 ? 's' : ''}</span> that need your love today!"
                  </>
                ) : sortedItems.length > 0 ? (
                  <>
                    "Welcome back! 👋 Your fridge is looking healthy and organized today!"
                  </>
                ) : (
                  <>
                    "Welcome home! 👋 I'm <strong className="text-forest">Sprout</strong>, your smart kitchen partner. Let's add some fresh groceries!"
                  </>
                )}
              </h3>

              <p className="text-xs text-secondary-text leading-relaxed">
                {topUrgent && topRecipe ? (
                  <>
                    We can rescue your <span className="font-bold text-forest">{topUrgent.name}</span> by making{' '}
                    <span className="font-bold text-primary-green">"{topRecipe.name}"</span> right now.
                  </>
                ) : sortedItems.length > 0 ? (
                  <>
                    Tap any recipe to plan meals or tap on me anytime for zero-waste kitchen tricks.
                  </>
                ) : (
                  <>
                    Add a few ingredients you bought today and I'll track freshness, suggest zero-waste meals, and save money!
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {topRecipe && onSelectRecipe && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onSelectRecipe(topRecipe);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Cook {topRecipe.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-mint" />
                  </button>
                )}

                {urgentCount > 0 && onOpenRescueMode && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onOpenRescueMode();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-mint text-forest border border-sage text-xs font-bold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-apricot" />
                    <span>View Rescue Mode</span>
                  </button>
                )}

                {sortedItems.length === 0 && onOpenAddModal && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onOpenAddModal();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Add First Ingredient</span>
                    <ChevronRight className="w-3.5 h-3.5 text-mint" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Tip Mode */
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-apricot shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-forest">
                    Sprout's Zero-Waste Kitchen Tip #{tipIndex + 1}
                  </h4>
                  <p className="text-xs text-secondary-text mt-0.5 leading-relaxed">
                    "{KITCHEN_TIPS[tipIndex]}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  onClick={handleMascotClick}
                  className="px-3 py-1.5 rounded-xl bg-mint hover:bg-sage text-forest text-xs font-bold border border-sage transition-colors"
                >
                  Next Tip 💡
                </button>
                <button
                  onClick={handleShowGreeting}
                  className="px-3 py-1.5 rounded-xl text-secondary-text hover:text-forest text-xs font-semibold"
                >
                  Back to greeting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
