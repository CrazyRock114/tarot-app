import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, ChevronLeft, Loader2 } from 'lucide-react';
import { tarotApi } from '../api/tarot';
import TarotCardComponent from '../components/tarot/TarotCard';
import type { DrawResult } from '../types';

interface LocationState {
  spreadType: string;
  spreadName: string;
  cards: DrawResult[];
  question: string;
}

const Interpretation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as LocationState;
  const [loading, setLoading] = useState(true);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState('');
  
  const interpretationRef = useRef<HTMLDivElement>(null);

  // 获取AI解读
  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

    const fetchInterpretation = async () => {
      try {
        const response = await tarotApi.getReading(
          state.spreadType,
          state.cards.map(c => ({
            card: {
              id: c.card.id.toString(),
              name: c.card.name,
              nameEn: c.card.nameEn,
              arcana: 'major',
              number: c.card.id,
              meaning: c.card.meanings?.upright || '',
            },
            position: c.position,
            orientation: c.orientation,
          })),
          state.question
        );

        const data = await response.json();
        setInterpretation(data.reading || '暂无解读');
        setLoading(false);
      } catch (err: any) {
        setError(err.message || '解读失败，请重试');
        setLoading(false);
      }
    };

    fetchInterpretation();
  }, [state]);

  const handleNewReading = () => {
    navigate('/draw');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">没有可显示的解读数据</p>
          <button
            onClick={() => navigate('/draw')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            去抽牌
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>AI 正在解读中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            返回
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewReading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            新占卜
          </motion.button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            {state.spreadName}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            问题：{state.question}
          </p>
        </div>

        {/* Cards Display */}
        <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">1</span>
            抽到的牌
          </h2>
          
          <div className={`grid gap-6 ${
            state.cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            state.cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {state.cards.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: 180 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <TarotCardComponent 
                  card={result.card} 
                  orientation={result.orientation}
                  size="md"
                  showDetails
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="bg-gray-800/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-sm">2</span>
              AI 深度解读
            </h2>
          </div>

          <div
            ref={interpretationRef}
            className="bg-gray-900/50 rounded-xl p-6 min-h-[300px] max-h-[600px] overflow-y-auto"
          >
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {interpretation}
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-lg">
            <p className="text-indigo-300 text-sm">
              💡 塔罗牌的解读仅供参考，最终的决策权在于你自己。相信自己的直觉和智慧。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interpretation;
