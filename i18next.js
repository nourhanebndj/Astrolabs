import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import englais from './locales/en.json';
import arabe from './locales/ar.json';
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/ar';
import '@formatjs/intl-pluralrules';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: englais
      },
      ar: {
        translation: arabe
      }
    },
    lng: 'en', // langue par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Fonction pour mettre à jour RTL
const updateLayoutDirection = (language) => {
  if (language === 'ar') {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
};

// Appliquer les modifications de RTL lorsque la langue change
i18n.on('languageChanged', updateLayoutDirection);

export default i18n;
