import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

export const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
  { code: 'en',    label: 'English',  flag: '🇺🇸' },
  { code: 'ja',    label: '日本語',   flag: '🇯🇵' },
  { code: 'ko',    label: '한국어',   flag: '🇰🇷' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      'en':    { translation: en },
      'ja':    { translation: ja },
      'ko':    { translation: ko },
    },
    fallbackLng: 'zh-CN',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nLang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
