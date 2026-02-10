import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  warning: [30, 50, 30],
  error: [50, 100, 50, 100, 50],
  selection: 5,
};

export const useHaptics = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  
  const trigger = useCallback((pattern: HapticPattern = 'medium') => {
    if (!isSupported) return false;
    
    try {
      const vibrationPattern = hapticPatterns[pattern];
      navigator.vibrate(vibrationPattern);
      return true;
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
      return false;
    }
  }, [isSupported]);
  
  const stop = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);
  
  return { trigger, stop, isSupported };
};
