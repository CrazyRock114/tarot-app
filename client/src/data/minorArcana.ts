import type { TarotCard } from '../types';

// 小阿尔克那数据生成
export const minorArcana: TarotCard[] = [];

const suits = [
  { suit: 'wands' as const, name: '权杖', nameEn: 'Wands', element: '火', keywords: '热情、行动、创造', keywordsEn: 'Passion, Action, Creativity' },
  { suit: 'cups' as const, name: '圣杯', nameEn: 'Cups', element: '水', keywords: '情感、关系、直觉', keywordsEn: 'Emotions, Relationships, Intuition' },
  { suit: 'swords' as const, name: '宝剑', nameEn: 'Swords', element: '风', keywords: '思维、挑战、真理', keywordsEn: 'Thought, Challenge, Truth' },
  { suit: 'coins' as const, name: '星币', nameEn: 'Coins', element: '土', keywords: '物质、安全、实际', keywordsEn: 'Physicality, Security, Practicality' },
];

const numbers = ['首牌', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const numbersEn = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const courts = [
  { name: '侍从', en: 'Page' },
  { name: '骑士', en: 'Knight' },
  { name: '王后', en: 'Queen' },
  { name: '国王', en: 'King' },
];

let id = 22;

// 生成数字牌 (1-10)
suits.forEach(({ suit, name, nameEn, element, keywords, keywordsEn }) => {
  const suitBaseMeanings: Record<string, Record<number, {up: string, rev: string, upEn: string, revEn: string}>> = {
    wands: {
      1: { 
        up: '新的创意火花，灵感的涌现。开始新项目的好时机。', 
        rev: '创意受阻，动力不足，需要重新点燃热情。',
        upEn: 'A new spark of creativity, the emergence of inspiration. A good time to start new projects.',
        revEn: 'Creative block, lack of motivation, a need to reignite passion.'
      },
      2: { 
        up: '规划未来，制定长远计划。你有远见和资源。', 
        rev: '恐惧未知，犹豫不前，缺乏明确方向。',
        upEn: 'Planning for the future, making long-term plans. You have vision and resources.',
        revEn: 'Fear of the unknown, hesitation, lack of clear direction.'
      },
      3: { 
        up: '扩展视野，领导力显现。你的努力开始展现成果。', 
        rev: '遭遇阻碍，计划延迟，需要调整策略。',
        upEn: 'Expanding horizons, leadership emerging. Your efforts are beginning to show results.',
        revEn: 'Encountering obstacles, delayed plans, a need to adjust strategies.'
      },
      4: { 
        up: '庆祝成功，享受成果。和谐稳定的时期。', 
        rev: '过度安逸，缺乏动力，或支持系统瓦解。',
        upEn: 'Celebrating success, enjoying results. A period of harmony and stability.',
        revEn: 'Excessive comfort, lack of motivation, or a breakdown of support systems.'
      },
      5: { 
        up: '面临竞争和冲突，需要勇气和决心。', 
        rev: '避免冲突，寻求和解，或内耗严重。',
        upEn: 'Facing competition and conflict, requiring courage and determination.',
        revEn: 'Avoiding conflict, seeking reconciliation, or severe internal friction.'
      },
      6: { 
        up: '胜利和认可到来，自信提升。', 
        rev: '自负导致失败，延迟的成功，或警告。',
        upEn: 'Victory and recognition arrive, confidence is boosted.',
        revEn: 'Conceit leads to failure, delayed success, or a warning.'
      },
      7: { 
        up: '防御姿态，坚持立场，展现勇气。', 
        rev: '感到不知所措，想要放弃，精疲力竭。',
        upEn: 'Defensive stance, standing your ground, showing courage.',
        revEn: 'Feeling overwhelmed, wanting to give up, exhaustion.'
      },
      8: { 
        up: '快速行动，事情加速发展，进展显著。', 
        rev: '延迟和挫折，阻力重重，急躁无益。',
        upEn: 'Rapid action, things accelerating, significant progress.',
        revEn: 'Delays and setbacks, heavy resistance, haste is useless.'
      },
      9: { 
        up: '毅力和韧性，即将到达目的地。', 
        rev: '精疲力竭，怀疑目标，需要休息。',
        upEn: 'Perseverance and resilience, nearing your destination.',
        revEn: 'Exhaustion, doubting goals, a need for rest.'
      },
      10: { 
        up: '承担过多责任，但即将完成使命。', 
        rev: '不堪重负，需要放手或委托他人。',
        upEn: 'Taking on too much responsibility, but near the end of the mission.',
        revEn: 'Overwhelmed, a need to let go or delegate.'
      },
    },
    cups: {
      1: { 
        up: '新的情感开始，直觉觉醒。心灵打开。', 
        rev: '情感阻塞，难以表达感受，内心空虚。',
        upEn: 'A new emotional beginning, intuition awakening. The heart opens.',
        revEn: 'Emotional blockage, difficulty expressing feelings, inner emptiness.'
      },
      2: { 
        up: '深厚的情感连接，爱情的和谐。', 
        rev: '关系失衡，沟通不畅，价值观分歧。',
        upEn: 'Deep emotional connection, harmony in love.',
        revEn: 'Relationship imbalance, poor communication, conflict of values.'
      },
      3: { 
        up: '与好友庆祝，友谊带来的喜悦。', 
        rev: '孤立无援，过度放纵后的空虚。',
        upEn: 'Celebrating with friends, joy brought by friendship.',
        revEn: 'Isolated and helpless, emptiness after overindulgence.'
      },
      4: { 
        up: '冥想和内省，评估现有状况。', 
        rev: '无聊和不满，情感上的疏离感。',
        upEn: 'Meditation and introspection, assessing the current situation.',
        revEn: 'Boredom and dissatisfaction, emotional detachment.'
      },
      5: { 
        up: '经历失落和悲伤，哀悼过去。', 
        rev: '走出阴霾，找到新的希望，接受现实。',
        upEn: 'Experiencing loss and grief, mourning the past.',
        revEn: 'Moving out of the gloom, finding new hope, accepting reality.'
      },
      6: { 
        up: '回忆美好时光，童年的纯真影响。', 
        rev: '沉溺过去，无法向前，需要成熟。',
        upEn: 'Reminiscing about good times, the influence of childhood innocence.',
        revEn: 'Dwelling in the past, unable to move forward, needing maturity.'
      },
      7: { 
        up: '面临多种选择，幻想与现实的权衡。', 
        rev: '幻觉破灭，做出决定，走出迷雾。',
        upEn: 'Facing multiple choices, balancing fantasy and reality.',
        revEn: 'Illusions shattered, making a decision, walking out of the fog.'
      },
      8: { 
        up: '放下过去，离开不再适合的状况。', 
        rev: '恐惧改变，停滞不前，难以割舍。',
        upEn: 'Letting go of the past, leaving situations that no longer fit.',
        revEn: 'Fear of change, stagnation, difficulty in letting go.'
      },
      9: { 
        up: '情感满足，愿望实现，内心幸福。', 
        rev: '不满足，贪婪，表面的快乐。',
        upEn: 'Emotional fulfillment, wishes granted, inner happiness.',
        revEn: 'Dissatisfaction, greed, superficial joy.'
      },
      10: { 
        up: '家庭和谐，情感圆满，幸福生活。', 
        rev: '家庭冲突，情感不稳定，表面和谐。',
        upEn: 'Family harmony, emotional fulfillment, happy life.',
        revEn: 'Family conflict, emotional instability, surface harmony.'
      },
    },
    swords: {
      1: { 
        up: '清晰的洞见，突破性的想法。', 
        rev: '思维混乱，言语伤害，想法极端。',
        upEn: 'Clear insight, breakthrough ideas.',
        revEn: 'Mental confusion, hurtful words, extreme thoughts.'
      },
      2: { 
        up: '两难抉择，需要权衡和决定。', 
        rev: '信息过载，无法决断，内心冲突。',
        upEn: 'A difficult choice, needing balance and decision.',
        revEn: 'Information overload, inability to decide, inner conflict.'
      },
      3: { 
        up: '心碎和痛苦，但疗愈即将开始。', 
        rev: '从痛苦中恢复，学会宽恕，走出悲伤。',
        upEn: 'Heartbreak and pain, but healing is about to begin.',
        revEn: 'Recovering from pain, learning to forgive, moving out of grief.'
      },
      4: { 
        up: '休息和恢复，暂时远离纷争。', 
        rev: '无法放松，焦虑不安，停滞不前。',
        upEn: 'Rest and recovery, temporarily staying away from conflict.',
        revEn: 'Inability to relax, anxiety, stagnation.'
      },
      5: { 
        up: '冲突和失败，可能需要妥协。', 
        rev: '愿意和解，放下骄傲，达成共识。',
        upEn: 'Conflict and failure, compromise may be needed.',
        revEn: 'Willingness to reconcile, letting go of pride, reaching consensus.'
      },
      6: { 
        up: '渡过困难时期，疗愈和转变。', 
        rev: '抗拒改变，困难持续，需要放手。',
        upEn: 'Passing through difficult times, healing and transformation.',
        revEn: 'Resisting change, prolonged difficulty, a need to let go.'
      },
      7: { 
        up: '需要策略，可能有隐藏动机。', 
        rev: '诚实面对，坦白，摆脱欺骗。',
        upEn: 'Strategy needed, may have hidden motives.',
        revEn: 'Facing things honestly, coming clean, getting away from deception.'
      },
      8: { 
        up: '感到受限，思维被困住。', 
        rev: '获得自由，摆脱束缚，重获控制。',
        upEn: 'Feeling restricted, thoughts are trapped.',
        revEn: 'Gaining freedom, breaking the chains, regaining control.'
      },
      9: { 
        up: '焦虑和担忧，失眠和恐惧。', 
        rev: '恐惧消散，找到希望，噩梦结束。',
        upEn: 'Anxiety and worry, insomnia and fear.',
        revEn: 'Fear dissipating, finding hope, the nightmare ends.'
      },
      10: { 
        up: '痛苦的结束，背叛和失落。', 
        rev: '从谷底反弹，新的开始，希望重现。',
        upEn: 'A painful end, betrayal and loss.',
        revEn: 'Rebounding from the bottom, a new beginning, hope reappears.'
      },
    },
    coins: {
      1: { 
        up: '新的财务机会，物质丰饶的开始。', 
        rev: '错失机会，投资失误，贪婪。',
        upEn: 'A new financial opportunity, the beginning of material abundance.',
        revEn: 'Missed opportunities, investment errors, greed.'
      },
      2: { 
        up: '平衡收支，适应变化的能力。', 
        rev: '财务失衡，过度消费，难以取舍。',
        upEn: 'Balancing finances, ability to adapt to change.',
        revEn: 'Financial imbalance, overspending, difficulty in choosing.'
      },
      3: { 
        up: '团队合作，技能提升，专业成长。', 
        rev: '缺乏团队精神，技能平庸，自满。',
        upEn: 'Teamwork, skill enhancement, professional growth.',
        revEn: 'Lack of team spirit, mediocre skills, complacency.'
      },
      4: { 
        up: '财务稳定，控制和安全需求。', 
        rev: '贪婪吝啬，物质执念，过于保守。',
        upEn: 'Financial stability, need for control and security.',
        revEn: 'Greed and stinginess, material obsession, overly conservative.'
      },
      5: { 
        up: '财务困难，感到匮乏和孤立。', 
        rev: '困境结束，获得帮助，恢复希望。',
        upEn: 'Financial difficulty, feeling lack and isolated.',
        revEn: 'Hardship ending, receiving help, restoring hope.'
      },
      6: { 
        up: '慷慨分享，给予和接受平衡。', 
        rev: '自私吝啬，债务问题，不平等。',
        upEn: 'Generous sharing, balance of giving and receiving.',
        revEn: 'Selfishness and stinginess, debt issues, inequality.'
      },
      7: { 
        up: '耐心等待，长期投资的评估。', 
        rev: '不耐烦，投资无回报，挫折感。',
        upEn: 'Patient waiting, assessment of long-term investments.',
        revEn: 'Impatience, no return on investment, frustration.'
      },
      8: { 
        up: '专注技能，勤奋工作，专业提升。', 
        rev: '缺乏专注，技能平庸，工作倦怠。',
        upEn: 'Focus on skills, hard work, professional improvement.',
        revEn: 'Lack of focus, mediocre skills, burnout.'
      },
      9: { 
        up: '财务独立，物质安全感，成功。', 
        rev: '依赖他人，缺乏安全感，炫耀财富。',
        upEn: 'Financial independence, material security, success.',
        revEn: 'Dependence on others, lack of security, flaunting wealth.'
      },
      10: { 
        up: '财富和成就，家庭和遗产。', 
        rev: '财务损失，家庭纷争，物质不稳定。',
        upEn: 'Wealth and achievement, family and legacy.',
        revEn: 'Financial loss, family strife, material instability.'
      },
    },
  };

  for (let num = 1; num <= 10; num++) {
    const meaning = suitBaseMeanings[suit][num];
    minorArcana.push({
      id: id++,
      name: `${name}${numbers[num - 1]}`,
      nameEn: `${numbersEn[num - 1]} of ${nameEn}`,
      suit,
      arcana: 'minor',
      number: num,
      image: `/cards/${suit}-${String(num).padStart(2,'0')}.jpg`,
      keywords: {
        upright: [keywords.split('、')[0], '发展', num === 1 ? '开始' : '深化'],
        reversed: ['阻碍', '延迟', '调整'],
      },
      keywordsEn: {
        upright: [keywordsEn.split(', ')[0], 'Development', num === 1 ? 'Beginning' : 'Deepening'],
        reversed: ['Obstacle', 'Delay', 'Adjustment'],
      },
      meanings: {
        upright: meaning.up,
        reversed: meaning.rev,
      },
      meaningsEn: {
        upright: meaning.upEn,
        reversed: meaning.revEn,
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
    const courtDescriptionsEn: Record<string, string> = {
      '侍从': 'A beginning of new messages or learning. Represents exploration, curiosity, and the budding of potential.',
      '骑士': 'Swift action and adventure. Full of drive but potentially impulsive.',
      '王后': 'Mature care and intuition. Nurturing, empathy, and inner wisdom.',
      '国王': 'Control and authority. Maturity, stability, and leadership.',
    };
    const courtDesc = courtDescriptions[court.name];
    const courtDescEn = courtDescriptionsEn[court.name];
    
    minorArcana.push({
      id: id++,
      name: `${name}${court.name}`,
      nameEn: `${court.en} of ${nameEn}`,
      suit,
      arcana: 'minor',
      image: `/cards/${suit}-${({'侍从':'page','骑士':'knight','王后':'queen','国王':'king'})[court.name]}.jpg`,
      keywords: {
        upright: [court.name === '侍从' ? '消息' : court.name === '骑士' ? '行动' : court.name === '王后' ? '关怀' : '权威', keywords.split('、')[0]],
        reversed: ['不成熟', '过度', '扭曲'],
      },
      keywordsEn: {
        upright: [court.name === '侍从' ? 'Messages' : court.name === '骑士' ? 'Action' : court.name === '王后' ? 'Nurturing' : 'Authority', keywordsEn.split(', ')[0]],
        reversed: ['Immaturity', 'Excess', 'Distortion'],
      },
      meanings: {
        upright: `${court.name}代表${courtDesc}`,
        reversed: `${court.name}能量的不成熟表现，或过度使用其特质导致的失衡。`,
      },
      meaningsEn: {
        upright: `The ${court.en} represents ${courtDescEn.charAt(0).toLowerCase() + courtDescEn.slice(1)}`,
        reversed: `Immature expression of the ${court.en}'s energy, or an imbalance caused by overusing its traits.`,
      },
      description: courtDesc,
      element,
    });
  });
});

export default minorArcana;
