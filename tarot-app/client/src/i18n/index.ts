import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

// 导入卡片翻译文件
import zhCNCards from './locales/cards.zh-CN.json';
import zhTWCards from './locales/cards.zh-TW.json';
import enCards from './locales/cards.en.json';
import jaCards from './locales/cards.ja.json';
import koCards from './locales/cards.ko.json';

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
      'zh-CN': { translation: { ...zhCN, ...zhCNCards } },
      'zh-TW': { translation: { ...zhTW, ...zhTWCards } },
      'en':    { translation: { ...en, ...enCards } },
      'ja':    { translation: { ...ja, ...jaCards } },
      'ko':    { translation: { ...ko, ...koCards } },
    },
    fallbackLng: 'zh-CN',
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nLang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

// 初始化时设置 cookie 和 html lang，供后端和浏览器组件使用
const currentLang = i18n.language || 'zh-CN';
document.cookie = `i18nLang=${currentLang}; path=/; max-age=31536000`;
document.documentElement.lang = currentLang;

// 语言变化时更新 cookie 和 html lang
i18n.on('languageChanged', (lng: string) => {
  document.cookie = `i18nLang=${lng}; path=/; max-age=31536000`;
  document.documentElement.lang = lng;
});

export default i18n;
