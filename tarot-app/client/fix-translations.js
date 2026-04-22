import { readFileSync, writeFileSync } from 'fs';

const localesDir = './src/i18n/locales';

// Fix zh-TW.json spreads structure
const zhTW = JSON.parse(readFileSync(`${localesDir}/zh-TW.json`, 'utf-8'));
if (zhTW.spreads && zhTW.spreads['spreads.single']) {
  const oldSpreads = zhTW.spreads;
  const newSpreads = {};
  for (const [key, value] of Object.entries(oldSpreads)) {
    const newKey = key.replace(/^spreads\./, '');
    newSpreads[newKey] = value;
  }
  zhTW.spreads = newSpreads;
  console.log('Fixed zh-TW.json spreads structure');
}

// Add gallery.seoTitle if missing
if (!zhTW.gallery?.seoTitle) {
  zhTW.gallery = zhTW.gallery || {};
  zhTW.gallery.seoTitle = '78張塔羅牌圖鑑';
  console.log('Added zh-TW gallery.seoTitle');
}

writeFileSync(`${localesDir}/zh-TW.json`, JSON.stringify(zhTW, null, 2) + '\n');

// Add missing share keys to all locale files
const shareKeys = {
  'zh-CN': {
    'share.shareTitle': 'AI塔罗解读',
    'share.questionLabel': '问题',
    'share.spreadLabel': '牌阵',
    'share.timeLabel': '时间',
    'share.cardsLabel': '牌面',
    'share.summaryLabel': '解读摘要',
    'share.noQuestion': '无特定问题'
  },
  'zh-TW': {
    'share.shareTitle': 'AI塔羅解讀',
    'share.questionLabel': '問題',
    'share.spreadLabel': '牌陣',
    'share.timeLabel': '時間',
    'share.cardsLabel': '牌面',
    'share.summaryLabel': '解讀摘要',
    'share.noQuestion': '無特定問題'
  },
  'en': {
    'share.shareTitle': 'AI Tarot Reading',
    'share.questionLabel': 'Question',
    'share.spreadLabel': 'Spread',
    'share.timeLabel': 'Time',
    'share.cardsLabel': 'Cards',
    'share.summaryLabel': 'Summary',
    'share.noQuestion': 'No specific question'
  },
  'ja': {
    'share.shareTitle': 'AIタロットリーディング',
    'share.questionLabel': '質問',
    'share.spreadLabel': 'スプレッド',
    'share.timeLabel': '時間',
    'share.cardsLabel': 'カード',
    'share.summaryLabel': '解読要約',
    'share.noQuestion': '特定の質問なし'
  },
  'ko': {
    'share.shareTitle': 'AI 타로 리딩',
    'share.questionLabel': '질문',
    'share.spreadLabel': '스프레드',
    'share.timeLabel': '시간',
    'share.cardsLabel': '카드',
    'share.summaryLabel': '리딩 요약',
    'share.noQuestion': '특정 질문 없음'
  }
};

for (const [lang, keys] of Object.entries(shareKeys)) {
  const data = JSON.parse(readFileSync(`${localesDir}/${lang}.json`, 'utf-8'));
  for (const [keyPath, value] of Object.entries(keys)) {
    const parts = keyPath.split('.');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    if (!current[parts[parts.length - 1]]) {
      current[parts[parts.length - 1]] = value;
      console.log(`Added ${keyPath} to ${lang}.json`);
    }
  }
  writeFileSync(`${localesDir}/${lang}.json`, JSON.stringify(data, null, 2) + '\n');
}

// Fix ko.json Chinese characters
const ko = JSON.parse(readFileSync(`${localesDir}/ko.json`, 'utf-8'));
// spreads.celtic-cross.positions.position3.meaning: "消散 중인 과거의 영향" -> "사라지는 과거의 영향"
if (ko.spreads?.['celtic-cross']?.positions?.position3?.meaning?.includes('消散')) {
  ko.spreads['celtic-cross'].positions.position3.meaning = '사라지는 과거의 영향';
  console.log('Fixed ko.json celtic-cross position3');
}
// spreads.career.positions.position2.meaning: "見칠 수 있는 기회" -> "보일 수 있는 기회"
if (ko.spreads?.['career']?.positions?.position2?.meaning?.includes('見')) {
  ko.spreads['career'].positions.position2.meaning = '보일 수 있는 기회';
  console.log('Fixed ko.json career position2');
}
// spreads.diamond.description: "万能型 이벤트 분석" -> "다용도 이벤트 분석"
if (ko.spreads?.['diamond']?.description?.includes('万能型')) {
  ko.spreads['diamond'].description = '다용도 이벤트 분석, 원인, 현재, 미래를 종합적으로 해석';
  console.log('Fixed ko.json diamond description');
}
// spreads.diamond.positions.position3.meaning: "发展方向과 결말" -> "발전 방향과 결말"
if (ko.spreads?.['diamond']?.positions?.position3?.meaning?.includes('发展方向')) {
  ko.spreads['diamond'].positions.position3.meaning = '사건의 발전 방향과 결말';
  console.log('Fixed ko.json diamond position3');
}
// shareImage.aiReading: "AI 타로 占術" -> "AI 타로 점술"
if (ko.shareImage?.aiReading?.includes('占術')) {
  ko.shareImage.aiReading = 'AI 타로 점술';
  console.log('Fixed ko.json shareImage.aiReading');
}
writeFileSync(`${localesDir}/ko.json`, JSON.stringify(ko, null, 2) + '\n');

// Fix cards.ko.json typo: 자급自足 -> 자급자족
const cardsKo = JSON.parse(readFileSync(`${localesDir}/cards.ko.json`, 'utf-8'));
if (cardsKo.cards?.minor?.coins_9?.keywords?.upright) {
  const arr = cardsKo.cards.minor.coins_9.keywords.upright;
  const idx = arr.indexOf('자급自足');
  if (idx >= 0) {
    arr[idx] = '자급자족';
    console.log('Fixed cards.ko.json coins_9 keywords');
  }
}
if (cardsKo.cards?.minor?.coins_9?.meanings?.upright?.includes('자급自足')) {
  cardsKo.cards.minor.coins_9.meanings.upright = cardsKo.cards.minor.coins_9.meanings.upright.replace(/자급自足/g, '자급자족');
  console.log('Fixed cards.ko.json coins_9 meanings');
}
writeFileSync(`${localesDir}/cards.ko.json`, JSON.stringify(cardsKo, null, 2) + '\n');

console.log('All translation fixes applied!');
