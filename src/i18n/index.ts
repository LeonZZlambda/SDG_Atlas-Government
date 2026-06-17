import i18next from 'i18next';
import { useState, useEffect } from 'preact/hooks';
import ptBR from './pt-BR';
import enUS from './en-US';
import esES from './es-ES';

// Load initial language from localStorage or browser settings
const savedLanguage = localStorage.getItem('sdg_platform_lang') || 'pt-BR';

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  }
};

i18next.init({
  lng: savedLanguage,
  fallbackLng: 'en-US',
  resources,
  interpolation: {
    escapeValue: false
  }
});

export default i18next;

// Custom Preact Translation Hook
export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setTick(t => t + 1);
    i18next.on('languageChanged', handleLangChange);
    return () => {
      i18next.off('languageChanged', handleLangChange);
    };
  }, []);

  return {
    t: (key: string, options?: any) => {
      // Basic translation replacement for custom templates if options are provided (e.g. {{ratio}})
      let translation = i18next.t(key);
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(optKey => {
          translation = translation.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
        });
      }
      return translation;
    },
    i18n: i18next
  };
}
