
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

// Define resources
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Spanish as default
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'], // First check localStorage, then browser setting
      lookupLocalStorage: 'fossileLocale',
      caches: ['localStorage'],
    }
  });

export default i18n;
