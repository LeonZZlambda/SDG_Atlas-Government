import { useEffect } from 'preact/hooks';
import { usePlatformStore } from '../store/platformStore';

/**
 * Custom hook for language management
 * Syncs language with DOM attributes and i18next
 */
export function useLanguage() {
  const language = usePlatformStore(state => state.language);
  const setLanguage = usePlatformStore(state => state.setLanguage);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return { language, setLanguage };
}
