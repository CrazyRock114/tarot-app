import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Eye, Star } from 'lucide-react';
import SEO from '../components/SEO';

const getReaderList = (t: any) => [
  {
    id: 'mystic', name: t('readers_data.mystic.name'), emoji: '🌙', title: t('readers_data.mystic.title'),
    tagline: t('readers_data.mystic.tagline'),
    avatar: '/readers/mystic.jpg',
    gradient: 'from-indigo-600/20 to-purple-600/20', border: 'border-purple-500/30',
    accent: 'text-purple-400', readings: '12,847', rating: '4.9',
  },
  {
    id: 'rational', name: t('readers_data.rational.name'), emoji: '📊', title: t('readers_data.rational.title'),
    tagline: t('readers_data.rational.tagline'),
    avatar: '/readers/rational.jpg',
    gradient: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30',
    accent: 'text-blue-400', readings: '8,523', rating: '4.8',
  },
  {
    id: 'warm', name: t('readers_data.warm.name'), emoji: '🌸', title: t('readers_data.warm.title'),
    tagline: t('readers_data.warm.tagline'),
    avatar: '/readers/warm.jpg',
    gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30',
    accent: 'text-pink-400', readings: '15,692', rating: '4.9',
  },
  {
    id: 'punk', name: t('readers_data.punk.name'), emoji: '🔥', title: t('readers_data.punk.title'),
    tagline: t('readers_data.punk.tagline'),
    avatar: '/readers/punk.jpg',
    gradient: 'from-orange-500/20 to-red-600/20', border: 'border-red-500/30',
    accent: 'text-red-400', readings: '6,731', rating: '4.7',
  },
];

const Readers = () => {
  const { t } = useTranslation();
  const readerList = getReaderList(t);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 py-8 px-4">
      <SEO title={t('readers.title')} description={t('readers.seoDesc')} />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('readers.title')}</h1>
          <p className="text-gray-400">{t('readers.subtitle')}</p>
        </div>

        <div className="space-y-5">
          {readerList.map((reader, i) => (
            <motion.div
              key={reader.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              onClick={() => navigate(`/readers/${reader.id}`)}
              className={`bg-gradient-to-r ${reader.gradient} rounded-2xl p-5 border ${reader.border} cursor-pointer hover:scale-[1.02] transition-all group`}
            >
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${reader.border} flex-shrink-0`}>
                  <img 
                    src={reader.avatar} 
                    alt={reader.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23374151" width="80" height="80"/><text x="40" y="50" text-anchor="middle" font-size="36">${encodeURIComponent(reader.emoji)}</text></svg>`;
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{reader.emoji}</span>
                    <h2 className="text-white font-bold text-lg">{reader.name}</h2>
                    <span className={`${reader.accent} text-xs`}>{reader.title}</span>
                  </div>
                  <p className="text-gray-400 text-sm italic mb-2">"{reader.tagline}"</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {reader.readings}{t('readers.readingsCount')}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {reader.rating}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <button
            onClick={() => navigate('/draw')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            {t('readers.startReading')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Readers;
