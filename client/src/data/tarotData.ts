import type { Spread, TarotReader } from '../types';
import { majorArcana } from './majorArcana';
import { minorArcana } from './minorArcana';

// 导出所有塔罗牌
export const allCards = [...majorArcana, ...minorArcana];

// 牌阵数据
export const spreads: Spread[] = [
  {
    id: 'single',
    name: '单张牌',
    nameEn: 'Single Card',
    description: '最简洁直接的占卜方式，适合快速获取指引',
    positions: [{ index: 0, name: '核心信息', meaning: '当前情况的核心指引或答案' }],
    cardCount: 1,
    suitableFor: ['快速指引', '日常建议', '简单问题'],
  },
  {
    id: 'three-card',
    name: '三张牌',
    nameEn: 'Three Card Spread',
    description: '经典的三张牌阵，探索过去、现在、未来',
    positions: [
      { index: 0, name: '过去', meaning: '影响当前情况的过去因素' },
      { index: 1, name: '现在', meaning: '当前的情况和挑战' },
      { index: 2, name: '未来', meaning: '可能的未来发展' },
    ],
    cardCount: 3,
    suitableFor: ['时间线', '关系发展', '项目进展'],
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    description: '最全面的经典牌阵，深入探索问题的各个层面',
    positions: [
      { index: 0, name: '当前状况', meaning: '你现在的情况' },
      { index: 1, name: '挑战', meaning: '阻碍或辅助你的力量' },
      { index: 2, name: '基础', meaning: '问题的基础和根源' },
      { index: 3, name: '过去', meaning: '正在消散的影响' },
      { index: 4, name: '未来', meaning: '即将到来的影响' },
      { index: 5, name: '自我', meaning: '你的态度和感受' },
      { index: 6, name: '环境', meaning: '外部影响和他人态度' },
      { index: 7, name: '希望/恐惧', meaning: '你的希望或恐惧' },
      { index: 8, name: '结果', meaning: '最终结果或建议' },
    ],
    cardCount: 10,
    suitableFor: ['复杂问题', '深度探索', '人生方向'],
  },
  {
    id: 'relationship',
    name: '关系牌阵',
    nameEn: 'Relationship Spread',
    description: '专门探索两人关系的动态和发展',
    positions: [
      { index: 0, name: '你的立场', meaning: '你在关系中的状态和感受' },
      { index: 1, name: '对方的立场', meaning: '对方在关系中的状态和感受' },
      { index: 2, name: '关系动态', meaning: '你们之间的能量流动' },
      { index: 3, name: '挑战', meaning: '关系面临的困难或障碍' },
      { index: 4, name: '潜力', meaning: '关系的可能发展方向' },
    ],
    cardCount: 5,
    suitableFor: ['爱情关系', '友情', '合作关系'],
  },
  {
    id: 'decision',
    name: '决策牌阵',
    nameEn: 'Decision Spread',
    description: '帮助你做出重要决定的牌阵',
    positions: [
      { index: 0, name: '现状', meaning: '当前情况的全面图景' },
      { index: 1, name: '选择A', meaning: '选择第一条路的结果' },
      { index: 2, name: '选择B', meaning: '选择第二条路的结果' },
      { index: 3, name: '建议', meaning: '帮助你决策的指引' },
    ],
    cardCount: 4,
    suitableFor: ['职业选择', '搬家决定', '重大决策'],
  },
];

// AI塔罗师
export const tarotReaders: TarotReader[] = [
  {
    id: 'intuitive',
    name: '星月',
    avatar: '/readers/intuitive.png',
    style: 'intuitive',
    styleName: '直觉系',
    description: '相信直觉和第一印象，解读充满灵感和诗意',
    prompt: '你是一位直觉型塔罗师。请用富有诗意和灵感的方式解读牌面，强调直觉感受和能量流动。语言温暖感性，善用比喻和意象。',
  },
  {
    id: 'logical',
    name: '墨尘',
    avatar: '/readers/logical.png',
    style: 'logical',
    styleName: '逻辑系',
    description: '理性分析牌面关系，提供清晰的行动建议',
    prompt: '你是一位逻辑型塔罗师。请用清晰理性的方式分析牌面，注重牌与牌之间的逻辑关系，给出具体可行的行动建议。语言简洁明了。',
  },
  {
    id: 'healing',
    name: '暖阳',
    avatar: '/readers/healing.png',
    style: 'healing',
    styleName: '治愈系',
    description: '温柔关怀，帮助你疗愈内心，找到平和',
    prompt: '你是一位治愈型塔罗师。请用温柔关怀的语气解读牌面，关注问卜者的情感需求和内心疗愈。给予安慰和鼓励，帮助找到内心的平静。',
  },
  {
    id: 'mystical',
    name: '夜羽',
    avatar: '/readers/mystical.png',
    style: 'mystical',
    styleName: '神秘系',
    description: '深入神秘学传统，揭示隐藏的深层含义',
    prompt: '你是一位神秘型塔罗师。请深入探索牌面的神秘学含义，结合占星、元素、卡巴拉等传统，揭示深层的灵性讯息。语言神秘深邃。',
  },
];

// 获取牌组名称
export function getSuitName(suit: string): string {
  const names: Record<string, string> = {
    major: '大阿尔克那',
    wands: '权杖',
    cups: '圣杯',
    swords: '宝剑',
    coins: '星币',
  };
  return names[suit] || suit;
}

// 获取元素名称
export function getElementName(element?: string): string {
  const names: Record<string, string> = {
    '火': '🔥 火元素',
    '水': '💧 水元素',
    '风': '💨 风元素',
    '土': '🌍 土元素',
  };
  return element ? (names[element] || element) : '';
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
