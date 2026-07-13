import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

function normalizeLanguage(language: string | null | undefined): string | null {
  if (!language) return null;
  return LANGUAGES.find(item => item.code.toLowerCase() === language.toLowerCase())?.code || null;
}

async function detectInitialLanguage(): Promise<string> {
  const queryLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get('lang'));
  if (queryLanguage) return queryLanguage;

  // A previous manual choice always wins over IP detection.
  const storedLanguage = normalizeLanguage(localStorage.getItem('i18nLang'));
  if (storedLanguage) return storedLanguage;

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    const response = await fetch('/api/locale', {
      credentials: 'same-origin',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    window.clearTimeout(timeout);

    if (response.ok) {
      const data: { language?: string } = await response.json();
      const detectedLanguage = normalizeLanguage(data.language);
      if (detectedLanguage) return detectedLanguage;
    }
  } catch {
    // Network or IP-location failures intentionally fall back to English.
  }

  return 'en';
}

export async function initializeI18n() {
  const initialLanguage = await detectInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        'zh-CN': { translation: { ...zhCN, ...zhCNCards } },
        'zh-TW': { translation: { ...zhTW, ...zhTWCards } },
        'en':    { translation: { ...en, ...enCards } },
        'ja':    { translation: { ...ja, ...jaCards } },
        'ko':    { translation: { ...ko, ...koCards } },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      supportedLngs: LANGUAGES.map(language => language.code),
      interpolation: { escapeValue: false },
    });

  document.cookie = `i18nLang=${initialLanguage}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = initialLanguage;
}

// 语言变化时更新 cookie 和 html lang
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('i18nLang', lng);
  document.cookie = `i18nLang=${lng}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = lng;
});

export default i18n;
