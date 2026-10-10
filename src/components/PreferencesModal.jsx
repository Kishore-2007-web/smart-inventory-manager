import React, { useState } from 'react';
import { X, RefreshCw, Bell, LogIn, LogOut, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { isFirebaseConfigured, loginWithGoogle, logoutUser } from '../services/firebase.js';
import { playRecipeCompletedSound } from '../utils/soundEffects.js';

export default function PreferencesModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onResetDemo,
  isDemoMode,
  user,
  setUser,
  soundMuted = false,
  onToggleSound
}) {
  const [diet, setDiet] = useState(preferences.diet || 'Vegetarian');
  const [allergies, setAllergies] = useState(preferences.allergies || '');
  const [currencySymbol, setCurrencySymbol] = useState(preferences.currencySymbol || '₹');
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.notificationsEnabled || false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSavePreferences({
      diet,
      allergies,
      currencySymbol,
      notificationsEnabled
    });
    onClose();
  };

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMsg('Browser notifications are not supported on this device.');
      return;
    }

    if (Notification.permission === 'granted') {
      const next = !notificationsEnabled;
      setNotificationsEnabled(next);
      setNotificationMsg(next ? 'Reminders active.' : 'Reminders disabled.');
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setNotificationMsg('Notification permission granted!');
        new Notification('FridgeWise AI', {
          body: 'Reminders enabled. We will notify you when food requires attention.'
        });
      } else {
        setNotificationsEnabled(false);
        setNotificationMsg('Notification permission declined.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const u = await loginWithGoogle();
      if (u) setUser(u);
    } catch (err) {
      alert('Google Login failed: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-card border border-subtle-border relative my-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-secondary-text hover:text-forest hover:bg-ivory transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-forest">Preferences & Settings</h2>
          <p className="text-secondary-text text-xs mt-0.5">
            Configure dietary constraints, currency, and local data
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest mb-1">
              Dietary Preference
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-vegetarian">Non-vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">
              Allergens / Ingredients to Exclude
            </label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Shellfish, Gluten"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest text-main-text"
            />
            <p className="text-[10px] text-secondary-text mt-1">
              Note: Always inspect packaging. AI recipes cannot guarantee medical allergen safety.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest mb-1">
              Currency Symbol
            </label>
            <div className="flex gap-2">
              {['₹', '$', '€', '£'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setCurrencySymbol(sym)}
                  className={`w-11 h-10 rounded-xl font-bold text-sm border transition-colors ${
                    currencySymbol === sym
                      ? 'bg-forest text-white border-forest'
                      : 'bg-ivory text-forest border-subtle-border hover:bg-mint'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-2 border-t border-subtle-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-forest block">
                  Browser Expiry Alerts
                </span>
                <span className="text-[11px] text-secondary-text">
                  Notify when items require attention today
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  notificationsEnabled
                    ? 'bg-mint text-forest border-sage'
                    : 'bg-ivory text-secondary-text border-subtle-border hover:bg-mint'
                }`}
              >
                {notificationsEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>
            {notificationMsg && (
              <p className="text-[11px] text-primary-green mt-1">{notificationMsg}</p>
            )}
          </div>

          {/* Sound Effects & Chimes */}
          <div className="pt-2 border-t border-subtle-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-forest block">
                  Interactive Sound Effects
                </span>
                <span className="text-[11px] text-secondary-text">
                  Joyful culinary chimes on recipe completion & actions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playRecipeCompletedSound()}
                  title="Play celebration chime preview"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-ivory text-forest border border-subtle-border hover:bg-mint transition-colors"
                >
                  Test Chime
                </button>
                {onToggleSound && (
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      !soundMuted
                        ? 'bg-mint text-forest border-sage'
                        : 'bg-ivory text-secondary-text border-subtle-border hover:bg-mint'
                    }`}
                  >
                    {!soundMuted ? 'Enabled' : 'Muted'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Storage Mode */}
          <div className="pt-3 border-t border-subtle-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest">Storage Mode:</span>
              <span className="font-medium text-secondary-text">
                {user ? `Cloud (${user.displayName || user.email})` : 'Local Storage Demo Mode'}
              </span>
            </div>

            {isFirebaseConfigured && (
              <div>
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-ivory hover:bg-mint text-forest border border-subtle-border"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out of Firebase
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-forest hover:bg-forest-light text-white shadow-card"
                  >
                    <LogIn className="w-3.5 h-3.5 text-mint" />
                    Sign In with Google (Firebase)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Demo Reset */}
          {isDemoMode && (
            <div className="pt-3 border-t border-subtle-border">
              {showResetConfirm ? (
                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-xs">
                  <p className="text-error-red font-bold">
                    Reset demo to fresh initial sample groceries?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetDemo();
                        setShowResetConfirm(false);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-error-red text-white font-bold rounded-xl hover:bg-red-700"
                    >
                      Yes, Reset Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1.5 text-secondary-text hover:text-forest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-secondary-text hover:text-error-red hover:bg-red-50 border border-subtle-border transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Sample Demonstration Data
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-card"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
