import type { TarotCard } from '../types';

// 小阿尔克那数据生成
export const minorArcana: TarotCard[] = [];

const suits = [
  { suit: 'wands' as const, name: '权杖', element: '火', keywords: '热情、行动、创造' },
  { suit: 'cups' as const, name: '圣杯', element: '水', keywords: '情感、关系、直觉' },
  { suit: 'swords' as const, name: '宝剑', element: '风', keywords: '思维、挑战、真理' },
  { suit: 'coins' as const, name: '星币', element: '土', keywords: '物质、安全、实际' },
];

const numbers = ['首牌', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const courts = [
  { name: '侍从', en: 'Page' },
  { name: '骑士', en: 'Knight' },
  { name: '王后', en: 'Queen' },
  { name: '国王', en: 'King' },
];

let id = 22;

// 生成数字牌 (1-10)
suits.forEach(({ suit, name, element, keywords }) => {
  const suitBaseMeanings: Record<string, Record<number, {up: string, rev: string}>> = {
    wands: {
      1: { up: '新的创意火花，灵感的涌现。开始新项目的好时机。', rev: '创意受阻，动力不足，需要重新点燃热情。' },
      2: { up: '规划未来，制定长远计划。你有远见和资源。', rev: '恐惧未知，犹豫不前，缺乏明确方向。' },
      3: { up: '扩展视野，领导力显现。你的努力开始展现成果。', rev: '遭遇阻碍，计划延迟，需要调整策略。' },
      4: { up: '庆祝成功，享受成果。和谐稳定的时期。', rev: '过度安逸，缺乏动力，或支持系统瓦解。' },
      5: { up: '面临竞争和冲突，需要勇气和决心。', rev: '避免冲突，寻求和解，或内耗严重。' },
      6: { up: '胜利和认可到来，自信提升。', rev: '自负导致失败，延迟的成功，或警告。' },
      7: { up: '防御姿态，坚持立场，展现勇气。', rev: '感到不知所措，想要放弃，精疲力竭。' },
      8: { up: '快速行动，事情加速发展，进展显著。', rev: '延迟和挫折，阻力重重，急躁无益。' },
      9: { up: '毅力和韧性，即将到达目的地。', rev: '精疲力竭，怀疑目标，需要休息。' },
      10: { up: '承担过多责任，但即将完成使命。', rev: '不堪重负，需要放手或委托他人。' },
    },
    cups: {
      1: { up: '新的情感开始，直觉觉醒。心灵打开。', rev: '情感阻塞，难以表达感受，内心空虚。' },
      2: { up: '深厚的情感连接，爱情的和谐。', rev: '关系失衡，沟通不畅，价值观分歧。' },
      3: { up: '与好友庆祝，友谊带来的喜悦。', rev: '孤立无援，过度放纵后的空虚。' },
      4: { up: '冥想和内省，评估现有状况。', rev: '无聊和不满，情感上的疏离感。' },
      5: { up: '经历失落和悲伤，哀悼过去。', rev: '走出阴霾，找到新的希望，接受现实。' },
      6: { up: '回忆美好时光，童年的纯真影响。', rev: '沉溺过去，无法向前，需要成熟。' },
      7: { up: '面临多种选择，幻想与现实的权衡。', rev: '幻觉破灭，做出决定，走出迷雾。' },
      8: { up: '放下过去，离开不再适合的状况。', rev: '恐惧改变，停滞不前，难以割舍。' },
      9: { up: '情感满足，愿望实现，内心幸福。', rev: '不满足，贪婪，表面的快乐。' },
      10: { up: '家庭和谐，情感圆满，幸福生活。', rev: '家庭冲突，情感不稳定，表面和谐。' },
    },
    swords: {
      1: { up: '清晰的洞见，突破性的想法。', rev: '思维混乱，言语伤害，想法极端。' },
      2: { up: '两难抉择，需要权衡和决定。', rev: '信息过载，无法决断，内心冲突。' },
      3: { up: '心碎和痛苦，但疗愈即将开始。', rev: '从痛苦中恢复，学会宽恕，走出悲伤。' },
      4: { up: '休息和恢复，暂时远离纷争。', rev: '无法放松，焦虑不安，停滞不前。' },
      5: { up: '冲突和失败，可能需要妥协。', rev: '愿意和解，放下骄傲，达成共识。' },
      6: { up: '渡过困难时期，疗愈和转变。', rev: '抗拒改变，困难持续，需要放手。' },
      7: { up: '需要策略，可能有隐藏动机。', rev: '诚实面对，坦白，摆脱欺骗。' },
      8: { up: '感到受限，思维被困住。', rev: '获得自由，摆脱束缚，重获控制。' },
      9: { up: '焦虑和担忧，失眠和恐惧。', rev: '恐惧消散，找到希望，噩梦结束。' },
      10: { up: '痛苦的结束，背叛和失落。', rev: '从谷底反弹，新的开始，希望重现。' },
    },
    coins: {
      1: { up: '新的财务机会，物质丰饶的开始。', rev: '错失机会，投资失误，贪婪。' },
      2: { up: '平衡收支，适应变化的能力。', rev: '财务失衡，过度消费，难以取舍。' },
      3: { up: '团队合作，技能提升，专业成长。', rev: '缺乏团队精神，技能平庸，自满。' },
      4: { up: '财务稳定，控制和安全需求。', rev: '贪婪吝啬，物质执念，过于保守。' },
      5: { up: '财务困难，感到匮乏和孤立。', rev: '困境结束，获得帮助，恢复希望。' },
      6: { up: '慷慨分享，给予和接受平衡。', rev: '自私吝啬，债务问题，不平等。' },
      7: { up: '耐心等待，长期投资的评估。', rev: '不耐烦，投资无回报，挫折感。' },
      8: { up: '专注技能，勤奋工作，专业提升。', rev: '缺乏专注，技能平庸，工作倦怠。' },
      9: { up: '财务独立，物质安全感，成功。', rev: '依赖他人，缺乏安全感，炫耀财富。' },
      10: { up: '财富和成就，家庭和遗产。', rev: '财务损失，家庭纷争，物质不稳定。' },
    },
  };

  for (let num = 1; num <= 10; num++) {
    const meaning = suitBaseMeanings[suit][num];
    minorArcana.push({
      id: id++,
      name: `${name}${numbers[num - 1]}`,
      nameEn: `${num} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      suit,
      arcana: 'minor',
      number: num,
      image: `/cards/${suit}-${num}.jpg`,
      keywords: {
        upright: [keywords.split('、')[0], '发展', num === 1 ? '开始' : '深化'],
        reversed: ['阻碍', '延迟', '调整'],
      },
      meanings: {
        upright: meaning.up,
        reversed: meaning.rev,
      },
      description: `${name}${numbers[num - 1]}代表${keywords}的${num === 1 ? '开始' : num === 10 ? '完成' : '发展阶段'}`,
      element,
    });
  }

  // 生成宫廷牌
  courts.forEach((court) => {
    const courtDescriptions: Record<string, string> = {
      '侍从': '新消息或学习的开始。代表探索、好奇和潜力的萌芽。',
      '骑士': '迅速的行动和冒险。充满动力但可能冲动。',
      '王后': '成熟的关怀和直觉。滋养、同理心和内在智慧。',
      '国王': '掌控和权威。成熟、稳定和领导力。',
    };
    const courtDesc = courtDescriptions[court.name];
    
    minorArcana.push({
      id: id++,
      name: `${name}${court.name}`,
      nameEn: `${court.en} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      suit,
      arcana: 'minor',
      image: `/cards/${suit}-${court.name.toLowerCase()}.jpg`,
      keywords: {
        upright: [court.name === '侍从' ? '消息' : court.name === '骑士' ? '行动' : court.name === '王后' ? '关怀' : '权威', keywords.split('、')[0]],
        reversed: ['不成熟', '过度', '扭曲'],
      },
      meanings: {
        upright: `${court.name}代表${courtDesc}`,
        reversed: `${court.name}能量的不成熟表现，或过度使用其特质导致的失衡。`,
      },
      description: courtDesc,
      element,
    });
  });
});

export default minorArcana;
