import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface ShuffleAnimationProps {
  cardCount: number;
  onComplete: () => void;
}

const CardBack = ({ onClick, glowing = false }: {
  onClick?: () => void;
  glowing?: boolean;
}) => (
  <div
    className={`relative select-none ${onClick ? 'cursor-pointer' : ''}`}
    style={{ width: 64, height: 100 }}
    onClick={onClick}
  >
    <div className={`w-full h-full rounded-lg border-2 ${glowing ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-600/60'} bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden`}>
      <div className="absolute inset-1 border border-purple-500/30 rounded-md" />
      <div className="absolute inset-2 border border-purple-400/20 rounded-sm" />
      <div className="text-xl text-purple-400/60">✦</div>
      {glowing && (
        <motion.div
          className="absolute inset-0 bg-yellow-400/10 rounded-lg"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  </div>
);

type Phase = 'gather' | 'shuffle' | 'spread' | 'done';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ShuffleAnimation = ({ cardCount, onComplete }: ShuffleAnimationProps) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('gather');
  const [message, setMessage] = useState('');
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);

  const totalFanCards = Math.max(13, cardCount + 8);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setMessage(t('shuffle.gatherHint'));
      await delay(2200);
      if (cancelled) return;
      
      setPhase('shuffle');
      setMessage(t('shuffle.shuffleHint'));
      await delay(2800);
      if (cancelled) return;
      
      setPhase('spread');
      setMessage(t('shuffle.selectHint', { count: cardCount }));
    };
    run();
    return () => { cancelled = true; };
  }, [cardCount]);

  const handlePick = useCallback((index: number) => {
    if (pickedIndices.includes(index) || phase !== 'spread') return;
    const newPicked = [...pickedIndices, index];
    setPickedIndices(newPicked);
    
    const remaining = cardCount - newPicked.length;
    if (remaining > 0) {
      setMessage(t('shuffle.selected', { current: newPicked.length, total: cardCount }));
    } else {
      setMessage('✦ ' + t('shuffle.selectHint', { count: cardCount }) + ' ✦');
      setPhase('done');
      setTimeout(onComplete, 1500);
    }
  }, [pickedIndices, cardCount, onComplete, phase]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -120],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-purple-300 text-lg mb-10 text-center z-10 px-6 font-medium"
        >
          {message}
        </motion.div>
      </AnimatePresence>

      {/* Card Area */}
      <div className="relative z-10" style={{ width: '90vw', maxWidth: 420, height: 280 }}>
        {/* Gather Phase */}
        {phase === 'gather' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 300,
                  rotate: Math.random() * 360,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  x: i * 2 - 6,
                  y: i * 1.5 - 5,
                  rotate: (Math.random() - 0.5) * 6,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
              >
                <CardBack />
              </motion.div>
            ))}
          </div>
        )}

        {/* Shuffle Phase */}
        {phase === 'shuffle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  x: [0, i % 2 === 0 ? 50 : -50, 0, i % 2 === 0 ? -40 : 40, i * 2 - 6],
                  y: [-5, -25, 15, -15, i * 1.5 - 5],
                  rotate: [0, 15 * (i % 2 === 0 ? 1 : -1), 0, -10 * (i % 2 === 0 ? 1 : -1), 0],
                }}
                transition={{
                  duration: 2.2,
                  ease: 'easeInOut',
                  repeat: 1,
                }}
              >
                <CardBack />
              </motion.div>
            ))}
          </div>
        )}

        {/* Spread & Pick Phase */}
        {(phase === 'spread' || phase === 'done') && (
          <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: 10 }}>
            {[...Array(totalFanCards)].map((_, i) => {
              const isPicked = pickedIndices.includes(i);
              const angle = -40 + (80 / (totalFanCards - 1)) * i;
              const rad = (angle * Math.PI) / 180;
              const radius = 180;
              const x = Math.sin(rad) * radius;
              const y = -Math.cos(rad) * radius + radius - 20;
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ transformOrigin: 'bottom center', zIndex: isPicked ? 20 : i }}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={{
                    x,
                    y: isPicked ? y - 50 : y,
                    rotate: angle,
                    opacity: isPicked && phase === 'done' ? 0 : 1,
                    scale: isPicked ? 1.15 : 1,
                  }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
                  whileHover={phase === 'spread' && !isPicked ? { y: y - 15, scale: 1.08 } : undefined}
                >
                  <CardBack
                    onClick={phase === 'spread' && !isPicked ? () => handlePick(i) : undefined}
                    glowing={isPicked}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress */}
      {(phase === 'spread' || phase === 'done') && (
        <div className="mt-8 flex gap-2 z-10">
          {[...Array(cardCount)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full border ${
                i < pickedIndices.length
                  ? 'bg-yellow-400 border-yellow-400'
                  : 'bg-transparent border-gray-600'
              }`}
              animate={i < pickedIndices.length ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Skip */}
      {phase !== 'done' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 4 }}
          whileHover={{ opacity: 0.8 }}
          onClick={onComplete}
          className="mt-8 text-gray-600 text-xs hover:text-gray-400 transition-colors z-10"
        >
          {t('shuffle.skip')} →
        </motion.button>
      )}
    </motion.div>
  );
};

export default ShuffleAnimation;
