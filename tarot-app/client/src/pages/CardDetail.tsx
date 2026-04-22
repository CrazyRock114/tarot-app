import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Sun, Moon } from 'lucide-react';
import SEO from '../components/SEO';
import { getMajorArcana } from '../data/majorArcana';
import { getMinorArcana } from '../data/minorArcana';

const CardDetail = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');

  const suitInfo: Record<string, { name: string; element: string; color: string; desc: string }> = {
    major: { name: t('gallery.majorArcana'), element: '', color: 'text-purple-400', desc: t('gallery.majorDesc') },
    wands: { name: t('gallery.wands'), element: '🔥 ' + t('elements.fire', 'Fire'), color: 'text-orange-400', desc: t('gallery.wandsDesc') },
    cups: { name: t('gallery.cups'), element: '💧 ' + t('elements.water', 'Water'), color: 'text-blue-400', desc: t('gallery.cupsDesc') },
    swords: { name: t('gallery.swords'), element: '🌬️ ' + t('elements.air', 'Air'), color: 'text-cyan-400', desc: t('gallery.swordsDesc') },
    pentacles: { name: t('gallery.pentacles'), element: '🌍 ' + t('elements.earth', 'Earth'), color: 'text-yellow-400', desc: t('gallery.pentaclesDesc') },
    coins: { name: t('gallery.pentacles'), element: '🌍 ' + t('elements.earth', 'Earth'), color: 'text-yellow-400', desc: t('gallery.pentaclesDesc') },
  };
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const allCards = [...getMajorArcana(), ...getMinorArcana()];
  const card = allCards.find(c => String(c.id) === cardId || c.nameEn.toLowerCase().replace(/ /g, '-') === cardId);
  
  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 text-lg mb-4">{t('common.noData')}</p>
          <button onClick={() => navigate('/gallery')} className="text-indigo-400 hover:text-indigo-300">
            {t('gallery.title')}
          </button>
        </div>
      </div>
    );
  }

  const suit = suitInfo[card.suit || card.arcana] || suitInfo.major;
  
  const currentKeywords = card.keywords;
  const currentMeanings = card.meanings;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <SEO 
        title={t('cardDetail.seoTitle', { name: card.name, nameEn: card.nameEn })}
        description={t('cardDetail.seoDesc', { name: card.name, nameEn: card.nameEn, upright: currentMeanings.upright, reversed: currentMeanings.reversed })}
        image={card.image ? `https://2or.com${card.image}` : undefined}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button onClick={() => navigate('/gallery')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ChevronLeft className="w-5 h-5" />
          {t('gallery.title')}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center"
          >
            <div className="w-64 aspect-[512/917] sm:w-72 md:w-80 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30 border border-purple-600/20">
              {card.image ? (
                <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-indigo-800 to-purple-900 flex items-center justify-center">
                  <span className="text-6xl">🔮</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{isZh ? card.name : (card.nameEn || card.name)}</h1>
              <p className="text-gray-400 text-lg">{isZh ? card.nameEn : card.name}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm ${suit.color} bg-gray-800/80`}>
                  {suit.name}
                </span>
                {suit.element && <span className="px-3 py-1 rounded-full text-sm text-gray-300 bg-gray-800/80">
                  {suit.element}
                </span>}
                {'number' in card && typeof card.number === 'number' && (
                  <span className="px-3 py-1 rounded-full text-sm text-gray-300 bg-gray-800/80">
                    #{card.number}
                  </span>
                )}
              </div>
            </div>

            {/* Upright Meaning */}
            <div className="bg-green-900/10 border border-green-600/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-green-400">{t("cardDetail.upright")}</h2>
              </div>
              <p className="text-gray-200 leading-relaxed mb-3">{currentMeanings.upright}</p>
              <div className="flex flex-wrap gap-2">
                {currentKeywords.upright.map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs bg-green-600/20 text-green-300 rounded-lg">{kw.trim()}</span>
                ))}
              </div>
            </div>

            {/* Reversed Meaning */}
            <div className="bg-amber-900/10 border border-amber-600/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-amber-400">{t("cardDetail.reversed")}</h2>
              </div>
              <p className="text-gray-200 leading-relaxed mb-3">{currentMeanings.reversed}</p>
              <div className="flex flex-wrap gap-2">
                {currentKeywords.reversed.map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs bg-amber-600/20 text-amber-300 rounded-lg">{kw.trim()}</span>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <button
              onClick={() => navigate('/draw')}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t('home.startReading')}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
