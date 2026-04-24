import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Dices, Hash, Sparkles, RotateCcw, ChevronRight, MessageCircle } from 'lucide-react';
import { getSpreads, getReaders } from '../../data/tarotData';
import { drawRandomCards, drawByNumber, drawYesNo } from '../../utils/tarotUtils';
import type { DrawResult, Spread } from '../../types';
import TarotCardComponent from './TarotCard';
import ShuffleAnimation from './ShuffleAnimation';

export const CardDrawing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 多语言牌阵和占卜师（自动跟随语言变化）
  const spreads = useMemo(() => getSpreads(t), [t]);
  const readerList = useMemo(() => getReaders(t).map(reader => ({
    id: reader.id,
    name: reader.name,
    emoji: reader.id === 'mystic' ? '🌙' : reader.id === 'rational' ? '📊' : reader.id === 'warm' ? '🌸' : '🔥',
    desc: t('home.aiReadingDesc'),
    color: reader.id === 'mystic' ? 'from-indigo-600 to-purple-600'
         : reader.id === 'rational' ? 'from-blue-600 to-cyan-600'
         : reader.id === 'warm' ? 'from-pink-500 to-rose-500'
         : 'from-orange-500 to-red-600',
    avatar: reader.avatar,
  })), [t]);

  const drawModes = [
    { id: 'random', name: t('draw.randomDraw'), icon: Shuffle, desc: t('draw.randomDrawDesc') },
    { id: 'number', name: t('draw.luckyNumber'), icon: Hash, desc: t('draw.luckyNumberDesc') },
    { id: 'yesno', name: t('draw.yesNo'), icon: Dices, desc: t('draw.yesNoDrawDesc') },
  ];
  const [selectedMode, setSelectedMode] = useState<string>('random');
  const [selectedSpread, setSelectedSpread] = useState<Spread>(spreads[0]);
  const [isShuffling, setIsShuffling] = useState(false);
  
  const [showAnimation, setShowAnimation] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawResult[] | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<string>('');
  const [yesNoResult, setYesNoResult] = useState<{ result: 'yes' | 'no' | 'maybe'; draw: DrawResult } | null>(null);
  const [question, setQuestion] = useState('');
  const [readingQuota, setReadingQuota] = useState<{ freeLeft: number; cost: number; points: number } | null>(null);
  const [selectedReader, setSelectedReader] = useState('mystic');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    fetch('/api/tarot/reading/check', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setReadingQuota(data); })
      .catch(() => {});
  }, []);

  const doActualDraw = useCallback(() => {
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
    setShowAnimation(false);
    setIsShuffling(false);
  }, [selectedMode, selectedSpread, luckyNumber]);

  const handleDraw = useCallback(async () => {
    setIsShuffling(true);
    setDrawnCards(null);
    setYesNoResult(null);
    
    // Show full-screen shuffle animation
    setShowAnimation(true);
  }, []);

  const reset = () => {
    setDrawnCards(null);
    setYesNoResult(null);
    setLuckyNumber('');
    setQuestion('');
  };

  const handleAIInterpret = () => {
    if (!drawnCards || !question.trim()) return;
    // Refresh quota after interpret
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/tarot/reading/check', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setReadingQuota(data); })
        .catch(() => {});
    }
    
    navigate('/interpretation', {
      state: {
        spreadType: selectedMode === 'yesno' ? 'single' : selectedSpread.id,
        spreadName: selectedMode === 'yesno' ? t('draw.yesNo') : selectedSpread.name,
        cards: drawnCards,
        question: question.trim(),
        yesNoResult: yesNoResult?.result || null,
        readerStyle: selectedReader,
        readerName: readerList.find(r => r.id === selectedReader)?.name || selectedReader,
      },
    });
  };

  const getYesNoDisplay = (result: 'yes' | 'no' | 'maybe') => {
    const displays = {
      yes: { text: t('interpretation.yes'), color: 'text-green-400', bg: 'bg-green-900/30', icon: '✓' },
      no: { text: t('interpretation.no'), color: 'text-red-400', bg: 'bg-red-900/30', icon: '✗' },
      maybe: { text: t('interpretation.maybe'), color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: '?' },
    };
    return displays[result];
  };

  const animCardCount = selectedMode === 'random' ? selectedSpread.cardCount : 1;

  return (
    <>
      <AnimatePresence>
        {showAnimation && (
          <ShuffleAnimation
            cardCount={animCardCount}
            onComplete={doActualDraw}
          />
        )}
      </AnimatePresence>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            {t('draw.title')}
          </h1>
          <p className="text-gray-400">{t('draw.selectSpread')}</p>
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

            {/* Question Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
            >
              <label className="block text-white font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-400" />
                {t('draw.enterQuestion')}
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
  placeholder={t('draw.questionPlaceholder')}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
              <p className="text-gray-500 text-sm mt-2">
                {t('draw.questionHint', 'Focus on your question, the cards will guide you')}
              </p>
            </motion.div>

            {/* Spread Selection (for random mode) */}
            {selectedMode === 'random' && (
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  {t('draw.selectSpread')}
                  <span className="text-sm font-normal text-gray-400">{t('draw.totalSpreads', { count: spreads.length })}</span>
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
                          <div className="text-white font-medium">{t('spreads.' + spread.id + '.name', spread.name)}</div>
                          <div className="text-gray-400 text-sm">{t('spreads.' + spread.id + '.description', spread.description)}</div>
                        </div>
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {spread.cardCount}{t('draw.cards')}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {(() => {
                          const translated = t('spreads.' + spread.id + '.suitableFor', { returnObjects: true });
                          const tags = Array.isArray(translated) ? translated : spread.suitableFor;
                          return tags.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="text-xs text-gray-500">#{tag}</span>
                          ));
                        })()}
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
                <label className="block text-white font-medium mb-3">{t('draw.luckyNumber')}</label>
                <input
                  type="number"
                  min={1}
                  max={78}
                  value={luckyNumber}
                  onChange={(e) => setLuckyNumber(e.target.value)}
                  placeholder={t('draw.luckyNumberPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-lg text-center placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-gray-500 text-sm mt-2 text-center">
                  {t('draw.cards')} 1-78
                </p>
              </motion.div>
            )}

            {/* Draw Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDraw}
              disabled={isShuffling || !question.trim() || (selectedMode === 'number' && (!luckyNumber || parseInt(luckyNumber) < 1 || parseInt(luckyNumber) > 78))}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isShuffling ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  {t('draw.drawing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {selectedMode === 'random' ? `${t('draw.startDraw')} (${t('spreads.' + selectedSpread.id + '.name', selectedSpread.name)})` : 
                   selectedMode === 'number' ? t('draw.startDraw') : t('draw.yesNo')}
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
            {/* Question Display */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">{t('interpretation.yourQuestion')}</p>
              <p className="text-white text-lg">{question}</p>
            </div>

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
                <h3 className="text-white font-semibold mb-4">{t('spreads.' + selectedSpread.id + '.name', selectedSpread.name)}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {selectedSpread.positions.map((pos) => (
                    <div key={pos.index} className="p-2 bg-gray-800/50 rounded text-center">
                      <div className="text-indigo-400 font-medium">{t('share.spread')} {pos.index + 1}</div>
                      <div className="text-gray-400 text-xs">{t('spreads.' + selectedSpread.id + '.positions.position' + pos.index + '.Name', pos.name)}</div>
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
                        {t('spreads.' + selectedSpread.id + '.positions.position' + index + '.Name', selectedSpread.positions[index].name)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {t('spreads.' + selectedSpread.id + '.positions.position' + index + '.meaning', selectedSpread.positions[index].meaning)}
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

            {/* Reader Selection */}
            <div className="mt-8 mb-4">
              <h3 className="text-center text-gray-400 text-sm mb-4">{t('draw.selectReader')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {readerList.map((reader) => (
                  <motion.button
                    key={reader.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedReader(reader.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      selectedReader === reader.id
                        ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10'
                        : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 border-2 border-gray-600 relative bg-gray-700">
                      <img
                        src={reader.avatar}
                        alt={reader.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="avatar-fallback hidden w-full h-full items-center justify-center text-2xl absolute inset-0">
                        {reader.emoji}
                      </div>
                    </div>
                    <div className="text-white text-sm font-medium">{reader.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{reader.desc}</div>
                    <a href={`/readers/${reader.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-purple-400 mt-1 hover:underline inline-block">{t('readers.viewDetail')} →</a>
                    {selectedReader === reader.id && (
                      <motion.div
                        layoutId="readerCheck"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs"
                      >✓</motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
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
                {t('draw.startDraw')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAIInterpret}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" />
                {t('interpretation.aiInterpretation')}
                {readingQuota && readingQuota.freeLeft <= 0 && <span className="text-xs opacity-75">(-{readingQuota.cost}{t('membership.pointsUnit')})</span>}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
            {readingQuota && (
              <div className="text-center mt-2">
                <span className="text-gray-500 text-xs">
                  {(readingQuota as any).anonymous
                    ? (readingQuota.freeLeft > 0 
                        ? t('draw.freeLeft', { count: readingQuota.freeLeft }) 
                        : t('draw.loginForMore'))
                    : (readingQuota.freeLeft > 0 
                        ? t('draw.freeLeft', { count: readingQuota.freeLeft }) 
                        : t('draw.costPoints', { cost: readingQuota.cost }))}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};

export default CardDrawing;
