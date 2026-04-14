import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Star, MessageCircle, Eye, Heart } from 'lucide-react';
import SEO from '../components/SEO';

interface ReaderInfo {
  id: string;
  name: string;
  title: string;
  emoji: string;
  avatar: string;
  color: string;
  bgGradient: string;
  accentColor: string;
  tagline: string;
  description: string;
  personality: string[];
  specialties: string[];
  readingStyle: string;
  quote: string;
  stats: { readings: string; rating: string; style: string };
}

const readers: Record<string, ReaderInfo> = {
  mystic: {
    id: 'mystic',
    name: '月影灵师',
    title: '灵性占卜师 · 月之使者',
    emoji: '🌙',
    avatar: '/readers/mystic.jpg',
    color: 'purple',
    bgGradient: 'from-indigo-950 via-purple-950 to-gray-950',
    accentColor: 'text-purple-400',
    tagline: '月光所照之处，真相自然浮现',
    description: '月影灵师是一位游走在现实与灵性之间的神秘占卜师。她自幼便能感知月亮的能量波动，在少女时代开始接触塔罗牌后，迅速展现出非凡的直觉天赋。她的解读如月光般温柔却锋利——看似轻描淡写，实则直指核心。她擅长用诗意的语言传递深刻的洞见，让每一次占卜都像一场灵性之旅。',
    personality: ['神秘深邃', '诗意浪漫', '直觉敏锐', '温柔有力'],
    specialties: ['感情走向', '灵性成长', '潜意识探索', '前世今生'],
    readingStyle: '月影灵师的解读像一场梦境对话。她会用丰富的意象和隐喻引导你探索内心深处，在星光与月影之间找到问题的答案。她的语言充满灵性诗意，偶尔引用古老的神秘学智慧，让你感受到宇宙的浩瀚与自身的渺小和伟大。',
    quote: '✨ 不要害怕黑暗，月亮正是在最深的夜里绽放光芒。',
    stats: { readings: '12,847', rating: '4.9', style: '灵性诗意' },
  },
  rational: {
    id: 'rational',
    name: '苏格拉',
    title: '理性分析师 · 逻辑之眼',
    emoji: '📊',
    avatar: '/readers/rational.jpg',
    color: 'blue',
    bgGradient: 'from-gray-950 via-blue-950 to-gray-950',
    accentColor: 'text-blue-400',
    tagline: '数据不会说谎，象征自有逻辑',
    description: '苏格拉是塔罗界罕见的"理性派"。拥有心理学和数据分析双重背景的他，坚信塔罗牌的价值不在于预言未来，而在于提供一面镜子，帮助人们理解自己的心理模式和决策偏好。他的解读摒弃一切玄学术语，取而代之的是精确的情境分析、认知行为框架和可操作的行动建议。',
    personality: ['理性严谨', '逻辑清晰', '实事求是', '精准犀利'],
    specialties: ['职业发展', '决策分析', '关系模式识别', '目标规划'],
    readingStyle: '苏格拉的解读像一份专业咨询报告。他会将每张牌的象征意义精确映射到你的现实情境，用结构化的分析框架拆解问题，每一段都有明确的"因为…所以…"逻辑链。不讲故事，不谈感觉，只给你能拿来立即行动的干货。',
    quote: '📊 塔罗牌不是水晶球，它是帮你看清自己的镜子。',
    stats: { readings: '8,523', rating: '4.8', style: '逻辑分析' },
  },
  warm: {
    id: 'warm',
    name: '小鹿',
    title: '暖心解读师 · 治愈之声',
    emoji: '🌸',
    avatar: '/readers/warm.jpg',
    color: 'pink',
    bgGradient: 'from-gray-950 via-pink-950 to-gray-950',
    accentColor: 'text-pink-400',
    tagline: '每一张牌，都在说你值得被爱',
    description: '小鹿是一位天生的治愈者。她的解读不是冷冰冰的分析，而是一场温暖的心灵对话。她有着超强的共情能力，总能精准地感受到你的情绪状态，并用恰到好处的温度给予回应。在她的解读中，你不会觉得自己在"被算命"，更像是在和一个知心好友聊天——她理解你，支持你，同时也会温柔但坚定地指出需要面对的课题。',
    personality: ['温暖亲切', '善解人意', '乐观积极', '治愈系'],
    specialties: ['感情困惑', '自我认知', '人际关系', '情绪疏导'],
    readingStyle: '小鹿的解读像一杯温热的奶茶。她会先共情你的感受，再用温柔的话语引导你看到事情积极的一面。她擅长在困难中发现希望的种子，在混乱中找到清晰的路径。偶尔的可爱语气词和小表情，让整个解读过程轻松而治愈。',
    quote: '🌸 亲爱的，无论牌面如何，你都比自己想象的更强大呢~',
    stats: { readings: '15,692', rating: '4.9', style: '温暖治愈' },
  },
  punk: {
    id: 'punk',
    name: 'Rex',
    title: '朋克塔罗师 · 真相猎手',
    emoji: '🔥',
    avatar: '/readers/punk.jpg',
    color: 'red',
    bgGradient: 'from-gray-950 via-red-950 to-gray-950',
    accentColor: 'text-red-400',
    tagline: '别装了，让我告诉你真相',
    description: 'Rex是塔罗界的一股清流——或者说是一阵飓风。他不搞那些虚头巴脑的仪式感，不说那些模棱两可的废话。他相信真正的关怀是把真相一把扔到你面前，而不是用糖衣包裹坏消息。他的解读犀利到让人心跳加速，但每个听过他解读的人都承认：Rex说的，往往是你最不想听、却最需要听的话。',
    personality: ['直言不讳', '犀利果断', '外冷内热', '叛逆有趣'],
    specialties: ['突破瓶颈', '真相揭露', '行动力激发', '破除幻想'],
    readingStyle: 'Rex的解读像一杯双倍浓缩的Espresso。他不兜圈子，上来就直击要害。如果牌面不好，他会直接告诉你"这牌不行"然后分析为什么。他偶尔会用网络流行语和俚语让气氛没那么严肃，但别被他的痞气骗了——他可能是最认真帮你分析问题的那个人。',
    quote: '🔥 真相可能不好听，但它比甜言蜜语更能救你的命。',
    stats: { readings: '6,731', rating: '4.7', style: '犀利直接' },
  },
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; tagBg: string }> = {
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20', tagBg: 'bg-purple-600/20' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20', tagBg: 'bg-blue-600/20' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'shadow-pink-500/20', tagBg: 'bg-pink-600/20' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20', tagBg: 'bg-red-600/20' },
};

