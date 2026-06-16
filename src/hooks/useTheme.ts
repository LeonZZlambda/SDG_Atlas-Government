import { useEffect } from 'preact/hooks';
import { usePlatformStore } from '../store/platformStore';

/**
 * Custom hook for theme management
 * Syncs theme with DOM attributes
 */
export function useTheme() {
  const theme = usePlatformStore(state => state.theme);
  const setTheme = usePlatformStore(state => state.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
