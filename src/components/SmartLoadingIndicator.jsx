import React, { useState, useEffect } from 'react';

/**
 * SmartLoadingIndicator
 * Features realistic 3D flapping butterfly wings with orbiting food ingredients
 * (organic spinach leaf, ripe apricot tomato, and golden grain clove) in the brand palette.
 */
export default function SmartLoadingIndicator({
  message = null,
  size = 'md',
  durationSeconds = 2.5,
  showProgress = false
}) {
  const defaultMessages = [
    'Connecting to your smart kitchen...',
    'Analyzing fridge ingredients & freshness...',
    'Matching zero-waste rescue recipes...',
    'Waking up Sprout the AI sous-chef...'
  ];

  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle messages evenly across the duration
  useEffect(() => {
    if (message) return;
    const intervalMs = Math.max(600, Math.floor((durationSeconds * 1000) / defaultMessages.length));
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % defaultMessages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [message, durationSeconds]);

  // Smooth progress calculation
  useEffect(() => {
    if (!showProgress) return;
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const animTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / totalMs) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(animTimer);
    }, 50);

    return () => clearInterval(animTimer);
  }, [showProgress, durationSeconds]);

  const activeMessage = message || defaultMessages[msgIndex];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-5 text-center select-none">
      {/* Central Animated Stage: 96x96 px */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Soft Pulsing Mint Aura */}
        <div className="w-20 h-20 rounded-full bg-mint animate-ping opacity-35 absolute pointer-events-none" />

        {/* Delicate Outer Circular Track */}
        <div className="w-20 h-20 rounded-full border border-dashed border-sage/80 animate-spin" style={{ animationDuration: '10s' }} />

        {/* Orbiting Ingredient 1: Organic Fresh Leaf (Spinach / Herb) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-orbit-1 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-card flex items-center justify-center border border-sage">
              <svg className="w-4 h-4 text-primary-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Orbiting Ingredient 2: Warm Apricot Tomato */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-orbit-2 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-card flex items-center justify-center border border-sage">
              <svg className="w-4 h-4 text-apricot" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 5V2M10 5c1-1 3-1 4 0" stroke="#183D2B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Center: The Stylized Butterfly with Flapping Wings */}
        <div className="relative z-10 flex items-center justify-center text-forest" style={{ perspective: '400px' }}>
          {/* Left Wing (3D Flapping) */}
          <div className="animate-wing-left -mr-0.5">
            <svg className="w-5 h-8" viewBox="0 0 14 24" fill="none">
              <path
                d="M14 12 C11 5, 3 3, 2 8 C1 13, 8 15, 14 14 C9 17, 3 22, 6 24 C9 24, 13 19, 14 15 Z"
                fill="#CDE2D0"
                stroke="#183D2B"
                strokeWidth="1.2"
              />
            </svg>
          </div>

          {/* Central Slender Butterfly Body */}
          <div className="w-1 h-7 bg-forest rounded-full z-20 shadow-xs" />

          {/* Right Wing (3D Flapping) */}
          <div className="animate-wing-right -ml-0.5">
            <svg className="w-5 h-8" viewBox="0 0 14 24" fill="none">
              <path
                d="M0 12 C3 5, 11 3, 12 8 C13 13, 6 15, 0 14 C5 17, 11 22, 8 24 C5 24, 1 19, 0 15 Z"
                fill="#CDE2D0"
                stroke="#183D2B"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Typography with Display Font */}
      <div className="space-y-1">
        <p className="font-display font-bold text-sm text-forest tracking-tight max-w-sm mx-auto transition-all duration-300">
          {activeMessage}
        </p>
        <p className="text-[11px] text-secondary-text font-medium">
          Zero-waste meal plan in progress...
        </p>
      </div>

      {/* Progress Bar (if showProgress is enabled) */}
      {showProgress && (
        <div className="w-full max-w-xs space-y-1.5 pt-1">
          <div className="w-full h-2 bg-mint rounded-full overflow-hidden border border-sage/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary-green to-forest rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-secondary-text font-bold px-0.5">
            <span>Loading FridgeWise AI</span>
            <span className="text-forest font-mono">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
