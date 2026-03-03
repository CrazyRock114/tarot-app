import type { TarotCard, CardOrientation, DrawResult } from '../types';
import { allCards } from '../data/tarotData';

// 随机抽牌
export function drawRandomCards(count: number, allowReversed: boolean = true): DrawResult[] {
  const results: DrawResult[] = [];
  const usedIndices = new Set<number>();
  
  while (results.length < count) {
    const randomIndex = Math.floor(Math.random() * allCards.length);
    if (usedIndices.has(randomIndex)) continue;
    
    usedIndices.add(randomIndex);
    const card = allCards[randomIndex];
    const orientation: CardOrientation = allowReversed && Math.random() > 0.5 
      ? 'reversed' 
      : 'upright';
    
    results.push({
      card,
      position: results.length,
      orientation,
      timestamp: Date.now(),
    });
  }
  
  return results;
}

// 根据数字选牌 (1-78)
export function drawByNumber(number: number, allowReversed: boolean = true): DrawResult | null {
  if (number < 1 || number > 78) return null;
  
  const card = allCards[number - 1];
  const orientation: CardOrientation = allowReversed && Math.random() > 0.5 
    ? 'reversed' 
    : 'upright';
  
  return {
    card,
    position: 0,
    orientation,
    timestamp: Date.now(),
  };
}

// Yes/No 塔罗
export function drawYesNo(): { result: 'yes' | 'no' | 'maybe'; draw: DrawResult } {
  const draw = drawRandomCards(1)[0];
  const majorYes = [0, 1, 3, 6, 10, 17, 19, 21]; // 愚者、魔术师、皇后、恋人、命运之轮、星星、太阳、世界
  const majorNo = [4, 9, 13, 16, 18]; // 皇帝、隐者、死神、塔、月亮
  
  let result: 'yes' | 'no' | 'maybe' = 'maybe';
  
  if (draw.card.arcana === 'major') {
    if (majorYes.includes(draw.card.id)) result = 'yes';
    else if (majorNo.includes(draw.card.id)) result = 'no';
  } else {
    // 小阿尔克那根据正逆位
    result = draw.orientation === 'upright' ? 'yes' : 'no';
  }
  
  return { result, draw };
}

// 洗牌动画时间
export const SHUFFLE_DURATION = 1500;

// 抽牌动画时间
export const DRAW_ANIMATION_DURATION = 600;

// 获取牌义
export function getCardMeaning(card: TarotCard, orientation: CardOrientation): string {
  return orientation === 'upright' ? card.meanings.upright : card.meanings.reversed;
}

// 获取关键词
export function getCardKeywords(card: TarotCard, orientation: CardOrientation): string[] {
  return orientation === 'upright' ? card.keywords.upright : card.keywords.reversed;
}