const ReaderDetail = () => {
  const { t } = useTranslation();
  const { readerId } = useParams();
  const navigate = useNavigate();
  const reader = readers[readerId || ''];
  
  if (!reader) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">{t('readers.readerNotFound')}</p>
          <button onClick={() => navigate('/draw')} className="mt-4 text-purple-400 underline">{t('readers.backToDraw')}</button>
        </div>
      </div>
    );
  }

  const colors = colorMap[reader.color];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${reader.bgGradient}`}>
      <SEO title={t('readers_data.' + reader.id + '.name') + ' - ' + t('readers.title')} description={reader.description.slice(0, 150)} />
      
      {/* Back Button */}
      <div className="sticky top-0 z-10 p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('common.back')}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {/* Avatar */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 ${colors.border} shadow-2xl ${colors.glow}`}
          >
            <img 
              src={reader.avatar} 
              alt={reader.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="%23374151" width="160" height="160"/><text x="80" y="90" text-anchor="middle" font-size="60">${encodeURIComponent(reader.emoji)}</text></svg>`;
              }}
            />
          </motion.div>

          <div className="text-4xl mb-2">{reader.emoji}</div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('readers_data.' + reader.id + '.name')}</h1>
          <p className={`${colors.text} text-sm mb-4`}>{t('readers_data.' + reader.id + '.title')}</p>
          <p className="text-gray-300 text-lg italic">"{t('readers_data.' + reader.id + '.tagline')}"</p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: t('readers.readingsCount'), value: reader.stats.readings, icon: Eye },
            { label: t('readers.rating'), value: reader.stats.rating, icon: Star },
            { label: t('readers.style'), value: t('readers_data.' + reader.id + '.style'), icon: MessageCircle },
          ].map((stat, i) => (
            <div key={i} className={`${colors.bg} rounded-xl p-4 text-center border ${colors.border}`}>
              <stat.icon className={`w-4 h-4 ${colors.text} mx-auto mb-2`} />
              <p className="text-white font-bold text-lg">{stat.value}</p>
              <p className="text-gray-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* About */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-6"
        >
          <h2 className="text-white font-semibold text-lg mb-3">{t('readers.about', { name: t('readers_data.' + reader.id + '.name') })}</h2>
          <p className="text-gray-300 leading-relaxed">{t('readers_data.' + reader.id + '.description')}</p>
        </motion.div>

        {/* Personality Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-white font-semibold text-lg mb-3">{t('readers.personality')}</h2>
          <div className="flex flex-wrap gap-2">
            {((t('readers_data.' + reader.id + '.personality', { returnObjects: true }) as string[]) || reader.personality).map((trait, i) => (
              <span key={i} className={`px-4 py-2 ${colors.tagBg} ${colors.text} rounded-full text-sm`}>
                {trait}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Specialties */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-6"
        >
          <h2 className="text-white font-semibold text-lg mb-3">{t("readers.specialties")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {((t('readers_data.' + reader.id + '.specialties', { returnObjects: true }) as string[]) || reader.specialties).map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${colors.text}`} />
                <span className="text-gray-300 text-sm">{spec}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reading Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-6"
        >
          <h2 className="text-white font-semibold text-lg mb-3">{t("readers.style")}</h2>
          <p className="text-gray-300 leading-relaxed">{t('readers_data.' + reader.id + '.readingStyle')}</p>
        </motion.div>

        {/* Quote */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`${colors.bg} border ${colors.border} rounded-2xl p-6 text-center mb-8`}
        >
          <p className={`${colors.text} text-lg italic leading-relaxed`}>
            {t('readers_data.' + reader.id + '.quote')}
          </p>
          <p className="text-gray-500 text-sm mt-3">—— {t('readers_data.' + reader.id + '.name')}</p>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/draw')}
            className={`px-8 py-4 bg-gradient-to-r ${
              reader.color === 'purple' ? 'from-indigo-600 to-purple-600' :
              reader.color === 'blue' ? 'from-blue-600 to-cyan-600' :
              reader.color === 'pink' ? 'from-pink-500 to-rose-500' :
              'from-orange-500 to-red-600'
            } text-white rounded-2xl text-lg font-medium hover:opacity-90 transition-all shadow-lg flex items-center gap-2 mx-auto`}
          >
            <Sparkles className="w-5 h-5" />
            {t('readers.consultWith', { name: t('readers_data.' + reader.id + '.name') })}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReaderDetail;
