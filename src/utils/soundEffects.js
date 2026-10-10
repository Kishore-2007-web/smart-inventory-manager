/**
 * soundEffects.js
 * Zero-dependency procedural sound effects synthesized using the Web Audio API.
 * Provides joyful culinary chimes and tactile feedback for actions and recipe completion.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let inMemoryMuted = false;

/**
 * Checks if sound is enabled in localStorage preferences or in-memory fallback.
 */
export function isSoundMuted() {
  if (typeof localStorage !== 'undefined') {
    try {
      const val = localStorage.getItem('fridgewise_sound_muted');
      if (val !== null) return val === 'true';
    } catch (e) {
      return inMemoryMuted;
    }
  }
  return inMemoryMuted;
}

export function setSoundMuted(muted) {
  inMemoryMuted = !!muted;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fridgewise_sound_muted', muted ? 'true' : 'false');
    } catch (e) {}
  }
}

/**
 * 1. Recipe Completed Celebration Chime
 * A joyful, warm culinary chime arpeggio (C5 -> E5 -> G5 -> C6) with lingering resonance.
 */
export function playRecipeCompletedSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);

    // Warm, lingering bell envelope
    gain.gain.setValueAtTime(0.001, now + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.95);
  });
}

/**
 * 2. Food Item Added / Saved Pop
 * An uplifting, crisp two-tone chime (G5 -> C6).
 */
export function playItemAddedSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(783.99, now); // G5
  osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.08); // C6

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * 3. Item Consumed / Used
 * A satisfying, gentle resonant ding.
 */
export function playItemUsedSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.06); // D6

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
}

/**
 * 4. Item Discarded
 * A subtle, muted soft low tone.
 */
export function playItemDiscardedSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(329.63, now); // E4
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.18); // A3

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * 5. Tactile Micro-Tap / Button Click
 */
export function playClickSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * 6. AI Sparkle / Magic Generation Sound
 * A shimmering, multi-tone twinkling arpeggio (E5 -> G#5 -> B5 -> E6)
 */
export function playAiSparkleSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22];
  const now = ctx.currentTime;

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.001, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.42);
  });
}

/**
 * 7. Filter & Pill Switch Click
 * A crisp, lightweight bubble pop for switching categories and cuisines
 */
export function playFilterSelectSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.04); // A5

  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * 8. Quantity Stepper (+ / -) Sound
 */
export function playQuantityStepSound(isIncrease = true) {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  const startFreq = isIncrease ? 600 : 800;
  const endFreq = isIncrease ? 800 : 600;

  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * 9. Modal Open Swoosh / Chime
 */
export function playModalOpenSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(392.00, now); // G4
  osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * 10. Modal Close Sound
 */
export function playModalCloseSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.08); // E4

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.11);
}

/**
 * 11. Scanner Beep for OCR & Barcode
 */
export function playBarcodeScanSound() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [0, 0.07].forEach((delay) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093.00, now + delay); // C7

    gain.gain.setValueAtTime(0.12, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.05);
  });
}

/**
 * 12. Notification / Alert Chime
 */
export function playNotificationChime() {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [880, 1174.66]; // A5 -> D6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.09);

    gain.gain.setValueAtTime(0.001, now + idx * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.09 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.42);
  });
}

