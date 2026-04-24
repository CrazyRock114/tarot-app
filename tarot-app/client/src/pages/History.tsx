import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Clock, 
  Sparkles, 
  Trash2, 
  Loader2, 
  BookOpen,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { readingsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

interface Reading {
  _id: string;
  question: string;
  spreadType: string;
  cards: Array<{
    id: string;
    name: string;
    nameEn: string;
    meaning: string;
    position: string;
  }>;
  createdAt: string;
}

const History = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/history' } });
      return;
    }
    fetchReadings();
  }, [isAuthenticated, authLoading, navigate]);

  // 获取历史记录
  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await readingsApi.getAll();
      const allReadings = response.data || [];
      setReadings(allReadings);
      setHasMore(allReadings.length > page * ITEMS_PER_PAGE);
      setError('');
    } catch (err: any) {
      console.error('获取历史记录失败:', err);
      setError(err.response?.data?.message || t('errors.getFortuneFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 删除记录
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(t('common.confirm') + '?')) {
      return;
    }

    try {
      setDeletingId(id);
      await readingsApi.delete(id);
      setReadings(prev => prev.filter(r => r._id !== id));
    } catch (err: any) {
      console.error('删除失败:', err);
      alert(err.response?.data?.message || t('errors.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    
    return date.toLocaleDateString(localStorage.getItem('i18nextLng') || 'en', {
      year: 'numeric',
      month: 'short',
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

  // 获取解读摘要（前100字）
  const getSummary = (reading: Reading) => {
    const cardNames = reading.cards?.map(c => c.name).join('、') || '';
    return cardNames || t('common.noData');
  };

  // 分页数据
  const paginatedReadings = readings.slice(0, page * ITEMS_PER_PAGE);

  // 加载更多
  const loadMore = () => {
    setPage(prev => prev + 1);
    setHasMore(readings.length > (page + 1) * ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <SEO title={t('history.seoTitle')} description={t('history.seoDesc')} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="ml-3 text-gray-400">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <SEO title={t('history.seoTitle')} description={t('history.seoDesc')} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('common.back')}
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {t('history.title')}
          </h1>
          <div className="w-16" /> {/* 占位保持居中 */}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={fetchReadings}
              className="ml-auto text-red-400 hover:text-red-300 text-sm underline"
            >
              {t('common.retry')}
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {readings.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('history.empty')}</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              {t('history.emptyHint')}
            </p>
            <Link
              to="/draw"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              {t('history.goReading')}
            </Link>
          </motion.div>
        )}

        {/* Reading List */}
        {readings.length > 0 && (
          <div className="space-y-4">
            {paginatedReadings.map((reading, index) => (
              <motion.div
                key={reading._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/history/${reading._id}`}
                  className="block p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-800/70 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 问题 */}
                      <h3 className="text-white font-medium mb-2 truncate">
                        {reading.question || t('history.noQuestion')}
                      </h3>
                      
                      {/* 牌阵类型和时间 */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {getSpreadTypeName(reading.spreadType)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(reading.createdAt)}
                        </span>
                      </div>

                      {/* 牌面摘要 */}
                      <p className="text-gray-500 text-sm truncate">
                        {getSummary(reading)}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDelete(reading._id, e)}
                        disabled={deletingId === reading._id}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t('common.close')}
                      >
                        {deletingId === reading._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  {/* 牌面预览 */}
                  {reading.cards && reading.cards.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-hidden">
                      {reading.cards.slice(0, 5).map((_card, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-14 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 flex-shrink-0"
                        >
                          {idx + 1}
                        </div>
                      ))}
                      {reading.cards.length > 5 && (
                        <div className="w-10 h-14 bg-gray-700/30 rounded border border-gray-600/30 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                          +{reading.cards.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  {t('common.more')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
