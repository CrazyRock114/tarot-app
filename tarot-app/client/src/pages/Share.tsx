import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Copy, Check, Home } from 'lucide-react';
import VoiceReader from '../components/VoiceReader';
import SEO from '../components/SEO';

interface SharedCard {
  id: string;
  name: string;
  nameEn: string;
  suit?: string;
  arcana?: string;
  image?: string;
  meaning: string;
  meaningReversed?: string;
  position: string;
  orientation: 'upright' | 'reversed';
}

interface SharedReading {
  question: string;
  spreadType: string;
  spreadName: string;
  cards: SharedCard[];
  interpretation: string;
  readerStyle?: string;
  yesNoResult?: 'yes' | 'no' | 'maybe' | null;
  createdAt: string;
}

// 根据花色和编号推导图片路径
function getCardImage(card: SharedCard): string | null {
  const name = (card.nameEn || '').toLowerCase();
  
  // 大阿卡纳映射
  const majorMap: Record<string, string> = {
    'the fool': '00-fool', 'the magician': '01-magician', 'the high priestess': '02-high-priestess',
    'the empress': '03-empress', 'the emperor': '04-emperor', 'the hierophant': '05-hierophant',
    'the lovers': '06-lovers', 'the chariot': '07-chariot', 'strength': '08-strength',
    'the hermit': '09-hermit', 'wheel of fortune': '10-wheel-of-fortune', 'justice': '11-justice',
    'the hanged man': '12-hanged-man', 'death': '13-death', 'temperance': '14-temperance',
    'the devil': '15-devil', 'the tower': '16-tower', 'the star': '17-star',
    'the moon': '18-moon', 'the sun': '19-sun', 'judgement': '20-judgement', 'the world': '21-world',
  };
  if (majorMap[name]) return `/cards/${majorMap[name]}.jpg`;
  
  // 小阿卡纳
  const suits = ['wands', 'cups', 'swords', 'coins', 'pentacles'];
  for (const suit of suits) {
    const s = suit === 'pentacles' ? 'coins' : suit;
    if (name.includes(suit) || name.includes('pentacle')) {
      // Court cards
      if (name.includes('page')) return `/cards/${s}-page.jpg`;
      if (name.includes('knight')) return `/cards/${s}-knight.jpg`;
      if (name.includes('queen')) return `/cards/${s}-queen.jpg`;
      if (name.includes('king')) return `/cards/${s}-king.jpg`;
      // Number cards - extract number
      const numMatch = name.match(/^(\d+|ace|two|three|four|five|six|seven|eight|nine|ten)\s/i);
      if (numMatch) {
        const wordToNum: Record<string, number> = {
          ace: 1, two: 2, three: 3, four: 4, five: 5,
          six: 6, seven: 7, eight: 8, nine: 9, ten: 10
        };
        const num = wordToNum[numMatch[1].toLowerCase()] || parseInt(numMatch[1]);
        if (num) return `/cards/${s}-${String(num).padStart(2, '0')}.jpg`;
      }
    }
  }
  
  // 尝试用id匹配
  const id = parseInt(card.id);
  if (!isNaN(id) && id >= 0 && id <= 21) {
    const majorById = [
      '00-fool','01-magician','02-high-priestess','03-empress','04-emperor',
      '05-hierophant','06-lovers','07-chariot','08-strength','09-hermit',
      '10-wheel-of-fortune','11-justice','12-hanged-man','13-death','14-temperance',
      '15-devil','16-tower','17-star','18-moon','19-sun','20-judgement','21-world'
    ];
    return `/cards/${majorById[id]}.jpg`;
  }
  
  return null;
}

const Share = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const getReaderName = (id: string) => t('readers_data.' + id + '.name');
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<SharedReading | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    
    fetch(`/api/share/${shareId}`)
      .then(res => {
        if (!res.ok) throw new Error(t('errors.shareFailed'));
        return res.json();
      })
      .then(data => {
        setReading(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [shareId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex items-center justify-center">
        <SEO title={t('share.seoTitle')} description={t('share.seoDesc')} />
        <div className="text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex items-center justify-center px-4">
        <SEO title={t('share.seoTitle')} description={t('share.seoDesc')} />
        <div className="text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-xl text-white mb-2">{t("common.error")}</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            {t('nav.home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <SEO title={t('share.seoTitle')} description={t('share.seoDesc')} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            {t('nav.home')}
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? t('points.copied') : t('common.copy') + t('interpretation.share')}
          </button>
        </div>

        {/* Share Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600/20 text-purple-300 rounded-full text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            {t('share.title')}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {reading.spreadName || reading.spreadType}
          </h1>
          {reading.question && (
            <p className="text-gray-400 max-w-xl mx-auto">
              {t('share.question')}: {reading.question}
            </p>
          )}
          {reading.readerStyle && (
            <p className="text-purple-400 text-sm mt-2">
              🔮 {t('interpretation.readingBy', { reader: getReaderName(reading.readerStyle) || t('readers_data.mystic.name') })}
            </p>
          )}
          {reading.yesNoResult && (
            <div className="mt-4">
              <span className={`inline-block px-8 py-3 rounded-2xl text-2xl font-bold ${
                reading.yesNoResult === 'yes' ? 'bg-green-900/30 text-green-400 border border-green-600/30' :
                reading.yesNoResult === 'no' ? 'bg-red-900/30 text-red-400 border border-red-600/30' :
                'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
              }`}>
                {reading.yesNoResult === 'yes' ? t('interpretation.yes') :
                 reading.yesNoResult === 'no' ? t('interpretation.no') :
                 t('interpretation.maybe')}
              </span>
            </div>
          )}
          <p className="text-gray-500 text-sm mt-2">
            {new Date(reading.createdAt).toLocaleString(localStorage.getItem('i18nextLng') || 'en')}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">🃏</span>
            {t('interpretation.yourCards')}
          </h2>
          
          <div className={`grid gap-4 ${
            reading.cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            reading.cards.length <= 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {reading.cards.map((card, index) => {
              const imagePath = card.image || getCardImage(card);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center"
                >
                  {/* Card Visual */}
                  <div className={`w-36 aspect-[512/917] sm:w-44 md:w-48 mx-auto rounded-xl overflow-hidden shadow-xl mb-3 ${
                    card.orientation === 'reversed' ? 'rotate-180' : ''
                  }`}>
                    {imagePath ? (
                      <img src={imagePath} alt={card.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-indigo-800 to-purple-900 flex items-center justify-center">
                        <div className="text-4xl">🔮</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Info */}
                  <div className="space-y-1">
                    <p className="text-white font-medium">{isZh ? card.name : (card.nameEn || card.name)}</p>
                    <p className="text-gray-400 text-sm">{isZh ? card.nameEn : card.name}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      card.orientation === 'reversed' 
                        ? 'bg-amber-600/20 text-amber-300' 
                        : 'bg-indigo-600/20 text-indigo-300'
                    }`}>
                      {card.orientation === 'reversed' ? t('draw.reversed') : t('draw.upright')}
                    </span>
                    {card.position && (
                      <p className="text-gray-500 text-xs">{t('share.spread')}: {card.position}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-sm">✨</span>
              {t('interpretation.aiInterpretation')}
            </h2>
            {reading.interpretation && (
              <VoiceReader text={reading.interpretation} readerStyle={reading.readerStyle || 'mystic'} ready={true} />
            )}
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6">
            <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
              {reading.interpretation}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-4">{t('share.tryIt')}</p>
          <button
            onClick={() => navigate('/draw')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
          >
            {t('share.tryIt')} ✨
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            💡 {t('interpretation.aiInterpretation')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Share;
