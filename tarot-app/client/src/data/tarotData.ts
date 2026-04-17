import type { Spread, TarotReader, TarotCard } from '../types';
import type { TFunction } from 'i18next';
import { majorArcana, reloadMajorArcana } from './majorArcana';
import { minorArcana, reloadMinorArcana } from './minorArcana';

// 导出所有塔罗牌（动态生成以支持语言切换）
export function getAllCards(): TarotCard[] {
  return [...reloadMajorArcana(), ...reloadMinorArcana()];
}

// 兼容旧代码
export const allCards = getAllCards();

// 原始牌阵数据（只有 ID，不含翻译文本）
// 原始牌阵数据（使用英文作为fallback，通过getSpreads函数翻译）
export const rawSpreads: Spread[] = [
  {
    id: 'single',
    name: 'Single Card',
    nameEn: 'Single Card',
    description: 'The simplest and most direct reading, perfect for quick guidance',
    positions: [{ index: 0, name: 'Core Message', meaning: 'The core guidance or answer for your current situation' }],
    cardCount: 1,
    suitableFor: ['Quick guidance', 'Daily advice', 'Simple questions'],
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    nameEn: 'Three Card Spread',
    description: 'Classic three-card spread exploring past, present, and future',
    positions: [
      { index: 0, name: 'Past', meaning: 'Past factors affecting your current situation' },
      { index: 1, name: 'Present', meaning: 'Current situation and challenges' },
      { index: 2, name: 'Future', meaning: 'Possible future developments' },
    ],
    cardCount: 3,
    suitableFor: ['Timeline', 'Relationship development', 'Project progress'],
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameEn: 'Celtic Cross',
    description: 'The most comprehensive classic spread, deeply exploring all aspects',
    positions: [
      { index: 0, name: 'Present Situation', meaning: 'Your current situation' },
      { index: 1, name: 'Challenge', meaning: 'Forces hindering or supporting you' },
      { index: 2, name: 'Foundation', meaning: 'Root cause and basis of the issue' },
      { index: 3, name: 'Past', meaning: 'Fading influences from the past' },
      { index: 4, name: 'Future', meaning: 'Approaching influences' },
      { index: 5, name: 'Self', meaning: 'Your attitude and feelings' },
      { index: 6, name: 'Environment', meaning: 'External influences and others\' attitudes' },
      { index: 7, name: 'Hopes/Fears', meaning: 'Your hopes or fears' },
      { index: 8, name: 'Outcome', meaning: 'Final result or advice' },
    ],
    cardCount: 10,
    suitableFor: ['Complex issues', 'Deep exploration', 'Life direction'],
  },
  {
    id: 'relationship',
    name: 'Relationship Spread',
    nameEn: 'Relationship Spread',
    description: 'Explores the dynamics and development of a relationship',
    positions: [
      { index: 0, name: 'Your Position', meaning: 'Your state and feelings in the relationship' },
      { index: 1, name: 'Their Position', meaning: 'Their state and feelings' },
      { index: 2, name: 'Relationship Dynamic', meaning: 'The energy flow between you' },
      { index: 3, name: 'Challenge', meaning: 'Difficulties or obstacles' },
      { index: 4, name: 'Potential', meaning: 'Possible directions for the relationship' },
    ],
    cardCount: 5,
    suitableFor: ['Romantic relationship', 'Friendship', 'Work partnership'],
  },
  {
    id: 'decision',
    name: 'Decision Spread',
    nameEn: 'Decision Spread',
    description: 'Helps you make an important decision',
    positions: [
      { index: 0, name: 'Current Situation', meaning: 'Full picture of the current situation' },
      { index: 1, name: 'Choice A', meaning: 'Outcome of taking the first path' },
      { index: 2, name: 'Choice B', meaning: 'Outcome of taking the second path' },
      { index: 3, name: 'Advice', meaning: 'Guidance to help your decision' },
    ],
    cardCount: 4,
    suitableFor: ['Career choice', 'Relocation', 'Major decision'],
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    nameEn: 'Problem Solving',
    description: 'Analyzes the cause, current state, and solutions',
    positions: [
      { index: 0, name: 'Root Cause', meaning: 'The fundamental cause of the problem' },
      { index: 1, name: 'Current State', meaning: 'The current stage of development' },
      { index: 2, name: 'Solution', meaning: 'Recommended strategies and action plan' },
    ],
    cardCount: 3,
    suitableFor: ['Problem analysis', 'Finding solutions', 'Breaking through'],
  },
  {
    id: 'career',
    name: 'Career Spread',
    nameEn: 'Career Spread',
    description: 'Focuses on career development, challenges, and opportunities',
    positions: [
      { index: 0, name: 'Current Career', meaning: 'Your current career situation and energy' },
      { index: 1, name: 'Obstacles', meaning: 'Factors hindering development' },
      { index: 2, name: 'Hidden Opportunity', meaning: 'Opportunities you may overlook' },
      { index: 3, name: 'Action Plan', meaning: 'Concrete actions to advance your career' },
      { index: 4, name: 'Future Outlook', meaning: 'Trends and potential' },
    ],
    cardCount: 5,
    suitableFor: ['Career development', 'Job change', 'Entrepreneurship'],
  },
  {
    id: 'diamond',
    name: 'Diamond Spread',
    nameEn: 'Diamond Spread',
    description: 'Versatile event analysis covering cause, present, and future',
    positions: [
      { index: 0, name: 'Cause', meaning: 'Origin and background of the event' },
      { index: 1, name: 'Current Situation', meaning: 'Current state of the event\'s development' },
      { index: 2, name: 'Hidden Influences', meaning: 'Invisible factors affecting the outcome' },
      { index: 3, name: 'Final Outcome', meaning: 'Direction and ending of the event' },
    ],
    cardCount: 4,
    suitableFor: ['Single event', 'Future prediction', 'Comprehensive analysis'],
  },
];

