import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Dices, Hash, Sparkles, RotateCcw, ChevronRight } from 'lucide-react';
import { spreads } from '../../data/tarotData';
import { drawRandomCards, drawByNumber, drawYesNo } from '../../utils/tarotUtils';
import type { DrawResult, Spread } from '../../types';
import TarotCardComponent from './TarotCard';

const drawModes = [
  { id: 'random', name: '随机抽牌', icon: Shuffle, desc: '模拟真实洗牌抽牌，带动态翻牌效果' },
  { id: 'number', name: '幸运数字', icon: Hash, desc: '输入1-78数字，关联选牌' },
  { id: 'yesno', name: 'Yes/No', icon: Dices, desc: '针对简单问题快速决策' },
];

export const CardDrawing: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string>('random');
  const [selectedSpread, setSelectedSpread] = useState<Spread>(spreads[0]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawResult[] | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<string>('');
  const [yesNoResult, setYesNoResult] = useState<{ result: 'yes' | 'no' | 'maybe'; draw: DrawResult } | null>(null);

  const handleDraw = useCallback(async () => {
    setIsShuffling(true);
    setDrawnCards(null);
    setYesNoResult(null);

    // 模拟洗牌动画
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (selectedMode === 'random') {
      const cards = drawRandomCards(selectedSpread.cardCount);
      setDrawnCards(cards);
    } else if (selectedMode === 'number') {
      const num = parseInt(luckyNumber);
      if (num >= 1 && num <= 78) {
        const draw = drawByNumber(num);
        if (draw) setDrawnCards([draw]);
      }
    } else if (selectedMode === 'yesno') {
      const result = drawYesNo();
      setYesNoResult(result);
      setDrawnCards([result.draw]);
    }

    setIsShuffling(false);
  }, [selectedMode, selectedSpread, luckyNumber]);

  const reset = () => {
    setDrawnCards(null);
    setYesNoResult(null);
    setLuckyNumber('');
  };

  const getYesNoDisplay = (result: 'yes' | 'no' | 'maybe') => {
    const displays = {
      yes: { text: '是 / YES', color: 'text-green-400', bg: 'bg-green-900/30', icon: '✓' },
      no: { text: '否 / NO', color: 'text-red-400', bg: 'bg-red-900/30', icon: '✗' },
      maybe: { text: '可能 / MAYBE', color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: '?' },
    };
    return displays[result];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            塔罗抽牌
          </h1>
          <p className="text-gray-400">选择抽牌方式，探索命运的指引</p>
        </div>

        {!drawnCards ? (
          <>
            {/* Mode Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {drawModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-colors ${
                      selectedMode === mode.id
                        ? 'border-indigo-500 bg-indigo-600/20'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        selectedMode === mode.id ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold">{mode.name}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{mode.desc}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Spread Selection (for random mode) */}
            {selectedMode === 'random' && (
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  选择牌阵
                  <span className="text-sm font-normal text-gray-400">共 {spreads.length} 种</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {spreads.map((spread) => (
                    <button
                      key={spread.id}
                      onClick={() => setSelectedSpread(spread)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedSpread.id === spread.id
                          ? 'border-indigo-500 bg-indigo-600/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{spread.name}</div>
                          <div className="text-gray-400 text-sm">{spread.description}</div>
                        </div>
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {spread.cardCount}张
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {spread.suitableFor.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-500">#{tag}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lucky Number Input */}
            {selectedMode === 'number' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
              >
                <label className="block text-white font-medium mb-3">输入你的幸运数字 (1-78)</label>
                <input
                  type="number"
                  min={1}
                  max={78}
                  value={luckyNumber}
                  onChange={(e) => setLuckyNumber(e.target.value)}
                  placeholder="例如：7, 22, 56..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg text-center placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-gray-500 text-sm mt-2 text-center">
                  塔罗牌共78张，大阿尔克那1-22，小阿尔克那23-78
                </p>
              </motion.div>
            )}

            {/* Draw Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDraw}
              disabled={isShuffling || (selectedMode === 'number' && (!luckyNumber || parseInt(luckyNumber) < 1 || parseInt(luckyNumber) > 78))}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isShuffling ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.div>
                  正在洗牌...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {selectedMode === 'random' ? `开始抽牌 (${selectedSpread.name})` : 
                   selectedMode === 'number' ? '抽取对应牌' : '寻求答案'}
                </>
              )}
            </motion.button>
          </>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Yes/No Result */}
            {yesNoResult && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`inline-block px-8 py-4 rounded-2xl ${getYesNoDisplay(yesNoResult.result).bg} border border-gray-700`}
                >
                  <div className="text-4xl mb-2">{getYesNoDisplay(yesNoResult.result).icon}</div>
                  <div className={`text-3xl font-bold ${getYesNoDisplay(yesNoResult.result).color}`}>
                    {getYesNoDisplay(yesNoResult.result).text}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Spread Positions */}
            {selectedMode === 'random' && selectedSpread.positions.length > 1 && (
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4">{selectedSpread.name} 牌阵</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {selectedSpread.positions.map((pos) => (
                    <div key={pos.index} className="p-2 bg-gray-800/50 rounded text-center">
                      <div className="text-indigo-400 font-medium">位置 {pos.index + 1}</div>
                      <div className="text-gray-400 text-xs">{pos.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawn Cards */}
            <div className={`grid gap-6 ${
              drawnCards.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
              drawnCards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              drawnCards.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
              drawnCards.length === 5 ? 'grid-cols-2 md:grid-cols-5' :
              'grid-cols-2 md:grid-cols-5'
            }`}>
              {drawnCards.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.3, duration: 0.6 }}
                  className="text-center"
                >
                  {selectedMode === 'random' && selectedSpread.positions[index] && (
                    <div className="mb-2">
                      <div className="text-indigo-400 text-sm font-medium">
                        {selectedSpread.positions[index].name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {selectedSpread.positions[index].meaning}
                      </div>
                    </div>
                  )}
                  <TarotCardComponent 
                    card={result.card} 
                    orientation={result.orientation}
                    size="lg"
                    showDetails
                  />
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重新抽牌
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI深度解读
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CardDrawing;
