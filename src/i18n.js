import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

const getSavedLanguage = () => {
  const saved = localStorage.getItem('language');
  if (saved) return saved;
  
  const browserLng = navigator.language.split('-')[0]; // 'en-US' → 'en'
  return ['en', 'id'].includes(browserLng) ? browserLng : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: getSavedLanguage(), // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;