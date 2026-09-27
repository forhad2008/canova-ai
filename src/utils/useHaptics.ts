import { useCallback } from 'react';

/**
 * Web Vibration API Haptics Utility & Custom Hook.
 * Provides tactile physics feedback for task checkboxes, primary buttons, and interactions.
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning';

export const triggerHaptic = (pattern: HapticPattern = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (pattern) {
      case 'selection':
        // Micro pulse for checkbox clicks and radio buttons
        navigator.vibrate(8);
        break;
      case 'light':
        // Soft click feedback for general buttons
        navigator.vibrate(12);
        break;
      case 'medium':
        // Standard tactile button press
        navigator.vibrate(20);
        break;
      case 'heavy':
        // Primary action / Modal open / Heavy physics button
        navigator.vibrate(32);
        break;
      case 'success':
        // Double-pulse reward pattern for completing a task
        navigator.vibrate([16, 45, 28]);
        break;
      case 'warning':
        // Alarm / Delete alert pattern
        navigator.vibrate([30, 60, 30]);
        break;
      default:
        navigator.vibrate(15);
        break;
    }
  } catch {
    // Graceful fallback for non-supported browsers or restricted permissions
  }
};

export function useHaptics() {
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    triggerHaptic(pattern);
  }, []);

  const vibrateSelection = useCallback(() => {
    triggerHaptic('selection');
  }, []);

  const vibrateLight = useCallback(() => {
    triggerHaptic('light');
  }, []);

  const vibrateMedium = useCallback(() => {
    triggerHaptic('medium');
  }, []);

  const vibrateHeavy = useCallback(() => {
    triggerHaptic('heavy');
  }, []);

  const vibrateSuccess = useCallback(() => {
    triggerHaptic('success');
  }, []);

  const vibrateWarning = useCallback(() => {
    triggerHaptic('warning');
  }, []);

  return {
    vibrate,
    vibrateSelection,
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
    vibrateSuccess,
    vibrateWarning,
  };
}
