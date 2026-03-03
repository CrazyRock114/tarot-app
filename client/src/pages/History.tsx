import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { tarotApi, ReadingResult } from '../api/tarot';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const { isAuthenticated } = useAuth();
  const [readings, setReadings] = useState<ReadingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchReadings = async () => {
      try {
        const response = await tarotApi.getReadings();
        setReadings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '获取历史记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await tarotApi.deleteReading(id);
      setReadings(readings.filter(r => r.id !== id));
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const spreadNames: Record<string, string> = {
    single: '单张牌',
    'three-card': '三张牌',
    'celtic-cross': '凯尔特十字',
    relationship: '关系牌阵',
    decision: '决策牌阵',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">请先登录</h1>
          <p className="text-gray-400 mb-6">登录后可查看您的占卜历史记录</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <p className="mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">暂无占卜记录</h1>
          <p className="text-gray-400 mb-6">您还没有进行过塔罗占卜</p>
          <Link
            to="/draw"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            开始占卜
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          占卜历史
        </h1>

        <div className="space-y-4">
          {readings.map((reading, index) => (
            <motion.div
              key={reading.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/interpretation/${reading.id}`}
                state={{ fromHistory: true, reading }}
                className="block bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded-full">
                        {spreadNames[reading.spreadType] || reading.spreadType}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(reading.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">
                      {reading.question.length > 60
                        ? reading.question.slice(0, 60) + '...'
                        : reading.question}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span>{reading.cards?.length || 0} 张牌</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(reading.id, e)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
