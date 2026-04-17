// 塔罗牌数据

import type { TarotCard, Spread } from '../types';

export const cards: TarotCard[] = [
  { id: 'fool', name: '愚人', nameEn: 'The Fool', arcana: 'major', number: 0, meaning: '新的开始，无限可能，自由奔放', meaningReversed: '鲁莽，缺乏计划，冒险过度' },
  { id: 'magician', name: '魔术师', nameEn: 'The Magician', arcana: 'major', number: 1, meaning: '创造力，意志力，显化能力', meaningReversed: '欺骗，缺乏自信，技能滥用' },
  { id: 'highpriestess', name: '女祭司', nameEn: 'The High Priestess', arcana: 'major', number: 2, meaning: '直觉，内在智慧，潜意识', meaningReversed: '秘密，隐藏的动机，忽视直觉' },
  { id: 'empress', name: '皇后', nameEn: 'The Empress', arcana: 'major', number: 3, meaning: '丰饶，创造力，母性关怀', meaningReversed: '依赖，创造力受阻，过度保护' },
  { id: 'emperor', name: '皇帝', nameEn: 'The Emperor', arcana: 'major', number: 4, meaning: '权威，稳定，结构，控制', meaningReversed: '专制，僵化，滥用权力' },
  { id: 'hierophant', name: '教皇', nameEn: 'The Hierophant', arcana: 'major', number: 5, meaning: '传统，信仰，精神指引', meaningReversed: '反叛，非传统，打破常规' },
  { id: 'lovers', name: '恋人', nameEn: 'The Lovers', arcana: 'major', number: 6, meaning: '爱情，选择，和谐关系', meaningReversed: '不和谐，错误选择，价值观冲突' },
  { id: 'chariot', name: '战车', nameEn: 'The Chariot', arcana: 'major', number: 7, meaning: '意志力，胜利，决心前进', meaningReversed: '失控，缺乏方向，意志力薄弱' },
  { id: 'strength', name: '力量', nameEn: 'Strength', arcana: 'major', number: 8, meaning: '内在力量，勇气，耐心', meaningReversed: '软弱，缺乏自信，冲动' },
  { id: 'hermit', name: '隐士', nameEn: 'The Hermit', arcana: 'major', number: 9, meaning: '内省，独处，寻求真理', meaningReversed: '孤独，隔离，拒绝建议' },
  { id: 'wheeloffortune', name: '命运之轮', nameEn: 'Wheel of Fortune', arcana: 'major', number: 10, meaning: '命运转折，变化周期，机遇', meaningReversed: '厄运，阻力，错过机会' },
  { id: 'justice', name: '正义', nameEn: 'Justice', arcana: 'major', number: 11, meaning: '公正，平衡，因果法则', meaningReversed: '不公，偏见，逃避责任' },
  { id: 'hangedman', name: '倒吊人', nameEn: 'The Hanged Man', arcana: 'major', number: 12, meaning: '牺牲，新视角，等待时机', meaningReversed: '固执，无谓牺牲，停滞' },
  { id: 'death', name: '死神', nameEn: 'Death', arcana: 'major', number: 13, meaning: '结束与转变，新生开始', meaningReversed: '抗拒改变，停滞，无法放手' },
  { id: 'temperance', name: '节制', nameEn: 'Temperance', arcana: 'major', number: 14, meaning: '平衡，调和，耐心', meaningReversed: '极端，失衡，过度放纵' },
  { id: 'devil', name: '恶魔', nameEn: 'The Devil', arcana: 'major', number: 15, meaning: '物质束缚，欲望，阴影面', meaningReversed: '释放，摆脱束缚，重获自由' },
  { id: 'tower', name: '高塔', nameEn: 'The Tower', arcana: 'major', number: 16, meaning: '突然改变，觉醒，打破幻象', meaningReversed: '避免灾难，延迟改变，恐惧' },
  { id: 'star', name: '星星', nameEn: 'The Star', arcana: 'major', number: 17, meaning: '希望，灵感，精神指引', meaningReversed: '绝望，失去信心，缺乏灵感' },
  { id: 'moon', name: '月亮', nameEn: 'The Moon', arcana: 'major', number: 18, meaning: '潜意识，幻觉，直觉', meaningReversed: '恐惧消散，真相大白，清晰' },
  { id: 'sun', name: '太阳', nameEn: 'The Sun', arcana: 'major', number: 19, meaning: '成功，喜悦，活力', meaningReversed: '暂时的阴霾，过度乐观，骄傲' },
  { id: 'judgement', name: '审判', nameEn: 'Judgement', arcana: 'major', number: 20, meaning: '觉醒，重生，内心呼唤', meaningReversed: '自我怀疑，拒绝觉醒，内疚' },
  { id: 'world', name: '世界', nameEn: 'The World', arcana: 'major', number: 21, meaning: '完成，圆满，成就', meaningReversed: '未完成，延迟，缺乏closure' },
];

export const spreads: Spread[] = [
  {
    id: 'single',
    name: '单张牌',
    nameEn: 'Single Card',
    description: '最简洁直接的占卜方式，适合快速获取指引',
    cardCount: 1,
    positions: [{ index: 0, name: '核心信息', meaning: '当前情况的核心指引或答案' }],
    suitableFor: ['快速指引', '日常建议', '简单问题']
  },
  {
    id: 'three-card',
    name: '三张牌',
    nameEn: 'Three Card Spread',
    description: '经典的三张牌阵，探索过去、现在、未来',
    cardCount: 3,
    positions: [
      { index: 0, name: '过去', meaning: '影响当前情况的过去因素' },
      { index: 1, name: '现在', meaning: '当前的情况和挑战' },
      { index: 2, name: '未来', meaning: '可能的未来发展' }
    ],
    suitableFor: ['时间线', '关系发展', '项目进展']
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    description: '最全面的经典牌阵，深入探索问题的各个层面',
    cardCount: 10,
    positions: [
      { index: 0, name: '当前状况', meaning: '你现在的情况' },
      { index: 1, name: '挑战', meaning: '阻碍或辅助你的力量' },
      { index: 2, name: '基础', meaning: '问题的基础和根源' },
      { index: 3, name: '过去', meaning: '正在消散的影响' },
      { index: 4, name: '未来', meaning: '即将到来的影响' },
      { index: 5, name: '自我', meaning: '你的态度和感受' },
      { index: 6, name: '环境', meaning: '外部影响和他人态度' },
      { index: 7, name: '希望/恐惧', meaning: '你的希望或恐惧' },
      { index: 8, name: '结果', meaning: '最终结果或建议' }
    ],
    suitableFor: ['复杂问题', '深度探索', '人生方向']
  }
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

export const BASE_URL = process.env.BASE_URL || 'https://2or.com';

// 抽奖奖品配置
export const LUCKY_DRAW_PRIZES = [
  { name: '5积分', min: 0, max: 0.25, points: 5, weight: 25 },
  { name: '10积分', min: 0.25, max: 0.45, points: 10, weight: 20 },
  { name: '20积分', min: 0.45, max: 0.60, points: 20, weight: 15 },
  { name: '谢谢参与', min: 0.60, max: 0.75, points: 0, weight: 15 },
  { name: '50积分', min: 0.75, max: 0.88, points: 50, weight: 13 },
  { name: '免费占卜券x1', min: 0.88, max: 0.95, points: 0, weight: 7 },
  { name: '100积分', min: 0.95, max: 1.0, points: 100, weight: 5 },
];

// 星座列表
export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// 星座日期映射
export function getZodiacSign(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'gemini';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'libra';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 'scorpio';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}
