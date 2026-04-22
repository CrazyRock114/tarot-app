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
    name: 'Starry Moon',
    title: 'Spiritual Diviner · Moon Messenger',
    emoji: '🌙',
    avatar: '/readers/mystic.jpg',
    color: 'purple',
    bgGradient: 'from-indigo-950 via-purple-950 to-gray-950',
    accentColor: 'text-purple-400',
    tagline: 'Where moonlight shines, truth naturally emerges',
    description: 'Starry Moon is a mysterious diviner who walks between reality and spirituality. Since childhood, she could sense the energy fluctuations of the moon. After encountering tarot cards in her youth, she quickly demonstrated extraordinary intuitive talent. Her readings are as gentle yet sharp as moonlight—seemingly light, but hitting the core directly. She excels at conveying profound insights through poetic language, making every divination feel like a spiritual journey.',
    personality: ['Mysterious', 'Poetic', 'Intuitive', 'Gentle yet Strong'],
    specialties: ['Love Direction', 'Spiritual Growth', 'Subconscious Exploration', 'Past Lives'],
    readingStyle: 'Starry Moon\'s readings are like a dream conversation. She uses rich imagery and metaphors to guide you into exploring your innermost self, finding answers between starlight and moonshadow. Her language is filled with spiritual poetry, occasionally quoting ancient mystical wisdom, making you feel the vastness of the universe and your own smallness and greatness.',
    quote: '✨ Do not fear the darkness, for the moon shines brightest in the deepest night.',
    stats: { readings: '12,847', rating: '4.9', style: 'Spiritual & Poetic' },
  },
  rational: {
    id: 'rational',
    name: 'Sokra',
    title: 'Rational Analyst · Eye of Logic',
    emoji: '📊',
    avatar: '/readers/rational.jpg',
    color: 'blue',
    bgGradient: 'from-gray-950 via-blue-950 to-gray-950',
    accentColor: 'text-blue-400',
    tagline: 'Data does not lie, symbols have their own logic',
    description: 'Sokra is a rare "rationalist" in the tarot world. With a dual background in psychology and data analysis, he firmly believes that the value of tarot cards lies not in predicting the future, but in providing a mirror to help people understand their own psychological patterns and decision-making preferences. His interpretations abandon all esoteric terminology, replacing them with precise situational analysis, cognitive-behavioral frameworks, and actionable recommendations.',
    personality: ['Rational', 'Logical', 'Pragmatic', 'Precise'],
    specialties: ['Career Development', 'Decision Analysis', 'Relationship Pattern Recognition', 'Goal Planning'],
    readingStyle: 'Sokra\'s readings are like a professional consulting report. He maps the symbolic meaning of each card precisely to your real-life situation, using structured analytical frameworks to break down problems, with clear "because... so..." logic chains in every section. No stories, no feelings—only practical takeaways you can act on immediately.',
    quote: '📊 Tarot cards are not crystal balls, they are mirrors that help you see yourself clearly.',
    stats: { readings: '8,523', rating: '4.8', style: 'Logical Analysis' },
  },
  warm: {
    id: 'warm',
    name: 'Fawn',
    title: 'Warm Interpreter · Voice of Healing',
    emoji: '🌸',
    avatar: '/readers/warm.jpg',
    color: 'pink',
    bgGradient: 'from-gray-950 via-pink-950 to-gray-950',
    accentColor: 'text-pink-400',
    tagline: 'Every card is saying you deserve to be loved',
    description: 'Fawn is a natural healer. Her readings are not cold analysis, but a warm heart-to-heart conversation. She has extraordinary empathy, always accurately sensing your emotional state and responding with just the right warmth. In her readings, you won\'t feel like you\'re "being told your fortune"—it\'s more like chatting with a close friend who understands you, supports you, and gently but firmly points out the lessons you need to face.',
    personality: ['Warm', 'Empathetic', 'Optimistic', 'Healing'],
    specialties: ['Love Confusion', 'Self-Knowledge', 'Relationships', 'Emotional Relief'],
    readingStyle: 'Fawn\'s readings are like a cup of warm milk tea. She first empathizes with your feelings, then gently guides you to see the positive side of things. She excels at finding seeds of hope in difficulties and clear paths in chaos. Occasional cute expressions and emojis make the entire reading process light and healing.',
    quote: '🌸 Dear, no matter what the cards say, you are stronger than you think~',
    stats: { readings: '15,692', rating: '4.9', style: 'Warm & Healing' },
  },
  punk: {
    id: 'punk',
    name: 'Rex',
    title: 'Punk Tarot Reader · Truth Hunter',
    emoji: '🔥',
    avatar: '/readers/punk.jpg',
    color: 'red',
    bgGradient: 'from-gray-950 via-red-950 to-gray-950',
    accentColor: 'text-red-400',
    tagline: 'Stop pretending, let me tell you the truth',
    description: 'Rex is a breath of fresh air—or rather, a hurricane—in the tarot world. He doesn\'t do pointless rituals or speak vague nonsense. He believes that true care means throwing the truth right in your face, not sugar-coating bad news. His readings are so sharp they make your heart race, but everyone who\'s heard him admits: Rex says what you least want to hear but most need to hear.',
    personality: ['Blunt', 'Sharp', 'Cold Outside Warm Inside', 'Rebellious'],
    specialties: ['Breaking Through', 'Truth Revealing', 'Action Motivation', 'Illusion Shattering'],
    readingStyle: 'Rex\'s readings are like a double-shot espresso. He doesn\'t beat around the bush—he hits the nail on the head right away. If the cards look bad, he\'ll tell you straight up "these cards are not good" and then analyze why. He occasionally uses internet slang to keep things from getting too serious, but don\'t be fooled by his attitude—he might be the one most seriously helping you analyze your problems.',
    quote: '🔥 The truth may not sound good, but it can save your life more than sweet words.',
    stats: { readings: '6,731', rating: '4.7', style: 'Sharp & Direct' },
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
