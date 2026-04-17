import type { TarotCard } from '../types';
import i18next from 'i18next';

// 大阿尔克那基础数据（不含翻译文本）
const majorArcanaBase = [
  {
    id: 0,
    key: 'fool',
    nameEn: 'The Fool',
    suit: 'major',
    arcana: 'major',
    image: '/cards/00-fool.jpg',
    element: 'air',
    planet: 'uranus',
  },
  {
    id: 1,
    key: 'magician',
    nameEn: 'The Magician',
    suit: 'major',
    arcana: 'major',
    image: '/cards/01-magician.jpg',
    element: 'air',
    planet: 'mercury',
  },
  {
    id: 2,
    key: 'highPriestess',
    nameEn: 'The High Priestess',
    suit: 'major',
    arcana: 'major',
    image: '/cards/02-high-priestess.jpg',
    element: 'water',
    planet: 'moon',
  },
  {
    id: 3,
    key: 'empress',
    nameEn: 'The Empress',
    suit: 'major',
    arcana: 'major',
    image: '/cards/03-empress.jpg',
    element: 'earth',
    planet: 'venus',
  },
  {
    id: 4,
    key: 'emperor',
    nameEn: 'The Emperor',
    suit: 'major',
    arcana: 'major',
    image: '/cards/04-emperor.jpg',
    element: 'fire',
    planet: 'mars',
    zodiac: 'aries',
  },
  {
    id: 5,
    key: 'hierophant',
    nameEn: 'The Hierophant',
    suit: 'major',
    arcana: 'major',
    image: '/cards/05-hierophant.jpg',
    element: 'earth',
    zodiac: 'taurus',
  },
  {
    id: 6,
    key: 'lovers',
    nameEn: 'The Lovers',
    suit: 'major',
    arcana: 'major',
    image: '/cards/06-lovers.jpg',
    element: 'air',
    zodiac: 'gemini',
  },
  {
    id: 7,
    key: 'chariot',
    nameEn: 'The Chariot',
    suit: 'major',
    arcana: 'major',
    image: '/cards/07-chariot.jpg',
    element: 'water',
    zodiac: 'cancer',
  },
  {
    id: 8,
    key: 'strength',
    nameEn: 'Strength',
    suit: 'major',
    arcana: 'major',
    image: '/cards/08-strength.jpg',
    element: 'fire',
    zodiac: 'leo',
  },
  {
    id: 9,
    key: 'hermit',
    nameEn: 'The Hermit',
    suit: 'major',
    arcana: 'major',
    image: '/cards/09-hermit.jpg',
    element: 'earth',
    zodiac: 'virgo',
  },
  {
    id: 10,
    key: 'wheelOfFortune',
    nameEn: 'Wheel of Fortune',
    suit: 'major',
    arcana: 'major',
    image: '/cards/10-wheel-of-fortune.jpg',
    element: 'fire',
    planet: 'jupiter',
  },
  {
    id: 11,
    key: 'justice',
    nameEn: 'Justice',
    suit: 'major',
    arcana: 'major',
    image: '/cards/11-justice.jpg',
    element: 'air',
    zodiac: 'libra',
  },
  {
    id: 12,
    key: 'hangedMan',
    nameEn: 'The Hanged Man',
    suit: 'major',
    arcana: 'major',
    image: '/cards/12-hanged-man.jpg',
    element: 'water',
    planet: 'neptune',
  },
  {
    id: 13,
    key: 'death',
    nameEn: 'Death',
    suit: 'major',
    arcana: 'major',
    image: '/cards/13-death.jpg',
    element: 'water',
    zodiac: 'scorpio',
  },
  {
    id: 14,
    key: 'temperance',
    nameEn: 'Temperance',
    suit: 'major',
    arcana: 'major',
    image: '/cards/14-temperance.jpg',
    element: 'fire',
    zodiac: 'sagittarius',
  },
  {
    id: 15,
    key: 'devil',
    nameEn: 'The Devil',
    suit: 'major',
    arcana: 'major',
    image: '/cards/15-devil.jpg',
    element: 'earth',
    zodiac: 'capricorn',
  },
  {
    id: 16,
    key: 'tower',
    nameEn: 'The Tower',
    suit: 'major',
    arcana: 'major',
    image: '/cards/16-tower.jpg',
    element: 'fire',
    planet: 'mars',
  },
  {
    id: 17,
    key: 'star',
    nameEn: 'The Star',
    suit: 'major',
    arcana: 'major',
    image: '/cards/17-star.jpg',
    element: 'air',
    zodiac: 'aquarius',
  },
  {
    id: 18,
    key: 'moon',
    nameEn: 'The Moon',
    suit: 'major',
    arcana: 'major',
    image: '/cards/18-moon.jpg',
    element: 'water',
    zodiac: 'pisces',
  },
  {
    id: 19,
    key: 'sun',
    nameEn: 'The Sun',
    suit: 'major',
    arcana: 'major',
    image: '/cards/19-sun.jpg',
    element: 'fire',
    planet: 'sun',
  },
  {
    id: 20,
    key: 'judgement',
    nameEn: 'Judgement',
    suit: 'major',
    arcana: 'major',
    image: '/cards/20-judgement.jpg',
    element: 'fire',
    planet: 'pluto',
  },
  {
    id: 21,
    key: 'world',
    nameEn: 'The World',
    suit: 'major',
    arcana: 'major',
    image: '/cards/21-world.jpg',
    element: 'earth',
    planet: 'saturn',
  },
];

// 获取当前语言
function getCurrentLang(): string {
  return i18next.language || 'zh-CN';
}

// 获取翻译后的牌数据
export function getMajorArcana(): TarotCard[] {
  const t = i18next.getResourceBundle(getCurrentLang(), 'translation');
  const cards = t?.cards?.major || {};

  return majorArcanaBase.map(base => {
    const cardData = cards[base.key] || {};
    return {
      ...base,
      name: cardData.name || base.nameEn,
      keywords: {
        upright: cardData.keywords?.upright || [],
        reversed: cardData.keywords?.reversed || [],
      },
      keywordsEn: cardData.keywordsEn || { upright: [], reversed: [] },
      meanings: {
        upright: cardData.meanings?.upright || '',
        reversed: cardData.meanings?.reversed || '',
      },
      meaningsEn: cardData.meaningsEn || { upright: '', reversed: '' },
      description: cardData.description || '',
      element: cardData.element || base.element,
      planet: cardData.planet || base.planet,
      zodiac: cardData.zodiac || base.zodiac,
    } as TarotCard;
  });
}

// 导出默认的牌数据（兼容旧代码）
export const majorArcana: TarotCard[] = getMajorArcana();

// 重新加载函数（语言切换时调用）
export function reloadMajorArcana(): TarotCard[] {
  return getMajorArcana();
}

export default majorArcana;
