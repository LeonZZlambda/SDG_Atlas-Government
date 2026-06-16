import { usePlatformStore } from '../store/platformStore';

/**
 * Custom hook for toast notifications
 * Provides convenient access to toast state and actions
 */
export function useToasts() {
  const toasts = usePlatformStore(state => state.toasts);
  const addToast = usePlatformStore(state => state.addToast);
  const removeToast = usePlatformStore(state => state.removeToast);

  return {
    toasts,
    addToast,
    removeToast,
  };
}
