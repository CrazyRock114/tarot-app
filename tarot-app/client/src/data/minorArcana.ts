import type { TarotCard } from '../types';
import i18next from 'i18next';

// 小阿尔克那基础数据（不含翻译文本）
const suitsBase = [
  { suit: 'wands' as const, nameEn: 'Wands', element: '火', elementEn: 'Fire', keywordsEn: 'Passion, Action, Creativity' },
  { suit: 'cups' as const, nameEn: 'Cups', element: '水', elementEn: 'Water', keywordsEn: 'Emotions, Relationships, Intuition' },
  { suit: 'swords' as const, nameEn: 'Swords', element: '风', elementEn: 'Air', keywordsEn: 'Thought, Challenge, Truth' },
  { suit: 'coins' as const, nameEn: 'Coins', element: '土', elementEn: 'Earth', keywordsEn: 'Physicality, Security, Practicality' },
];

const numbersEn = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const courts = [
  { key: 'page', nameEn: 'Page' },
  { key: 'knight', nameEn: 'Knight' },
  { key: 'queen', nameEn: 'Queen' },
  { key: 'king', nameEn: 'King' },
];

// 获取当前语言
function getCurrentLang(): string {
  return i18next.language || 'zh-CN';
}

// 获取翻译后的牌名
function getCardName(suit: string, number: number, isCourt: boolean = false, courtKey?: string): { name: string; nameEn: string } {
  const t = i18next.getResourceBundle(getCurrentLang(), 'translation');
  const cards = t?.cards?.minor || {};

  if (isCourt && courtKey) {
    const key = `${suit}_${courtKey}`;
    const cardData = cards[key];
    return {
      name: cardData?.name || `${suitBaseToName(suit)}${courtKeyToName(courtKey)}`,
      nameEn: cardData?.nameEn || `${courtKey.charAt(0).toUpperCase() + courtKey.slice(1)} of ${suitBaseToNameEn(suit)}`,
    };
  } else {
    const key = `${suit}_${number}`;
    const cardData = cards[key];
    return {
      name: cardData?.name || `${suitBaseToName(suit)}${numberToName(number)}`,
      nameEn: cardData?.nameEn || `${numbersEn[number - 1]} of ${suitBaseToNameEn(suit)}`,
    };
  }
}

function suitBaseToName(suit: string): string {
  const map: Record<string, string> = { wands: '权杖', cups: '圣杯', swords: '宝剑', coins: '星币' };
  return map[suit] || suit;
}

function suitBaseToNameEn(suit: string): string {
  const map: Record<string, string> = { wands: 'Wands', cups: 'Cups', swords: 'Swords', coins: 'Coins' };
  return map[suit] || suit;
}

function numberToName(num: number): string {
  const map = ['首牌', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  return map[num - 1] || String(num);
}

function courtKeyToName(key: string): string {
  const map: Record<string, string> = { page: '侍从', knight: '骑士', queen: '王后', king: '国王' };
  return map[key] || key;
}

// 生成小阿尔克那
function generateMinorArcana(): TarotCard[] {
  const minorArcana: TarotCard[] = [];
  let id = 22;

  const t = i18next.getResourceBundle(getCurrentLang(), 'translation');
  const cards = t?.cards?.minor || {};

  suitsBase.forEach(({ suit, nameEn, element, elementEn, keywordsEn }) => {
    // 生成数字牌 (1-10)
    for (let num = 1; num <= 10; num++) {
      const key = `${suit}_${num}`;
      const cardData = cards[key] || {};
      const names = getCardName(suit, num);

      minorArcana.push({
        id: id++,
        key,
        name: names.name,
        nameEn: names.nameEn,
        suit,
        arcana: 'minor',
        number: num,
        image: `/cards/${suit}-${String(num).padStart(2, '0')}.jpg`,
        keywords: {
          upright: cardData.keywords?.upright || [keywordsEn.split(', ')[0], 'Development', num === 1 ? 'Beginning' : 'Progress'],
          reversed: cardData.keywords?.reversed || ['Obstacle', 'Delay', 'Adjustment'],
        },
        keywordsEn: cardData.keywordsEn || {
          upright: [keywordsEn.split(', ')[0], 'Development', num === 1 ? 'Beginning' : 'Progress'],
          reversed: ['Obstacle', 'Delay', 'Adjustment'],
        },
        meanings: {
          upright: cardData.meanings?.upright || '',
          reversed: cardData.meanings?.reversed || '',
        },
        meaningsEn: cardData.meaningsEn || {
          upright: '',
          reversed: '',
        },
        description: cardData.description || '',
        element: cardData.element || element,
        elementEn: cardData.elementEn || elementEn,
      } as TarotCard);
    }

    // 生成宫廷牌
    courts.forEach((court) => {
      const key = `${suit}_${court.key}`;
      const cardData = cards[key] || {};
      const names = getCardName(suit, 0, true, court.key);

      const courtDescEn: Record<string, string> = {
        page: 'A beginning of new messages or learning. Represents exploration, curiosity, and the budding of potential.',
        knight: 'Swift action and adventure. Full of drive but potentially impulsive.',
        queen: 'Mature care and intuition. Nurturing, empathy, and inner wisdom.',
        king: 'Control and authority. Maturity, stability, and leadership.',
      };

      minorArcana.push({
        id: id++,
        key,
        name: names.name,
        nameEn: names.nameEn,
        suit,
        arcana: 'minor',
        image: `/cards/${suit}-${court.key}.jpg`,
        keywords: {
          upright: cardData.keywords?.upright || [court.key === 'page' ? 'Messages' : court.key === 'knight' ? 'Action' : court.key === 'queen' ? 'Nurturing' : 'Authority', keywordsEn.split(', ')[0]],
          reversed: cardData.keywords?.reversed || ['Immaturity', 'Excess', 'Distortion'],
        },
        keywordsEn: cardData.keywordsEn || {
          upright: [court.key === 'page' ? 'Messages' : court.key === 'knight' ? 'Action' : court.key === 'queen' ? 'Nurturing' : 'Authority', keywordsEn.split(', ')[0]],
          reversed: ['Immaturity', 'Excess', 'Distortion'],
        },
        meanings: {
          upright: cardData.meanings?.upright || '',
          reversed: cardData.meanings?.reversed || '',
        },
        meaningsEn: cardData.meaningsEn || {
          upright: `The ${court.nameEn} represents ${courtDescEn[court.key].charAt(0).toLowerCase() + courtDescEn[court.key].slice(1)}`,
          reversed: `Immature expression of the ${court.nameEn}'s energy, or an imbalance caused by overusing its traits.`,
        },
        description: cardData.description || '',
        element: cardData.element || element,
        elementEn: cardData.elementEn || elementEn,
      } as TarotCard);
    });
  });

  return minorArcana;
}

// 导出默认的牌数据（兼容旧代码）
export let minorArcana: TarotCard[] = generateMinorArcana();

// 重新加载函数（语言切换时调用）
export function reloadMinorArcana(): TarotCard[] {
  minorArcana = generateMinorArcana();
  return minorArcana;
}

// 获取翻译后的牌数据
export function getMinorArcana(): TarotCard[] {
  return generateMinorArcana();
}

export default minorArcana;
