import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TarotCard as TarotCardType } from '../../types';

interface TarotCardProps {
  card?: TarotCardType;
  isReversed?: boolean;
  orientation?: 'upright' | 'reversed';
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TarotCard: React.FC<TarotCardProps> = ({ 
  card, 
  isReversed = false,
  orientation,
  onClick, 
  className = "", 
  showDetails = true,
  size = 'md'
}) => {
  const { t } = useTranslation();
  
  // Use orientation prop if provided, otherwise fallback to isReversed
  const reversed = orientation ? orientation === 'reversed' : isReversed;

  const sizeClasses = {
    sm: 'w-24 aspect-[512/917]',
    md: 'w-32 sm:w-40 aspect-[512/917]',
    lg: 'w-48 sm:w-56 aspect-[512/917]'
  };

  if (!card) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-indigo-900/20 border-2 border-indigo-500/30 rounded-xl flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <div className="text-indigo-500/50 text-4xl">✦</div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, y: -5 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`relative cursor-pointer group ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative h-full w-full bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-800 group-hover:border-indigo-500/50 transition-colors duration-300 shadow-2xl">
        <div className={`w-full h-full ${reversed ? 'rotate-180' : ''}`}>
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {showDetails && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <div className="text-white font-bold text-sm truncate">{card.name}</div>
            <div className="text-gray-400 text-xs truncate mb-1">{card.nameEn}</div>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                card.suit === 'major' ? 'bg-purple-600/50 text-purple-200' :
                card.suit === 'wands' ? 'bg-orange-600/50 text-orange-200' :
                card.suit === 'cups' ? 'bg-blue-600/50 text-blue-200' :
                card.suit === 'swords' ? 'bg-cyan-600/50 text-cyan-200' :
                'bg-yellow-600/50 text-yellow-200'
              }`}>
                {card.suit}
              </span>
              {reversed && (
                <span className="text-[10px] text-amber-400 font-bold uppercase">{t('draw.reversed')}</span>
              )}
            </div>
          </div>
        )}
        {showDetails && reversed && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{t('draw.reversed')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TarotCard;