// 原始塔罗师数据（只有 ID，不含翻译文本）
export const rawReaders: TarotReader[] = [
  {
    id: 'mystic',
    name: '星月',
    avatar: '/readers/mystic.jpg',
    style: 'mystic',
    styleName: '直觉系',
    description: '相信直觉和第一印象，解读充满灵感和诗意',
    prompt: '你是一位直觉型塔罗师。请用富有诗意和灵感的方式解读牌面，强调直觉感受和能量流动。语言温暖感性，善用比喻和意象。',
  },
  {
    id: 'rational',
    name: '墨尘',
    avatar: '/readers/rational.jpg',
    style: 'rational',
    styleName: '逻辑系',
    description: '理性分析牌面关系，提供清晰的行动建议',
    prompt: '你是一位逻辑型塔罗师。请用清晰理性的方式分析牌面，注重牌与牌之间的逻辑关系，给出具体可行的行动建议。语言简洁明了。',
  },
  {
    id: 'warm',
    name: '暖阳',
    avatar: '/readers/warm.jpg',
    style: 'warm',
    styleName: '治愈系',
    description: '温柔关怀，帮助你疗愈内心，找到平和',
    prompt: '你是一位治愈型塔罗师。请用温柔关怀的语气解读牌面，关注问卜者的情感需求和内心疗愈。给予安慰和鼓励，帮助找到内心的平静。',
  },
  {
    id: 'punk',
    name: '夜羽',
    avatar: '/readers/punk.jpg',
    style: 'punk',
    styleName: '神秘系',
    description: '深入神秘学传统，揭示隐藏的深层含义',
    prompt: '你是一位神秘型塔罗师。请深入探索牌面的神秘学含义，结合占星、元素、卡巴拉等传统，揭示深层的灵性讯息。语言神秘深邃。',
  },
];

/** 使用 i18next t() 函数获取翻译后的牌阵列表 */
export function getSpreads(t: TFunction): Spread[] {
  return rawSpreads.map(spread => {
    const prefix = `spreads.${spread.id}`;
    return {
      ...spread,
      name: t(`${prefix}.name`, spread.name),
      description: t(`${prefix}.description`, spread.description),
      positions: spread.positions.map((pos, i) => ({
        ...pos,
        name: t(`${prefix}.positions.position${i}.Name`, pos.name),
        meaning: t(`${prefix}.positions.position${i}.meaning`, pos.meaning),
      })),
      suitableFor: spread.suitableFor.map((tag, i) =>
        t(`${prefix}.suitableFor.${i}`, tag)
      ),
    };
  });
}

/** 使用 i18next t() 函数获取翻译后的塔罗师列表 */
export function getReaders(t: TFunction): TarotReader[] {
  return rawReaders.map(reader => ({
    ...reader,
    name: t(`readers.${reader.id}.name`, reader.name),
    styleName: t(`readers.${reader.id}.styleName`, reader.styleName),
    description: t(`readers.${reader.id}.description`, reader.description),
  }));
}

/** 获取单个牌阵（翻译后） */
export function getSpreadById(id: string, t: TFunction): Spread | undefined {
  return getSpreads(t).find(s => s.id === id);
}

// 获取牌组名称
export function getSuitName(suit: string, lang?: string): string {
  const zhNames: Record<string, string> = {
    major: '大阿尔克那', wands: '权杖', cups: '圣杯', swords: '宝剑', coins: '星币',
  };
  const enNames: Record<string, string> = {
    major: 'Major Arcana', wands: 'Wands', cups: 'Cups', swords: 'Swords', coins: 'Pentacles',
  };
  if (lang && !lang.startsWith('zh')) return enNames[suit] || suit;
  return zhNames[suit] || suit;
}

// 获取元素名称
export function getElementName(element?: string, lang?: string): string {
  const zhNames: Record<string, string> = {
    '火': '🔥 火元素', '水': '💧 水元素', '风': '💨 风元素', '土': '🌍 土元素', '空气': '🌬️ 空气元素',
  };
  const enNames: Record<string, string> = {
    '火': '🔥 Fire', '水': '💧 Water', '风': '🌬️ Air', '土': '🌍 Earth', '空气': '🌬️ Air',
  };
  if (!element) return '';
  if (lang && !lang.startsWith('zh')) return enNames[element] || element;
  return zhNames[element] || element;
}

// 搜索牌
export function searchCards(query: string) {
  const q = query.toLowerCase();
  return allCards.filter(card =>
    card.name.includes(q) ||
    card.nameEn.toLowerCase().includes(q) ||
    card.keywords.upright.some(k => k.includes(q)) ||
    card.meanings.upright.includes(q)
  );
}
