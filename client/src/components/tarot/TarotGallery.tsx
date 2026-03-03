import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { allCards, getSuitName } from '../../data/tarotData';
import type { TarotCard, CardSuit } from '../../types';
import TarotCardComponent from './TarotCard';

const suits: { id: CardSuit | 'all'; name: string; icon: string }[] = [
  { id: 'all', name: '全部', icon: '✨' },
  { id: 'major', name: '大阿尔克那', icon: '🔮' },
  { id: 'wands', name: '权杖', icon: '🔥' },
  { id: 'cups', name: '圣杯', icon: '💧' },
  { id: 'swords', name: '宝剑', icon: '⚔️' },
  { id: 'coins', name: '星币', icon: '💰' },
];

export const TarotGallery: React.FC = () => {
  const [selectedSuit, setSelectedSuit] = useState<CardSuit | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesSuit = selectedSuit === 'all' || card.suit === selectedSuit;
      const matchesSearch = 
        searchQuery === '' ||
        card.name.includes(searchQuery) ||
        card.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.keywords.upright.some(k => k.includes(searchQuery));
      return matchesSuit && matchesSearch;
    });
  }, [selectedSuit, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                塔罗图鉴
              </h1>
              <p className="text-gray-400 text-sm mt-1">探索78张塔罗牌的奥秘</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索牌名或关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {suits.map((suit) => (
              <button
                key={suit.id}
                onClick={() => setSelectedSuit(suit.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedSuit === suit.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{suit.icon}</span>
                <span>{suit.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-gray-400 text-sm mb-4">
          共 {filteredCards.length} 张牌
        </div>
        
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <AnimatePresence mode='popLayout'>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer"
              >
                <TarotCardComponent card={card} size="md" />
                <div className="mt-2 text-center">
                  <div className="text-white text-sm font-medium truncate">{card.name}</div>
                  <div className="text-gray-500 text-xs">{getSuitName(card.suit)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCards.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400">没有找到匹配的牌</p>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Card Image */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <TarotCardComponent card={selectedCard} size="lg" />
                  </div>

                  {/* Card Info */}
                  <div className="flex-1">
                    {/* Basic Info */}
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-1">{selectedCard.nameEn}</div>
                      <div className="flex gap-2 text-sm">
                        <span className="px-2 py-1 bg-indigo-600/30 text-indigo-300 rounded">
                          {getSuitName(selectedCard.suit)}
                        </span>
                        {selectedCard.element && (
                          <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded">
                            {selectedCard.element}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-2">牌面描述</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {selectedCard.description}
                      </p>
                    </div>

                    {/* Upright Meaning */}
                    <div className="mb-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400 font-semibold">正位</span>
                        <div className="flex gap-1">
                          {selectedCard.keywords.upright.map((k, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-green-800/50 text-green-300 rounded">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{selectedCard.meanings.upright}</p>
                    </div>

                    {/* Reversed Meaning */}
                    <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 font-semibold">逆位</span>
                        <div className="flex gap-1">
                          {selectedCard.keywords.reversed.map((k, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-red-800/50 text-red-300 rounded">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{selectedCard.meanings.reversed}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TarotGallery;
