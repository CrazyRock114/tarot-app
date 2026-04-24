import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Clock, 
  BookOpen, 
  Loader2, 
  AlertCircle,
  Trash2,
  Sparkles,
  Share2
} from 'lucide-react';
import { readingsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import VoiceReader from '../components/VoiceReader';
import SEO from '../components/SEO';

interface ReadingDetail {
  _id: string;
  question: string;
  spreadType: string;
  yesNoResult?: 'yes' | 'no' | 'maybe' | null;
  cards: Array<{
    id: string;
    name: string;
    nameEn: string;
    meaning: string;
    position: string;
    orientation?: string;
    image?: string;
    suit?: string;
    arcana?: string;
  }>;
  interpretation: string;
  readerStyle?: string;
  createdAt: string;
}

function getCardImage(card: { nameEn?: string; image?: string; id?: string; suit?: string }): string | null {
  if (card.image) return card.image;
  const name = (card.nameEn || '').toLowerCase();
  const majorMap: Record<string, string> = {
    'the fool': '00-fool', 'the magician': '01-magician', 'the high priestess': '02-high-priestess',
    'the empress': '03-empress', 'the emperor': '04-emperor', 'the hierophant': '05-hierophant',
    'the lovers': '06-lovers', 'the chariot': '07-chariot', 'strength': '08-strength',
    'the hermit': '09-hermit', 'wheel of fortune': '10-wheel', 'justice': '11-justice',
    'the hanged man': '12-hanged-man', 'death': '13-death', 'temperance': '14-temperance',
    'the devil': '15-devil', 'the tower': '16-tower', 'the star': '17-star',
    'the moon': '18-moon', 'the sun': '19-sun', 'judgement': '20-judgement', 'the world': '21-world',
  };
  if (majorMap[name]) return '/cards/' + majorMap[name] + '.jpg';
  const suitMap: Record<string, string> = { wands: 'wands', cups: 'cups', swords: 'swords', pentacles: 'coins', coins: 'coins' };
  for (const [key, s] of Object.entries(suitMap)) {
    if (name.includes(key) || (card.suit && suitMap[card.suit])) {
      const suit = name.includes(key) ? s : suitMap[card.suit!];
      if (name.includes('page')) return '/cards/' + suit + '-page.jpg';
      if (name.includes('knight')) return '/cards/' + suit + '-knight.jpg';
      if (name.includes('queen')) return '/cards/' + suit + '-queen.jpg';
      if (name.includes('king')) return '/cards/' + suit + '-king.jpg';
      if (name.includes('ace')) return '/cards/' + suit + '-01.jpg';
      const numMatch = name.match(/(\d+|two|three|four|five|six|seven|eight|nine|ten)/i);
      if (numMatch) {
        const wordToNum: Record<string, number> = { two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10 };
        const num = wordToNum[numMatch[1].toLowerCase()] || parseInt(numMatch[1]);
        if (num) return '/cards/' + suit + '-' + String(num).padStart(2,'0') + '.jpg';
      }
      break;
    }
  }
  return null;
}

const HistoryDetail = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [reading, setReading] = useState<ReadingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // 检查登录状态并获取详情
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/history/${id}` } });
      return;
    }
    if (id) {
      fetchReadingDetail();
    }
  }, [isAuthenticated, authLoading, id, navigate]);

  // 获取解读详情
  const fetchReadingDetail = async () => {
    try {
      setLoading(true);
      const response = await readingsApi.getById(id!);
      setReading(response.data);
      setError('');
    } catch (err: any) {
      console.error('获取解读详情失败:', err);
      if (err.response?.status === 404) {
        setError(t('history.recordNotFound'));
      } else {
        setError(err.response?.data?.message || t('errors.loadFailed', 'Failed to load reading details, please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 删除记录
  const handleDelete = async () => {
    if (!confirm(t('common.confirm') + ': ' + t('history.title') + '?')) {
      return;
    }

    try {
      setDeleting(true);
      await readingsApi.delete(id!);
      navigate('/history');
    } catch (err: any) {
      console.error('删除失败:', err);
      alert(err.response?.data?.message || t('errors.deleteFailed'));
      setDeleting(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const lang = localStorage.getItem('i18nextLng') || 'zh-CN';
    return date.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取牌阵显示名称
  const getSpreadTypeName = (type: string) => {
    const spreadNames: Record<string, string> = {
      'single': t('draw.single'),
      'three': t('draw.threeCard'),
      'celtic': t('draw.cross'),
      'relationship': t('draw.problem'),
      'career': t('draw.career'),
    };
    return spreadNames[type] || type || t('common.noData');
  };

  // 复制分享
  const handleShare = async () => {
    if (!reading) return;

    const shareText = `${t('share.shareTitle')}\n${t('share.questionLabel')}: ${reading.question || t('share.noQuestion')}\n${t('share.spreadLabel')}: ${getSpreadTypeName(reading.spreadType)}\n${t('share.timeLabel')}: ${formatDate(reading.createdAt)}\n\n${t('share.cardsLabel')}: ${reading.cards?.map(c => c.name).join(', ')}\n\n${t('share.summaryLabel')}: ${reading.interpretation?.slice(0, 100)}...`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert(t('interpretation.copySuccess'));
    } catch {
      alert(t('interpretation.copyFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <SEO title={t('history.detailSeoTitle')} description={t('history.detailSeoDesc')} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="ml-3 text-gray-400">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <SEO title={t('history.detailSeoTitle')} description={t('history.detailSeoDesc')} />
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('history.title')}
          </button>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t("common.error")}</h2>
            <p className="text-gray-400 mb-8">{error || t('history.recordNotFound')}</p>
            <button
              onClick={() => navigate('/history')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {t('history.title')}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <SEO title={t('history.detailSeoTitle')} description={t('history.detailSeoDesc')} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('common.back')}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={t('interpretation.share')}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title={t('common.close')}
            >
              {deleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Reading Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            {reading.question || t('history.noQuestion')}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-full">
              <BookOpen className="w-4 h-4" />
              {getSpreadTypeName(reading.spreadType)}
            </span>
            <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              {formatDate(reading.createdAt)}
            </span>
          </div>
        </motion.div>

        {/* Cards Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 rounded-2xl p-6 mb-8 border border-gray-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">
              1
            </span>
            {t('interpretation.yourCards')}
          </h2>
          
          <div className={`grid gap-4 ${
            reading.cards?.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            reading.cards?.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
            reading.cards?.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          }`}>
            {reading.cards?.map((card, index) => {
              const imagePath = getCardImage(card);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  {/* Card Image */}
                  <div className={`w-36 aspect-[512/917] sm:w-44 md:w-48 mx-auto rounded-xl overflow-hidden shadow-xl mb-3 border border-gray-700/50 ${
                    card.orientation === 'reversed' ? 'rotate-180' : ''
                  }`}>
                    {imagePath ? (
                      <img src={imagePath} alt={card.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-indigo-400/50">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Info */}
                  <div className="space-y-1">
                    <h3 className="text-white font-medium">{isZh ? card.name : (card.nameEn || card.name)}</h3>
                    <p className="text-gray-500 text-xs">{isZh ? card.nameEn : card.name}</p>
                    {card.orientation && (
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        card.orientation === 'reversed'
                          ? 'bg-amber-600/20 text-amber-300'
                          : 'bg-indigo-600/20 text-indigo-300'
                      }`}>
                        {card.orientation === 'reversed' ? t('draw.reversed') : t('draw.upright')}
                      </span>
                    )}
                    {card.position && (
                      <p className="text-indigo-400 text-xs">{card.position}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-sm">
                2
              </span>
              {t('interpretation.aiInterpretation')}
            </h2>
            {reading.interpretation && (
              <VoiceReader text={reading.interpretation} readerStyle={reading.readerStyle || 'mystic'} ready={true} />
            )}
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {reading.interpretation}
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-lg">
            <p className="text-indigo-300 text-sm">
              💡 {t('interpretation.aiInterpretation')}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate('/draw')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {t('home.startReading')}
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <BookOpen className="w-5 h-5" />
            {t('history.title')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryDetail;
