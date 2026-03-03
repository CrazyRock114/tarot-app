import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Save, RotateCcw, ChevronLeft, Loader2 } from 'lucide-react';
import { tarotApi, ReadingResult } from '../api/tarot';
import { useAuth } from '../contexts/AuthContext';
import TarotCardComponent from '../components/tarot/TarotCard';
import type { DrawResult } from '../types';

interface LocationState {
  spreadType: string;
  spreadName: string;
  cards: DrawResult[];
  question: string;
  fromHistory?: boolean;
  reading?: ReadingResult;
}

const Interpretation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const state = location.state as LocationState;
  const [loading, setLoading] = useState(!state?.fromHistory);
  const [interpretation, setInterpretation] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [reading, setReading] = useState<ReadingResult | null>(state?.reading || null);
  
  const interpretationRef = useRef<HTMLDivElement>(null);

  // 从历史记录加载
  useEffect(() => {
    if (id && !state?.fromHistory) {
      const fetchReading = async () => {
        try {
          const response = await tarotApi.getReading(id);
          setReading(response.data);
          setInterpretation(response.data.interpretation || '');
          setLoading(false);
        } catch (err: any) {
          setError(err.response?.data?.message || '获取解读失败');
          setLoading(false);
        }
      };
      fetchReading();
    }
  }, [id, state]);

  // 流式获取AI解读
  useEffect(() => {
    if (state?.fromHistory || !state || id) return;

    const fetchInterpretation = async () => {
      setStreaming(true);
      try {
        const response = await tarotApi.interpret(
          state.spreadType,
          state.cards.map(c => ({
            card: {
              name: c.card.name,
              meanings: c.card.meanings,
            },
            orientation: c.orientation,
            position: c.position,
          })),
          state.question
        );

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  setStreaming(false);
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    setInterpretation(prev => prev + parsed.content);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        }
        
        setStreaming(false);
      } catch (err: any) {
        setError(err.message || '解读失败，请重试');
        setStreaming(false);
      }
    };

    fetchInterpretation();
  }, [state, id]);

  // 自动滚动到最新内容
  useEffect(() => {
    if (interpretationRef.current && streaming) {
      interpretationRef.current.scrollTop = interpretationRef.current.scrollHeight;
    }
  }, [interpretation, streaming]);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated || !state || saved) return;
    
    try {
      await tarotApi.saveReading({
        spreadType: state.spreadType,
        spreadName: state.spreadName,
        cards: state.cards.map(c => ({
          cardId: c.card.id,
          cardName: c.card.name,
          cardNameEn: c.card.nameEn,
          position: c.position,
          orientation: c.orientation,
          positionName: state.spreadType === 'single' ? '核心信息' : 
            ['过去', '现在', '未来'][c.position] || `位置 ${c.position + 1}`,
        })),
        question: state.question,
        interpretation,
      });
      setSaved(true);
    } catch (err) {
      console.error('保存失败:', err);
    }
  }, [isAuthenticated, state, interpretation, saved]);

  const handleNewReading = () => {
    navigate('/draw');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>加载中...</p>
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

  // 确定显示的数据
  const displayData = reading || state;
  if (!displayData) {
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

  const cards = displayData.cards || [];
  const question = displayData.question;
  const spreadName = (displayData as any).spreadName || '塔罗解读';

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
          
          <div className="flex gap-3">
            {!reading && isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saved || streaming}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saved ? '已保存' : '保存记录'}
              </motion.button>
            )}
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
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            {spreadName}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            问题：{question}
          </p>
        </div>

        {/* Cards Display */}
        <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">1</span>
            抽到的牌
          </h2>
          
          <div className={`grid gap-6 ${
            cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            cards.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
            cards.length >= 5 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {(reading ? cards.map((c: any) => ({
              card: {
                id: c.cardId,
                name: c.cardName,
                nameEn: c.cardNameEn,
                image: `/cards/card-${String(c.cardId).padStart(2, '0')}.jpg`,
                meanings: { upright: '', reversed: '' },
                keywords: { upright: [], reversed: [] },
                suit: 'major',
                arcana: 'major',
              } as any,
              position: c.position,
              orientation: c.orientation,
            })) : (state?.cards || [])).map((result: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: 180 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                {(result as any).positionName && (
                  <div className="mb-2">
                    <div className="text-indigo-400 text-sm font-medium">
                      {(result as any).positionName}
                    </div>
                  </div>
                )}
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
              {streaming && (
                <span className="text-sm font-normal text-indigo-400 animate-pulse">
                  解读中...
                </span>
              )}
            </h2>
          </div>

          <div
            ref={interpretationRef}
            className="bg-gray-900/50 rounded-xl p-6 min-h-[300px] max-h-[600px] overflow-y-auto"
          >
            {interpretation ? (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {interpretation}
                  {streaming && (
                    <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            ) : reading ? (
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {reading.interpretation}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>正在生成解读...</p>
              </div>
            )}
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
