# i18n Translation Test Report

Generated: 2026-04-16T05:30:49.043Z

## Summary

- Backend translation issues: 57
- Hardcoded Chinese strings: 410
- Missing translations: 0
- Dynamic key issues: 55

## Hardcoded Chinese Strings

| File | Line | Content |
|------|------|---------|
| ../client/src/components/LuckyWheel.tsx | 192 | '5积分': 0, '10积分': 1, '20积分': 2, |
| ../client/src/components/LuckyWheel.tsx | 193 | '50积分': 4, '100积分': 6, |
| ../client/src/components/LuckyWheel.tsx | 194 | '免费占卜券x1': 5, '谢谢参与': 3, |
| ../client/src/data/majorArcana.ts | 7 | name: '愚者', |
| ../client/src/data/majorArcana.ts | 13 | upright: ['新的开始', '冒险', '自由', '潜力'], |
| ../client/src/data/majorArcana.ts | 14 | reversed: ['鲁莽', '冒险', '天真', '缺乏计划'], |
| ../client/src/data/majorArcana.ts | 21 | upright: '代表新的开始、冒险精神和无限潜力。愚者正准备踏上未知的旅程，充满乐观和信任。这是 |
| ../client/src/data/majorArcana.ts | 22 | reversed: '警告不要过于鲁莽或天真。可能暗示缺乏计划、盲目的冒险，或需要更加脚踏实地。提醒 |
| ../client/src/data/majorArcana.ts | 28 | description: '一位旅行者站在悬崖边缘，背着小包，准备跃入未知。身旁的小狗陪伴着他，象征 |
| ../client/src/data/majorArcana.ts | 29 | element: '空气', |
| ../client/src/data/majorArcana.ts | 30 | planet: '天王星', |
| ../client/src/data/majorArcana.ts | 34 | name: '魔术师', |
| ../client/src/data/majorArcana.ts | 40 | upright: ['创造力', '意志力', '显化', '能力'], |
| ../client/src/data/majorArcana.ts | 41 | reversed: ['欺骗', '操纵', '缺乏信心', '浪费才能'], |
| ../client/src/data/majorArcana.ts | 48 | upright: '你拥有实现目标所需的所有资源和能力。现在是采取行动、将想法显化为现实的时刻。相信 |
| ../client/src/data/majorArcana.ts | 49 | reversed: '可能暗示自我怀疑或未能充分利用自己的才能。警惕欺骗或操纵行为，无论是来自他人还 |
| ../client/src/data/majorArcana.ts | 55 | description: '魔术师站在祭坛前，高举权杖指向天空，另一只手指向地面。桌上摆放着代表四种 |
| ../client/src/data/majorArcana.ts | 56 | element: '空气', |
| ../client/src/data/majorArcana.ts | 57 | planet: '水星', |
| ../client/src/data/majorArcana.ts | 61 | name: '女祭司', |
| ../client/src/data/majorArcana.ts | 67 | upright: ['直觉', '潜意识', '神秘', '内在智慧'], |
| ../client/src/data/majorArcana.ts | 68 | reversed: ['秘密', '被压抑的直觉', '表面化', '困惑'], |
| ../client/src/data/majorArcana.ts | 75 | upright: '倾听你内在的声音和直觉。女祭司邀请你深入潜意识，探索隐藏的真理。信任你的第六感。 |
| ../client/src/data/majorArcana.ts | 76 | reversed: '可能忽视了直觉的指引，过于依赖逻辑。或暗示隐藏的动机和秘密需要被揭露。', |
| ../client/src/data/majorArcana.ts | 82 | description: '女祭司端坐于两柱之间，手持卷轴，脚边是弯月。她连接着意识与潜意识的世界。 |
| ../client/src/data/majorArcana.ts | 83 | element: '水', |
| ../client/src/data/majorArcana.ts | 84 | planet: '月亮', |
| ../client/src/data/majorArcana.ts | 88 | name: '皇后', |
| ../client/src/data/majorArcana.ts | 94 | upright: ['丰饶', '母性', '创造力', '自然'], |
| ../client/src/data/majorArcana.ts | 95 | reversed: ['依赖', '不孕', '创造力受阻', '忽视自我'], |
| ../client/src/data/majorArcana.ts | 102 | upright: '象征丰盛、滋养和创造力的流动。关注你的感官享受，与大自然连接，允许自己接受美好。 |
| ../client/src/data/majorArcana.ts | 103 | reversed: '可能过度依赖他人或忽视自己的需求。创造力受阻，需要重新连接内在的女性能量。', |
| ../client/src/data/majorArcana.ts | 109 | description: '皇后安坐在丰收的麦田中，周围环绕着自然的美景。她代表着母性的滋养和丰饶。 |
| ../client/src/data/majorArcana.ts | 110 | element: '土', |
| ../client/src/data/majorArcana.ts | 111 | planet: '金星', |
| ../client/src/data/majorArcana.ts | 115 | name: '皇帝', |
| ../client/src/data/majorArcana.ts | 121 | upright: ['权威', '结构', '控制', '父性'], |
| ../client/src/data/majorArcana.ts | 122 | reversed: ['专制', '僵化', '缺乏纪律', '滥用权力'], |
| ../client/src/data/majorArcana.ts | 129 | upright: '建立秩序和结构，发挥领导力。皇帝代表稳定、纪律和实际的智慧。制定计划并坚定执行。 |
| ../client/src/data/majorArcana.ts | 130 | reversed: '警惕过度控制或僵化。可能暗示权威问题，或需要打破旧有的限制模式。', |
| ../client/src/data/majorArcana.ts | 136 | description: '皇帝端坐于石座之上，手持权杖 and 球体，身后是雄伟的山脉。他象征着世 |
| ../client/src/data/majorArcana.ts | 137 | element: '火', |
| ../client/src/data/majorArcana.ts | 138 | planet: '火星', |
| ../client/src/data/majorArcana.ts | 139 | zodiac: '白羊座', |
| ../client/src/data/majorArcana.ts | 143 | name: '教皇', |
| ../client/src/data/majorArcana.ts | 149 | upright: ['传统', '信仰', '教育', '指导'], |
| ../client/src/data/majorArcana.ts | 150 | reversed: ['反叛', '非传统', '个人信念', '打破规则'], |
| ../client/src/data/majorArcana.ts | 157 | upright: '寻求传统智慧和精神指导。可能暗示需要遵循既定的规则或向导师学习。尊重传统价值。' |
| ../client/src/data/majorArcana.ts | 158 | reversed: '质疑传统，寻找属于自己的道路。可能暗示打破规则或发展个人独特的信仰体系。', |
| ../client/src/data/majorArcana.ts | 164 | description: '教皇坐于两根柱子间，手持权杖，前方跪着两位信徒。他代表着传统和精神权威。 |
| ../client/src/data/majorArcana.ts | 165 | element: '土', |
| ../client/src/data/majorArcana.ts | 166 | zodiac: '金牛座', |
| ../client/src/data/majorArcana.ts | 170 | name: '恋人', |
| ../client/src/data/majorArcana.ts | 176 | upright: ['爱情', '选择', '和谐', '价值观'], |
| ../client/src/data/majorArcana.ts | 177 | reversed: ['不和谐', '困难选择', '价值观冲突', '分离'], |
| ../client/src/data/majorArcana.ts | 184 | upright: '关于爱情、关系和重要选择。恋人牌暗示需要做出符合内心价值观的决定，追求和谐与平衡 |
| ../client/src/data/majorArcana.ts | 185 | reversed: '关系中的不和谐或价值观冲突。可能面临艰难的选择，需要重新审视什么对你真正重要。 |
| ../client/src/data/majorArcana.ts | 191 | description: '亚当和夏娃在天使祝福下站立于伊甸园。象征着爱情、结合 and 神圣的选择 |
| ../client/src/data/majorArcana.ts | 192 | element: '空气', |
| ../client/src/data/majorArcana.ts | 193 | zodiac: '双子座', |
| ../client/src/data/majorArcana.ts | 197 | name: '战车', |
| ../client/src/data/majorArcana.ts | 203 | upright: ['意志力', '胜利', '决心', '控制'], |
| ../client/src/data/majorArcana.ts | 204 | reversed: ['失控', '挫折', '缺乏方向', '意志力薄弱'], |
| ../client/src/data/majorArcana.ts | 211 | upright: '通过坚定的意志力和决心取得胜利。控制对立的力量，朝着目标前进。相信你能克服任何障 |
| ../client/src/data/majorArcana.ts | 212 | reversed: '可能感到失控或缺乏方向。挫折提醒你重新评估策略，加强内在的决心。', |
| ../client/src/data/majorArcana.ts | 218 | description: '战士驾驭着由两只对立狮鹫拉的战车，没有缰绳却意志坚定。象征着意志力的胜利 |
| ../client/src/data/majorArcana.ts | 219 | element: '水', |
| ../client/src/data/majorArcana.ts | 220 | zodiac: '巨蟹座', |
| ../client/src/data/majorArcana.ts | 224 | name: '力量', |
| ../client/src/data/majorArcana.ts | 230 | upright: ['内在力量', '勇气', '耐心', '同情心'], |
| ../client/src/data/majorArcana.ts | 231 | reversed: ['软弱', '自我怀疑', '不耐烦', '压抑'], |
| ../client/src/data/majorArcana.ts | 238 | upright: '真正的力量来自内心的勇气和耐心，而非武力。以温柔和同情面对挑战，驯服你内在的野兽 |
| ../client/src/data/majorArcana.ts | 239 | reversed: '可能感到内在力量的缺乏或自我怀疑。需要学会管理情绪，避免压抑或爆发。', |
| ../client/src/data/majorArcana.ts | 245 | description: '女子温柔地合上狮子的嘴，用耐心和爱心驯服了野兽。象征着内在的力量 and |
| ../client/src/data/majorArcana.ts | 246 | element: '火', |
| ../client/src/data/majorArcana.ts | 247 | zodiac: '狮子座', |
| ../client/src/data/majorArcana.ts | 251 | name: '隐者', |
| ../client/src/data/majorArcana.ts | 257 | upright: ['内省', '独处', '指导', '寻求真理'], |
| ../client/src/data/majorArcana.ts | 258 | reversed: ['孤独', '迷失', '隔离', '拒绝建议'], |
| ../client/src/data/majorArcana.ts | 265 | upright: '需要独处和反思的时间。隐者引导你向内寻找答案，远离外界的喧嚣。智慧来自内在。', |
| ../client/src/data/majorArcana.ts | 266 | reversed: '可能过度孤独或拒绝他人的帮助。也可能暗示逃避面对真相，需要走出孤立。', |
| ../client/src/data/majorArcana.ts | 272 | description: '隐者手持明灯，独自站在山顶。象征着内省、寻求真理 and 精神的指引。' |
| ../client/src/data/majorArcana.ts | 273 | element: '土', |
| ../client/src/data/majorArcana.ts | 274 | zodiac: '处女座', |
| ../client/src/data/majorArcana.ts | 278 | name: '命运之轮', |
| ../client/src/data/majorArcana.ts | 284 | upright: ['变化', '周期', '命运', '转折点'], |
| ../client/src/data/majorArcana.ts | 285 | reversed: ['不幸', '抗拒变化', '坏运气', '停滞'], |
| ../client/src/data/majorArcana.ts | 292 | upright: '生命周期的变化和转折。命运之轮转动，带来好运和新的机会。顺应变化，把握时机。', |
| ../client/src/data/majorArcana.ts | 293 | reversed: '可能遭遇不顺或抗拒不可避免的变化。提醒你在逆境中保持希望，一切都会过去。', |
| ../client/src/data/majorArcana.ts | 299 | description: '巨大的轮盘转动，四角有神话生物。象征着命运的循环 and 生命的不断变化 |
| ../client/src/data/majorArcana.ts | 300 | element: '火', |
| ../client/src/data/majorArcana.ts | 301 | planet: '木星', |
| ../client/src/data/majorArcana.ts | 305 | name: '正义', |
| ../client/src/data/majorArcana.ts | 311 | upright: ['公正', '真理', '因果', '法律'], |
| ../client/src/data/majorArcana.ts | 312 | reversed: ['不公', '不诚实', '逃避责任', '偏见'], |
| ../client/src/data/majorArcana.ts | 319 | upright: '公正和平衡的时刻。面对真相，承担行为的后果。诚实和正直将带来公正的裁决。', |
| ../client/src/data/majorArcana.ts | 320 | reversed: '可能面临不公正的待遇或需要面对不诚实的行为。重新评估什么是真正公平的。', |
| ../client/src/data/majorArcana.ts | 326 | description: '正义女神手持天平和宝剑，蒙着眼睛。象征着公正、真理 and 因果法则。' |
| ../client/src/data/majorArcana.ts | 327 | element: '空气', |
| ../client/src/data/majorArcana.ts | 328 | zodiac: '天秤座', |
| ../client/src/data/majorArcana.ts | 332 | name: '倒吊人', |
| ../client/src/data/majorArcana.ts | 338 | upright: ['牺牲', '暂停', '新视角', '放手'], |
| ../client/src/data/majorArcana.ts | 339 | reversed: ['抵抗', '拖延', '无意义的牺牲', '停滞'], |
| ../client/src/data/majorArcana.ts | 346 | upright: '暂停和反思的时刻。通过不同的视角看待情况，可能需要暂时的牺牲来获得更大的领悟。' |
| ../client/src/data/majorArcana.ts | 347 | reversed: '可能抗拒必要的改变或执着于无意义的牺牲。学会在适当的时候放手。', |
| ../client/src/data/majorArcana.ts | 353 | description: '人倒吊在树上，姿态平静。象征着牺牲、新视角 and 自愿的暂停。', |
| ../client/src/data/majorArcana.ts | 354 | element: '水', |
| ../client/src/data/majorArcana.ts | 355 | planet: '海王星', |
| ../client/src/data/majorArcana.ts | 359 | name: '死神', |
| ../client/src/data/majorArcana.ts | 365 | upright: ['转变', '结束', '新的开始', '释放'], |
| ../client/src/data/majorArcana.ts | 366 | reversed: ['抗拒结束', '停滞', '恐惧改变', '无法放手'], |
| ../client/src/data/majorArcana.ts | 373 | upright: '重大的转变和结束，为新开始腾出空间。放下旧有的模式，拥抱必要的改变。死亡带来重生 |
| ../client/src/data/majorArcana.ts | 374 | reversed: '抗拒不可避免的结束，导致停滞。恐惧改变只会延长痛苦，学会接受和放手。', |
| ../client/src/data/majorArcana.ts | 380 | description: '骷髅骑士骑着白马，人们在他面前跪拜。象征着转变、结束 and 不可避免的 |
| ../client/src/data/majorArcana.ts | 381 | element: '水', |
| ../client/src/data/majorArcana.ts | 382 | zodiac: '天蝎座', |
| ../client/src/data/majorArcana.ts | 386 | name: '节制', |
| ../client/src/data/majorArcana.ts | 392 | upright: ['平衡', '调和', '耐心', '中庸'], |
| ../client/src/data/majorArcana.ts | 393 | reversed: ['极端', '失衡', '过度', '不耐烦'], |
| ../client/src/data/majorArcana.ts | 400 | upright: '寻求平衡和调和。节制提醒你在极端之间找到中间道路，耐心调和不同的元素。', |
| ../client/src/data/majorArcana.ts | 401 | reversed: '可能处于失衡状态或走向极端。需要重新找到生活的平衡点 and 中心。', |
| ../client/src/data/majorArcana.ts | 407 | description: '天使站在水边，将两个杯子之间的液体混合。象征着平衡、调和 and 炼金术 |
| ../client/src/data/majorArcana.ts | 408 | element: '火', |
| ../client/src/data/majorArcana.ts | 409 | zodiac: '射手座', |
| ../client/src/data/majorArcana.ts | 413 | name: '恶魔', |
| ../client/src/data/majorArcana.ts | 419 | upright: ['束缚', '物质主义', '诱惑', '阴影面'], |
| ../client/src/data/majorArcana.ts | 420 | reversed: ['释放', '突破限制', '重获自由', '觉醒'], |
| ../client/src/data/majorArcana.ts | 427 | upright: '面对你的阴影面和束缚。恶魔代表物质欲望和成瘾，提醒你不要成为欲望的奴隶。', |
| ../client/src/data/majorArcana.ts | 428 | reversed: '打破束缚，重获自由。意识到限制往往是自己加诸的，你有力量解放自己。', |
| ../client/src/data/majorArcana.ts | 434 | description: '恶魔俯视着被锁链束缚的男女，但锁链是松的。象征着束缚、诱惑 and 物质 |
| ../client/src/data/majorArcana.ts | 435 | element: '土', |
| ../client/src/data/majorArcana.ts | 436 | zodiac: '摩羯座', |
| ../client/src/data/majorArcana.ts | 440 | name: '塔', |
| ../client/src/data/majorArcana.ts | 446 | upright: ['突然改变', '觉醒', '崩塌', '启示'], |
| ../client/src/data/majorArcana.ts | 447 | reversed: ['避免灾难', '延迟改变', '个人转变', '内爆'], |
| ../client/src/data/majorArcana.ts | 454 | upright: '突然和剧烈的改变，旧有结构的崩塌。虽然痛苦，但这是必要的觉醒，为真理腾出空间。' |
| ../client/src/data/majorArcana.ts | 455 | reversed: '可能试图避免不可避免的改变，或在内部经历个人转变而非外在崩塌。', |
| ../client/src/data/majorArcana.ts | 461 | description: '高塔被闪电击中，人们从塔中坠落。象征着突然的改变、启示 and 旧有结构 |
| ../client/src/data/majorArcana.ts | 462 | element: '火', |
| ../client/src/data/majorArcana.ts | 463 | planet: '火星', |
| ../client/src/data/majorArcana.ts | 467 | name: '星星', |
| ../client/src/data/majorArcana.ts | 473 | upright: ['希望', '灵感', '宁静', '灵性连接'], |
| ../client/src/data/majorArcana.ts | 474 | reversed: ['绝望', '失去信心', '幻灭', '缺乏灵感'], |
| ../client/src/data/majorArcana.ts | 481 | upright: '希望和灵感的灯塔。星星带来宁静和信心，相信宇宙在指引你。灵性连接和治愈的时刻。' |
| ../client/src/data/majorArcana.ts | 482 | reversed: '可能感到绝望或失去信心。暂时的幻灭提醒你重新连接内在的光芒 and 信任。', |
| ../client/src/data/majorArcana.ts | 488 | description: '女子在星空下将水倒入池塘和大地。象征着希望、灵感 and 宇宙的联系。' |
| ../client/src/data/majorArcana.ts | 489 | element: '空气', |
| ../client/src/data/majorArcana.ts | 490 | zodiac: '水瓶座', |
| ../client/src/data/majorArcana.ts | 494 | name: '月亮', |
| ../client/src/data/majorArcana.ts | 500 | upright: ['幻觉', '恐惧', '潜意识', '直觉'], |
| ../client/src/data/majorArcana.ts | 501 | reversed: ['混乱消散', '面对恐惧', '秘密揭露', '清晰度'], |
| ../client/src/data/majorArcana.ts | 508 | upright: '潜意识的世界和隐藏的真相。月亮揭示恐惧和幻觉，但也带来深刻的直觉。信任你的感觉。 |
| ../client/src/data/majorArcana.ts | 509 | reversed: '秘密被揭露，幻觉消散。面对恐惧将带来清晰的认识。', |
| ../client/src/data/majorArcana.ts | 515 | description: '满月高挂，下方有狗和狼在嚎叫，小龙虾从水中爬出。象征着潜意识、幻觉 an |
| ../client/src/data/majorArcana.ts | 516 | element: '水', |
| ../client/src/data/majorArcana.ts | 517 | zodiac: '双鱼座', |
| ../client/src/data/majorArcana.ts | 521 | name: '太阳', |
| ../client/src/data/majorArcana.ts | 527 | upright: ['喜悦', '成功', '活力', '意识'], |
| ../client/src/data/majorArcana.ts | 528 | reversed: ['暂时的抑郁', '自负', '延迟的成功', '缺乏清晰度'], |
| ../client/src/data/majorArcana.ts | 535 | upright: '光明、喜悦和成功的时刻。太阳带来活力和积极的能量，一切清晰明朗。享受生命的礼物。 |
| ../client/src/data/majorArcana.ts | 536 | reversed: '可能经历暂时的阴霾或自负导致的盲点。成功只是延迟，保持信心。', |
| ../client/src/data/majorArcana.ts | 542 | description: '快乐的孩童骑在白马上，太阳高挂天空。象征着喜悦、成功 and 生命的活力 |
| ../client/src/data/majorArcana.ts | 543 | element: '火', |
| ../client/src/data/majorArcana.ts | 544 | planet: '太阳', |
| ../client/src/data/majorArcana.ts | 548 | name: '审判', |
| ../client/src/data/majorArcana.ts | 554 | upright: ['觉醒', '重生', '内在呼唤', '宽恕'], |
| ../client/src/data/majorArcana.ts | 555 | reversed: ['自我怀疑', '拒绝呼唤', '缺乏自我检视', '无法宽恕'], |
| ../client/src/data/majorArcana.ts | 562 | upright: '内在的觉醒和重生的时刻。回应灵魂的呼唤，宽恕自己和他人，迎接新的开始。', |
| ../client/src/data/majorArcana.ts | 563 | reversed: '可能抗拒内在的呼唤或深陷自我怀疑。需要自我检视和宽恕才能前进。', |
| ../client/src/data/majorArcana.ts | 569 | description: '天使吹奏号角，人们从坟墓中升起。象征着审判、觉醒 and 重生。', |
| ../client/src/data/majorArcana.ts | 570 | element: '火', |
| ../client/src/data/majorArcana.ts | 571 | planet: '冥王星', |
| ../client/src/data/majorArcana.ts | 575 | name: '世界', |
| ../client/src/data/majorArcana.ts | 581 | upright: ['完成', '整合', '成就', '整体性'], |
| ../client/src/data/majorArcana.ts | 582 | reversed: ['未完成的业务', '缺乏结束', '空虚', '延迟的成就'], |
| ../client/src/data/majorArcana.ts | 589 | upright: '一个周期的完成和成就。世界象征整合和整体性，你已达到一个重要的里程碑。庆祝你的成 |
| ../client/src/data/majorArcana.ts | 590 | reversed: '可能还有未完成的业务或难以放手。需要找到真正的结束才能开始新的周期。', |
| ../client/src/data/majorArcana.ts | 596 | description: '舞者在花环中，四角有神话生物。象征着完成、成就 and 宇宙的统一。', |
| ../client/src/data/majorArcana.ts | 597 | element: '土', |
| ../client/src/data/majorArcana.ts | 598 | planet: '土星', |
| ../client/src/data/minorArcana.ts | 7 | { suit: 'wands' as const, name: '权杖', nameEn: 'Wan |
| ../client/src/data/minorArcana.ts | 8 | { suit: 'cups' as const, name: '圣杯', nameEn: 'Cups |
| ../client/src/data/minorArcana.ts | 9 | { suit: 'swords' as const, name: '宝剑', nameEn: 'Sw |
| ../client/src/data/minorArcana.ts | 10 | { suit: 'coins' as const, name: '星币', nameEn: 'Coi |
| ../client/src/data/minorArcana.ts | 13 | const numbers = ['首牌', '二', '三', '四', '五', '六', '七 |
| ../client/src/data/minorArcana.ts | 16 | { name: '侍从', en: 'Page' }, |
| ../client/src/data/minorArcana.ts | 17 | { name: '骑士', en: 'Knight' }, |
| ../client/src/data/minorArcana.ts | 18 | { name: '王后', en: 'Queen' }, |
| ../client/src/data/minorArcana.ts | 19 | { name: '国王', en: 'King' }, |
| ../client/src/data/minorArcana.ts | 29 | up: '新的创意火花，灵感的涌现。开始新项目的好时机。', |
| ../client/src/data/minorArcana.ts | 30 | rev: '创意受阻，动力不足，需要重新点燃热情。', |
| ../client/src/data/minorArcana.ts | 35 | up: '规划未来，制定长远计划。你有远见和资源。', |
| ../client/src/data/minorArcana.ts | 36 | rev: '恐惧未知，犹豫不前，缺乏明确方向。', |
| ../client/src/data/minorArcana.ts | 41 | up: '扩展视野，领导力显现。你的努力开始展现成果。', |
| ../client/src/data/minorArcana.ts | 42 | rev: '遭遇阻碍，计划延迟，需要调整策略。', |
| ../client/src/data/minorArcana.ts | 47 | up: '庆祝成功，享受成果。和谐稳定的时期。', |
| ../client/src/data/minorArcana.ts | 48 | rev: '过度安逸，缺乏动力，或支持系统瓦解。', |
| ../client/src/data/minorArcana.ts | 53 | up: '面临竞争和冲突，需要勇气和决心。', |
| ../client/src/data/minorArcana.ts | 54 | rev: '避免冲突，寻求和解，或内耗严重。', |
| ../client/src/data/minorArcana.ts | 59 | up: '胜利和认可到来，自信提升。', |
| ../client/src/data/minorArcana.ts | 60 | rev: '自负导致失败，延迟的成功，或警告。', |
| ../client/src/data/minorArcana.ts | 65 | up: '防御姿态，坚持立场，展现勇气。', |
| ../client/src/data/minorArcana.ts | 66 | rev: '感到不知所措，想要放弃，精疲力竭。', |
| ../client/src/data/minorArcana.ts | 71 | up: '快速行动，事情加速发展，进展显著。', |
| ../client/src/data/minorArcana.ts | 72 | rev: '延迟和挫折，阻力重重，急躁无益。', |
| ../client/src/data/minorArcana.ts | 77 | up: '毅力和韧性，即将到达目的地。', |
| ../client/src/data/minorArcana.ts | 78 | rev: '精疲力竭，怀疑目标，需要休息。', |
| ../client/src/data/minorArcana.ts | 83 | up: '承担过多责任，但即将完成使命。', |
| ../client/src/data/minorArcana.ts | 84 | rev: '不堪重负，需要放手或委托他人。', |
| ../client/src/data/minorArcana.ts | 91 | up: '新的情感开始，直觉觉醒。心灵打开。', |
| ../client/src/data/minorArcana.ts | 92 | rev: '情感阻塞，难以表达感受，内心空虚。', |
| ../client/src/data/minorArcana.ts | 97 | up: '深厚的情感连接，爱情的和谐。', |
| ../client/src/data/minorArcana.ts | 98 | rev: '关系失衡，沟通不畅，价值观分歧。', |
| ../client/src/data/minorArcana.ts | 103 | up: '与好友庆祝，友谊带来的喜悦。', |
| ../client/src/data/minorArcana.ts | 104 | rev: '孤立无援，过度放纵后的空虚。', |
| ../client/src/data/minorArcana.ts | 109 | up: '冥想和内省，评估现有状况。', |
| ../client/src/data/minorArcana.ts | 110 | rev: '无聊和不满，情感上的疏离感。', |
| ../client/src/data/minorArcana.ts | 115 | up: '经历失落和悲伤，哀悼过去。', |
| ../client/src/data/minorArcana.ts | 116 | rev: '走出阴霾，找到新的希望，接受现实。', |
| ../client/src/data/minorArcana.ts | 121 | up: '回忆美好时光，童年的纯真影响。', |
| ../client/src/data/minorArcana.ts | 122 | rev: '沉溺过去，无法向前，需要成熟。', |
| ../client/src/data/minorArcana.ts | 127 | up: '面临多种选择，幻想与现实的权衡。', |
| ../client/src/data/minorArcana.ts | 128 | rev: '幻觉破灭，做出决定，走出迷雾。', |
| ../client/src/data/minorArcana.ts | 133 | up: '放下过去，离开不再适合的状况。', |
| ../client/src/data/minorArcana.ts | 134 | rev: '恐惧改变，停滞不前，难以割舍。', |
| ../client/src/data/minorArcana.ts | 139 | up: '情感满足，愿望实现，内心幸福。', |
| ../client/src/data/minorArcana.ts | 140 | rev: '不满足，贪婪，表面的快乐。', |
| ../client/src/data/minorArcana.ts | 145 | up: '家庭和谐，情感圆满，幸福生活。', |
| ../client/src/data/minorArcana.ts | 146 | rev: '家庭冲突，情感不稳定，表面和谐。', |
| ../client/src/data/minorArcana.ts | 153 | up: '清晰的洞见，突破性的想法。', |
| ../client/src/data/minorArcana.ts | 154 | rev: '思维混乱，言语伤害，想法极端。', |
| ../client/src/data/minorArcana.ts | 159 | up: '两难抉择，需要权衡和决定。', |
| ../client/src/data/minorArcana.ts | 160 | rev: '信息过载，无法决断，内心冲突。', |
| ../client/src/data/minorArcana.ts | 165 | up: '心碎和痛苦，但疗愈即将开始。', |
| ../client/src/data/minorArcana.ts | 166 | rev: '从痛苦中恢复，学会宽恕，走出悲伤。', |
| ../client/src/data/minorArcana.ts | 171 | up: '休息和恢复，暂时远离纷争。', |
| ../client/src/data/minorArcana.ts | 172 | rev: '无法放松，焦虑不安，停滞不前。', |
| ../client/src/data/minorArcana.ts | 177 | up: '冲突和失败，可能需要妥协。', |
| ../client/src/data/minorArcana.ts | 178 | rev: '愿意和解，放下骄傲，达成共识。', |
| ../client/src/data/minorArcana.ts | 183 | up: '渡过困难时期，疗愈和转变。', |
| ../client/src/data/minorArcana.ts | 184 | rev: '抗拒改变，困难持续，需要放手。', |
| ../client/src/data/minorArcana.ts | 189 | up: '需要策略，可能有隐藏动机。', |
| ../client/src/data/minorArcana.ts | 190 | rev: '诚实面对，坦白，摆脱欺骗。', |
| ../client/src/data/minorArcana.ts | 195 | up: '感到受限，思维被困住。', |
| ../client/src/data/minorArcana.ts | 196 | rev: '获得自由，摆脱束缚，重获控制。', |
| ../client/src/data/minorArcana.ts | 201 | up: '焦虑和担忧，失眠和恐惧。', |
| ../client/src/data/minorArcana.ts | 202 | rev: '恐惧消散，找到希望，噩梦结束。', |
| ../client/src/data/minorArcana.ts | 207 | up: '痛苦的结束，背叛和失落。', |
| ../client/src/data/minorArcana.ts | 208 | rev: '从谷底反弹，新的开始，希望重现。', |
| ../client/src/data/minorArcana.ts | 215 | up: '新的财务机会，物质丰饶的开始。', |
| ../client/src/data/minorArcana.ts | 216 | rev: '错失机会，投资失误，贪婪。', |
| ../client/src/data/minorArcana.ts | 221 | up: '平衡收支，适应变化的能力。', |
| ../client/src/data/minorArcana.ts | 222 | rev: '财务失衡，过度消费，难以取舍。', |
| ../client/src/data/minorArcana.ts | 227 | up: '团队合作，技能提升，专业成长。', |
| ../client/src/data/minorArcana.ts | 228 | rev: '缺乏团队精神，技能平庸，自满。', |
| ../client/src/data/minorArcana.ts | 233 | up: '财务稳定，控制和安全需求。', |
| ../client/src/data/minorArcana.ts | 234 | rev: '贪婪吝啬，物质执念，过于保守。', |
| ../client/src/data/minorArcana.ts | 239 | up: '财务困难，感到匮乏和孤立。', |
| ../client/src/data/minorArcana.ts | 240 | rev: '困境结束，获得帮助，恢复希望。', |
| ../client/src/data/minorArcana.ts | 245 | up: '慷慨分享，给予和接受平衡。', |
| ../client/src/data/minorArcana.ts | 246 | rev: '自私吝啬，债务问题，不平等。', |
| ../client/src/data/minorArcana.ts | 251 | up: '耐心等待，长期投资的评估。', |
| ../client/src/data/minorArcana.ts | 252 | rev: '不耐烦，投资无回报，挫折感。', |
| ../client/src/data/minorArcana.ts | 257 | up: '专注技能，勤奋工作，专业提升。', |
| ../client/src/data/minorArcana.ts | 258 | rev: '缺乏专注，技能平庸，工作倦怠。', |
| ../client/src/data/minorArcana.ts | 263 | up: '财务独立，物质安全感，成功。', |
| ../client/src/data/minorArcana.ts | 264 | rev: '依赖他人，缺乏安全感，炫耀财富。', |
| ../client/src/data/minorArcana.ts | 269 | up: '财富和成就，家庭和遗产。', |
| ../client/src/data/minorArcana.ts | 270 | rev: '财务损失，家庭纷争，物质不稳定。', |
| ../client/src/data/minorArcana.ts | 289 | reversed: ['阻碍', '延迟', '调整'], |
| ../client/src/data/minorArcana.ts | 303 | description: `${name}${numbers[num - 1]}代表${keywor |
| ../client/src/data/minorArcana.ts | 311 | '侍从': '新消息或学习的开始。代表探索、好奇和潜力的萌芽。', |
| ../client/src/data/minorArcana.ts | 312 | '骑士': '迅速的行动和冒险。充满动力但可能冲动。', |
| ../client/src/data/minorArcana.ts | 313 | '王后': '成熟的关怀和直觉。滋养、同理心和内在智慧。', |
| ../client/src/data/minorArcana.ts | 314 | '国王': '掌控和权威。成熟、稳定和领导力。', |
| ../client/src/data/minorArcana.ts | 317 | '侍从': 'A beginning of new messages or learning. Re |
| ../client/src/data/minorArcana.ts | 318 | '骑士': 'Swift action and adventure. Full of drive b |
| ../client/src/data/minorArcana.ts | 319 | '王后': 'Mature care and intuition. Nurturing, empat |
| ../client/src/data/minorArcana.ts | 320 | '国王': 'Control and authority. Maturity, stability, |
| ../client/src/data/minorArcana.ts | 331 | image: `/cards/${suit}-${({'侍从':'page','骑士':'knigh |
| ../client/src/data/minorArcana.ts | 334 | reversed: ['不成熟', '过度', '扭曲'], |
| ../client/src/data/minorArcana.ts | 341 | upright: `${court.name}代表${courtDesc}`, |
| ../client/src/data/minorArcana.ts | 342 | reversed: `${court.name}能量的不成熟表现，或过度使用其特质导致的失衡。`, |
| ../client/src/data/tarotData.ts | 13 | name: '单张牌', |
| ../client/src/data/tarotData.ts | 15 | description: '最简洁直接的占卜方式，适合快速获取指引', |
| ../client/src/data/tarotData.ts | 16 | positions: [{ index: 0, name: '核心信息', meaning: '当前 |
| ../client/src/data/tarotData.ts | 18 | suitableFor: ['快速指引', '日常建议', '简单问题'], |
| ../client/src/data/tarotData.ts | 22 | name: '三张牌', |
| ../client/src/data/tarotData.ts | 24 | description: '经典的三张牌阵，探索过去、现在、未来', |
| ../client/src/data/tarotData.ts | 26 | { index: 0, name: '过去', meaning: '影响当前情况的过去因素' }, |
| ../client/src/data/tarotData.ts | 27 | { index: 1, name: '现在', meaning: '当前的情况和挑战' }, |
| ../client/src/data/tarotData.ts | 28 | { index: 2, name: '未来', meaning: '可能的未来发展' }, |
| ../client/src/data/tarotData.ts | 31 | suitableFor: ['时间线', '关系发展', '项目进展'], |
| ../client/src/data/tarotData.ts | 35 | name: '凯尔特十字', |
| ../client/src/data/tarotData.ts | 37 | description: '最全面的经典牌阵，深入探索问题的各个层面', |
| ../client/src/data/tarotData.ts | 39 | { index: 0, name: '当前状况', meaning: '你现在的情况' }, |
| ../client/src/data/tarotData.ts | 40 | { index: 1, name: '挑战', meaning: '阻碍或辅助你的力量' }, |
| ../client/src/data/tarotData.ts | 41 | { index: 2, name: '基础', meaning: '问题的基础和根源' }, |
| ../client/src/data/tarotData.ts | 42 | { index: 3, name: '过去', meaning: '正在消散的影响' }, |
| ../client/src/data/tarotData.ts | 43 | { index: 4, name: '未来', meaning: '即将到来的影响' }, |
| ../client/src/data/tarotData.ts | 44 | { index: 5, name: '自我', meaning: '你的态度和感受' }, |
| ../client/src/data/tarotData.ts | 45 | { index: 6, name: '环境', meaning: '外部影响和他人态度' }, |
| ../client/src/data/tarotData.ts | 46 | { index: 7, name: '希望/恐惧', meaning: '你的希望或恐惧' }, |
| ../client/src/data/tarotData.ts | 47 | { index: 8, name: '结果', meaning: '最终结果或建议' }, |
| ../client/src/data/tarotData.ts | 50 | suitableFor: ['复杂问题', '深度探索', '人生方向'], |
| ../client/src/data/tarotData.ts | 54 | name: '关系牌阵', |
| ../client/src/data/tarotData.ts | 56 | description: '专门探索两人关系的动态和发展', |
| ../client/src/data/tarotData.ts | 58 | { index: 0, name: '你的立场', meaning: '你在关系中的状态和感受' } |
| ../client/src/data/tarotData.ts | 59 | { index: 1, name: '对方的立场', meaning: '对方在关系中的状态和感受' |
| ../client/src/data/tarotData.ts | 60 | { index: 2, name: '关系动态', meaning: '你们之间的能量流动' }, |
| ../client/src/data/tarotData.ts | 61 | { index: 3, name: '挑战', meaning: '关系面临的困难或障碍' }, |
| ../client/src/data/tarotData.ts | 62 | { index: 4, name: '潜力', meaning: '关系的可能发展方向' }, |
| ../client/src/data/tarotData.ts | 65 | suitableFor: ['爱情关系', '友情', '合作关系'], |
| ../client/src/data/tarotData.ts | 69 | name: '决策牌阵', |
| ../client/src/data/tarotData.ts | 71 | description: '帮助你做出重要决定的牌阵', |
| ../client/src/data/tarotData.ts | 73 | { index: 0, name: '现状', meaning: '当前情况的全面图景' }, |
| ../client/src/data/tarotData.ts | 74 | { index: 1, name: '选择A', meaning: '选择第一条路的结果' }, |
| ../client/src/data/tarotData.ts | 75 | { index: 2, name: '选择B', meaning: '选择第二条路的结果' }, |
| ../client/src/data/tarotData.ts | 76 | { index: 3, name: '建议', meaning: '帮助你决策的指引' }, |
| ../client/src/data/tarotData.ts | 79 | suitableFor: ['职业选择', '搬家决定', '重大决策'], |
| ../client/src/data/tarotData.ts | 83 | name: '问题解决', |
| ../client/src/data/tarotData.ts | 85 | description: '分析问题的起因、现状和解决方法', |
| ../client/src/data/tarotData.ts | 87 | { index: 0, name: '问题起因', meaning: '导致当前问题的根本原因' } |
| ../client/src/data/tarotData.ts | 88 | { index: 1, name: '当前状态', meaning: '问题现在的发展阶段' }, |
| ../client/src/data/tarotData.ts | 89 | { index: 2, name: '解决方法', meaning: '建议的应对策略和行动方向'  |
| ../client/src/data/tarotData.ts | 92 | suitableFor: ['困境分析', '寻找方法', '突破瓶颈'], |
| ../client/src/data/tarotData.ts | 96 | name: '事业牌阵', |
| ../client/src/data/tarotData.ts | 98 | description: '专注探索事业发展、职场挑战和机遇', |
| ../client/src/data/tarotData.ts | 100 | { index: 0, name: '当前职业状态', meaning: '你目前的事业处境和能量' |
| ../client/src/data/tarotData.ts | 101 | { index: 1, name: '阻碍因素', meaning: '阻碍事业发展的因素' }, |
| ../client/src/data/tarotData.ts | 102 | { index: 2, name: '隐藏机遇', meaning: '你可能忽略的机会' }, |
| ../client/src/data/tarotData.ts | 103 | { index: 3, name: '行动建议', meaning: '推动事业发展的具体行动' } |
| ../client/src/data/tarotData.ts | 104 | { index: 4, name: '未来展望', meaning: '事业发展的趋势和潜力' }, |
| ../client/src/data/tarotData.ts | 107 | suitableFor: ['职业发展', '跳槽决策', '创业方向'], |
| ../client/src/data/tarotData.ts | 111 | name: '钻石牌阵', |
| ../client/src/data/tarotData.ts | 113 | description: '万能型事件分析，全面解读起因、现状与未来', |
| ../client/src/data/tarotData.ts | 115 | { index: 0, name: '事情起因', meaning: '事件发生的根源和背景' }, |
| ../client/src/data/tarotData.ts | 116 | { index: 1, name: '当前状况', meaning: '事件目前的发展状态' }, |
| ../client/src/data/tarotData.ts | 117 | { index: 2, name: '隐藏影响', meaning: '看不见但影响结果的因素' } |
| ../client/src/data/tarotData.ts | 118 | { index: 3, name: '最终结果', meaning: '事件的发展方向和结局' }, |
| ../client/src/data/tarotData.ts | 121 | suitableFor: ['单一事件', '预测未来', '全面分析'], |
| ../client/src/data/tarotData.ts | 129 | name: '星月', |
| ../client/src/data/tarotData.ts | 132 | styleName: '直觉系', |
| ../client/src/data/tarotData.ts | 133 | description: '相信直觉和第一印象，解读充满灵感和诗意', |
| ../client/src/data/tarotData.ts | 134 | prompt: '你是一位直觉型塔罗师。请用富有诗意和灵感的方式解读牌面，强调直觉感受和能量流动。语 |
| ../client/src/data/tarotData.ts | 138 | name: '墨尘', |
| ../client/src/data/tarotData.ts | 141 | styleName: '逻辑系', |
| ../client/src/data/tarotData.ts | 142 | description: '理性分析牌面关系，提供清晰的行动建议', |
| ../client/src/data/tarotData.ts | 143 | prompt: '你是一位逻辑型塔罗师。请用清晰理性的方式分析牌面，注重牌与牌之间的逻辑关系，给出具 |
| ../client/src/data/tarotData.ts | 147 | name: '暖阳', |
| ../client/src/data/tarotData.ts | 150 | styleName: '治愈系', |
| ../client/src/data/tarotData.ts | 151 | description: '温柔关怀，帮助你疗愈内心，找到平和', |
| ../client/src/data/tarotData.ts | 152 | prompt: '你是一位治愈型塔罗师。请用温柔关怀的语气解读牌面，关注问卜者的情感需求和内心疗愈。 |
| ../client/src/data/tarotData.ts | 156 | name: '夜羽', |
| ../client/src/data/tarotData.ts | 159 | styleName: '神秘系', |
| ../client/src/data/tarotData.ts | 160 | description: '深入神秘学传统，揭示隐藏的深层含义', |
| ../client/src/data/tarotData.ts | 161 | prompt: '你是一位神秘型塔罗师。请深入探索牌面的神秘学含义，结合占星、元素、卡巴拉等传统，揭 |
| ../client/src/data/tarotData.ts | 203 | major: '大阿尔克那', wands: '权杖', cups: '圣杯', swords: ' |
| ../client/src/data/tarotData.ts | 215 | '火': '🔥 火元素', '水': '💧 水元素', '风': '💨 风元素', '土':  |
| ../client/src/data/tarotData.ts | 218 | '火': '🔥 Fire', '水': '💧 Water', '风': '🌬️ Air', ' |
| ../client/src/i18n/index.ts | 12 | { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' }, |
| ../client/src/i18n/index.ts | 13 | { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' }, |
| ../client/src/i18n/index.ts | 15 | { code: 'ja',    label: '日本語',   flag: '🇯🇵' }, |
| ../client/src/pages/DailyFortune.tsx | 37 | '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋', '狮 |
| ../client/src/pages/DailyFortune.tsx | 38 | '牡羊座': '♈', '牡牛座': '♉', '蟹座': '♋', '乙女座': '♍', '山羊 |
| ../client/src/pages/DailyFortune.tsx | 276 | <div className={fortune.cardOrientation === 'rever |
| ../client/src/pages/Gallery.tsx | 7 | <SEO title="78张塔罗牌图鉴" description="完整的78张塔罗牌图鉴，包含2 |
| ../client/src/pages/History.tsx | 63 | console.error('获取历史记录失败:', err); |
| ../client/src/pages/History.tsx | 84 | console.error('删除失败:', err); |
| ../client/src/pages/HistoryDetail.tsx | 104 | console.error('获取解读详情失败:', err); |
| ../client/src/pages/HistoryDetail.tsx | 108 | setError(err.response?.data?.message \|\| '获取解读详情失败， |
| ../client/src/pages/HistoryDetail.tsx | 126 | console.error('删除失败:', err); |
| ../client/src/pages/HistoryDetail.tsx | 160 | const shareText = `【AI塔罗解读】\n问题：${reading.question |
| ../client/src/pages/Interpretation.tsx | 208 | const needRegister = error.includes('注册'); |
| ../client/src/pages/Interpretation.tsx | 209 | const needPoints = error.includes('积分'); |
| ../client/src/pages/ReaderDetail.tsx | 28 | name: '月影灵师', |
| ../client/src/pages/ReaderDetail.tsx | 29 | title: '灵性占卜师 · 月之使者', |
| ../client/src/pages/ReaderDetail.tsx | 35 | tagline: '月光所照之处，真相自然浮现', |
| ../client/src/pages/ReaderDetail.tsx | 36 | description: '月影灵师是一位游走在现实与灵性之间的神秘占卜师。她自幼便能感知月亮的能量 |
| ../client/src/pages/ReaderDetail.tsx | 37 | personality: ['神秘深邃', '诗意浪漫', '直觉敏锐', '温柔有力'], |
| ../client/src/pages/ReaderDetail.tsx | 38 | specialties: ['感情走向', '灵性成长', '潜意识探索', '前世今生'], |
| ../client/src/pages/ReaderDetail.tsx | 39 | readingStyle: '月影灵师的解读像一场梦境对话。她会用丰富的意象和隐喻引导你探索内心深处 |
| ../client/src/pages/ReaderDetail.tsx | 40 | quote: '✨ 不要害怕黑暗，月亮正是在最深的夜里绽放光芒。', |
| ../client/src/pages/ReaderDetail.tsx | 41 | stats: { readings: '12,847', rating: '4.9', style: |
| ../client/src/pages/ReaderDetail.tsx | 45 | name: '苏格拉', |
| ../client/src/pages/ReaderDetail.tsx | 46 | title: '理性分析师 · 逻辑之眼', |
| ../client/src/pages/ReaderDetail.tsx | 52 | tagline: '数据不会说谎，象征自有逻辑', |
| ../client/src/pages/ReaderDetail.tsx | 53 | description: '苏格拉是塔罗界罕见的"理性派"。拥有心理学和数据分析双重背景的他，坚信塔 |
| ../client/src/pages/ReaderDetail.tsx | 54 | personality: ['理性严谨', '逻辑清晰', '实事求是', '精准犀利'], |
| ../client/src/pages/ReaderDetail.tsx | 55 | specialties: ['职业发展', '决策分析', '关系模式识别', '目标规划'], |
| ../client/src/pages/ReaderDetail.tsx | 56 | readingStyle: '苏格拉的解读像一份专业咨询报告。他会将每张牌的象征意义精确映射到你的现 |
| ../client/src/pages/ReaderDetail.tsx | 57 | quote: '📊 塔罗牌不是水晶球，它是帮你看清自己的镜子。', |
| ../client/src/pages/ReaderDetail.tsx | 58 | stats: { readings: '8,523', rating: '4.8', style:  |
| ../client/src/pages/ReaderDetail.tsx | 62 | name: '小鹿', |
| ../client/src/pages/ReaderDetail.tsx | 63 | title: '暖心解读师 · 治愈之声', |
| ../client/src/pages/ReaderDetail.tsx | 69 | tagline: '每一张牌，都在说你值得被爱', |
| ../client/src/pages/ReaderDetail.tsx | 70 | description: '小鹿是一位天生的治愈者。她的解读不是冷冰冰的分析，而是一场温暖的心灵对话 |
| ../client/src/pages/ReaderDetail.tsx | 71 | personality: ['温暖亲切', '善解人意', '乐观积极', '治愈系'], |
| ../client/src/pages/ReaderDetail.tsx | 72 | specialties: ['感情困惑', '自我认知', '人际关系', '情绪疏导'], |
| ../client/src/pages/ReaderDetail.tsx | 73 | readingStyle: '小鹿的解读像一杯温热的奶茶。她会先共情你的感受，再用温柔的话语引导你看 |
| ../client/src/pages/ReaderDetail.tsx | 74 | quote: '🌸 亲爱的，无论牌面如何，你都比自己想象的更强大呢~', |
| ../client/src/pages/ReaderDetail.tsx | 75 | stats: { readings: '15,692', rating: '4.9', style: |
| ../client/src/pages/ReaderDetail.tsx | 80 | title: '朋克塔罗师 · 真相猎手', |
| ../client/src/pages/ReaderDetail.tsx | 86 | tagline: '别装了，让我告诉你真相', |
| ../client/src/pages/ReaderDetail.tsx | 87 | description: 'Rex是塔罗界的一股清流——或者说是一阵飓风。他不搞那些虚头巴脑的仪式感 |
| ../client/src/pages/ReaderDetail.tsx | 88 | personality: ['直言不讳', '犀利果断', '外冷内热', '叛逆有趣'], |
| ../client/src/pages/ReaderDetail.tsx | 89 | specialties: ['突破瓶颈', '真相揭露', '行动力激发', '破除幻想'], |
| ../client/src/pages/ReaderDetail.tsx | 90 | readingStyle: 'Rex的解读像一杯双倍浓缩的Espresso。他不兜圈子，上来就直击要 |
| ../client/src/pages/ReaderDetail.tsx | 91 | quote: '🔥 真相可能不好听，但它比甜言蜜语更能救你的命。', |
| ../client/src/pages/ReaderDetail.tsx | 92 | stats: { readings: '6,731', rating: '4.7', style:  |

