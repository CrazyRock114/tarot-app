import React from 'react';
import { motion } from 'framer-motion';
import type { TarotCard, CardOrientation } from '../../types';
import { getCardMeaning, getCardKeywords } from '../../utils/tarotUtils';
import { getSuitName, getElementName } from '../../data/tarotData';

interface TarotCardProps {
  card: TarotCard;
  orientation?: CardOrientation;
  isFlipped?: boolean;
  isBack?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-28',
  md: 'w-24 h-40',
  lg: 'w-48 h-80',
};

export const TarotCardComponent: React.FC<TarotCardProps> = ({
  card,
  orientation = 'upright',
  isFlipped = false,
  isBack = false,
  onClick,
  size = 'md',
  showDetails = false,
  className = '',
}) => {
  const isReversed = orientation === 'reversed';

  if (isBack) {
    return (
      <motion.div
        className={`${sizeClasses[size]} relative cursor-pointer ${className}`}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 border-2 border-yellow-600/50 shadow-lg flex items-center justify-center">
          <div className="w-3/4 h-3/4 border border-yellow-600/30 rounded-lg flex items-center justify-center">
            <div className="text-yellow-600/50 text-4xl">✦</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`${className}`}>
      <motion.div
        className={`${sizeClasses[size]} relative cursor-pointer`}
        onClick={onClick}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Front */}
        <div
          className={`absolute inset-0 rounded-xl overflow-hidden shadow-xl bg-gray-900 ${
            isReversed ? 'rotate-180' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Image Placeholder */}
          <div className="w-full h-3/4 bg-gradient-to-b from-indigo-800 to-purple-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">
                {card.suit === 'major' ? '🔮' :
                 card.suit === 'wands' ? '🔥' :
                 card.suit === 'cups' ? '💧' :
                 card.suit === 'swords' ? '⚔️' : '💰'}
              </div>
              <div className="text-white/60 text-xs">{card.nameEn}</div>
            </div>
          </div>
          
          {/* Card Info */}
          <div className="h-1/4 bg-gray-900 p-2 flex flex-col justify-center">
            <div className="text-white text-sm font-medium truncate">{card.name}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{getSuitName(card.suit)}</span>
              {isReversed && <span className="text-xs text-amber-400">逆位</span>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-800/50 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{card.name}</h3>
            {isReversed && (
              <span className="px-2 py-0.5 text-xs bg-amber-600/30 text-amber-300 rounded">逆位</span>
            )}
          </div>
          
          <div className="flex gap-2 mb-3 text-xs">
            <span className="text-gray-400">{getSuitName(card.suit)}</span>
            {card.element && <span className="text-gray-500">•</span>}
            {card.element && <span className="text-purple-400">{getElementName(card.element)}</span>}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {getCardKeywords(card, orientation).map((keyword, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-indigo-600/30 text-indigo-300 rounded">
                {keyword}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            {getCardMeaning(card, orientation)}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TarotCardComponent;
