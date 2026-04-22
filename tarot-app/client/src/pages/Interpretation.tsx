import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, ChevronLeft, Loader2, CheckCircle, Share2, Check, MessageCircle, Send, Lock, ChevronDown } from 'lucide-react';
import { tarotApi } from '../api/tarot';
import { followUpStream } from '../api/tarot';
import TarotCardComponent from '../components/tarot/TarotCard';
import { useAuth } from '../contexts/AuthContext';
import ShareImage from '../components/ShareImage';
import VoiceReader from '../components/VoiceReader';
import type { DrawResult } from '../types';

interface LocationState {
  spreadType: string;
  spreadName: string;
  cards: DrawResult[];
  question: string;
  yesNoResult?: 'yes' | 'no' | 'maybe' | null;
  readerStyle?: string;
  readerName?: string;
}

const Interpretation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const state = location.state as LocationState;
  const [loading, setLoading] = useState(true);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareImage, setShowShareImage] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const interpretationRef = useRef<HTMLDivElement>(null);
  
  // Follow-up state
  const [followUps, setFollowUps] = useState<Array<{ question: string; answer: string }>>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpError, setFollowUpError] = useState('');
  const followUpRef = useRef<HTMLDivElement>(null);

  // 分享功能
  const handleShare = async () => {
    if (!readingId || sharing) return;
    setSharing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/share/create/${readingId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(t('errors.shareFailed'));
      const data = await res.json();
      const url = `${window.location.origin}/share/${data.shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setShowShareImage(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };


  // 追问功能
  const handleFollowUp = async () => {
    if (!followUpInput.trim() || !readingId || followUpLoading) return;
    if (!user) {
      setFollowUpError(t('interpretation.followUpLogin'));
      return;
    }
    
    const question = followUpInput.trim();
    setFollowUpInput('');
    setFollowUpLoading(true);
    setFollowUpAnswer('');
    setFollowUpError('');
    
    try {
      const result = await followUpStream(
        readingId,
        question,
        (streamText) => {
          setFollowUpAnswer(streamText);
        },
      );
      
      // Add to follow-ups list
      setFollowUps(prev => [...prev, { question, answer: result.answer }]);
      setFollowUpAnswer('');
      
      // Scroll to bottom
      setTimeout(() => {
        followUpRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setFollowUpError(err.message || t('errors.followUpFailed'));
    } finally {
      setFollowUpLoading(false);
    }
  };

  // 获取AI解读
  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

    const fetchInterpretation = async () => {
      try {
        setLoading(false); // 立即显示页面，流式填充内容
        setInterpretation('');
        
        const data = await tarotApi.getReadingStream(
          state.spreadType,
          state.cards.map(c => ({
            card: {
              id: c.card.id.toString(),
              name: c.card.name,
              nameEn: c.card.nameEn,
              suit: c.card.suit || '',
              arcana: c.card.arcana || (c.card.suit === 'major' ? 'major' : 'minor'),
              image: c.card.image || '',
              number: c.card.number ?? c.card.id,
              meaning: c.orientation === 'reversed'
                ? (c.card.meanings?.reversed || c.card.meanings?.upright || '')
                : (c.card.meanings?.upright || ''),
              meaningEn: c.orientation === 'reversed'
                ? ((c.card as any).meaningsEn?.reversed || (c.card as any).meaningsEn?.upright || '')
                : ((c.card as any).meaningsEn?.upright || ''),
            },
            position: c.position,
            orientation: c.orientation,
          })),
          state.question,
          true,
          user?.id,
          (streamText) => {
            setInterpretation(streamText);
          },
          state.yesNoResult,
          state.readerStyle,
        );

        setInterpretation(data.reading || t('interpretation.noInterpretation'));
        if (data.readingId) {
          setSaved(true);
          setReadingId(data.readingId);
        }
      } catch (err: any) {
        console.error('Fetch interpretation error:', err);
        setError(err.message || t('errors.interpretationFailed'));
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
          <p className="text-gray-400">{t("common.loading")}</p>
          <button
            onClick={() => navigate('/draw')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            {t('draw.startDraw')}
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
          <p>{t('interpretation.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    const needRegister = /注册|register|login|登録|ログイン|가입|로그인/i.test(error);
    const needPoints = /积分|points|ポイント|포인트/i.test(error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-8 mb-6">
            <div className="text-4xl mb-4">{needRegister ? '🔮' : needPoints ? '💰' : '⚠️'}</div>
            <div className="text-white text-lg font-medium mb-2">
              {needRegister ? t('common.error') : needPoints ? t('common.error') : t('common.error')}
            </div>
            <div className="text-gray-400">{error}</div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </button>
            {needRegister && (
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                {t('register.title')} →
              </button>
            )}
            {needPoints && (
              <button
                onClick={() => navigate('/points')}
                className="px-5 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                {t('points.title')} →
              </button>
            )}
          </div>
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
            {t('common.back')}
          </button>

          <div className="flex items-center gap-3">
            {/* Saved indicator */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {t('common.save')}
              </motion.div>
            )}


            {/* Share Button */}
            {readingId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : shareCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {shareCopied ? t('interpretation.shareSuccess') : t('interpretation.share')}
              </motion.button>
            )}
            {shareUrl && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full text-xs text-gray-400 max-w-xs truncate">
                {shareUrl}
              </div>
            )}
          
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewReading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('draw.title')}
            </motion.button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            {state.spreadName}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('interpretation.yourQuestion')}：{state.question}
          </p>
          {state.readerName && (
            <p className="text-purple-400 text-sm mt-2">
              🔮 {t('interpretation.readingBy', { reader: state.readerName })}
            </p>
          )}
          {state.yesNoResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4"
            >
              <span className={`inline-block px-8 py-3 rounded-2xl text-2xl font-bold ${
                state.yesNoResult === 'yes' ? 'bg-green-900/30 text-green-400 border border-green-600/30' :
                state.yesNoResult === 'no' ? 'bg-red-900/30 text-red-400 border border-red-600/30' :
                'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
              }`}>
                {state.yesNoResult === 'yes' ? '✓ ' + t('interpretation.yes') :
                 state.yesNoResult === 'no' ? '✗ ' + t('interpretation.no') :
                 '? ' + t('interpretation.maybe')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Cards Display */}
        <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">1</span>
            {t('interpretation.yourCards')}
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

        {/* Scroll hint - compact, fades after delay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center justify-center gap-2 py-2 text-purple-400/70 cursor-pointer"
          onClick={() => interpretationRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
          <span className="text-xs">{t('interpretation.scrollDown')}</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>

        {/* AI Interpretation */}
        <div className="bg-gray-800/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-sm">2</span>
              {t('interpretation.aiInterpretation')}
            </h2>
            <VoiceReader text={interpretation} readerStyle={state.readerStyle || 'mystic'} ready={!!readingId} />
          </div>

          <div
            ref={interpretationRef}
            className="bg-gray-900/50 rounded-xl p-6 h-[500px] overflow-y-auto scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed break-words">
                {interpretation || (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('interpretation.loading')}
                  </div>
                )}
                {interpretation && !readingId && (
                  <span className="inline-block w-2 h-5 bg-purple-400 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-lg">
            <p className="text-indigo-300 text-sm">
              💡 {t('interpretation.aiInterpretation')}
            </p>
          </div>
        </div>

        {/* Follow-up Questions Section */}
        {readingId && (
          <div className="bg-gray-800/30 rounded-2xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              {t('interpretation.followUp')}
            </h2>
            
            {/* Previous follow-ups */}
            {followUps.length > 0 && (
              <div className="space-y-4 mb-4">
                {followUps.map((fu, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-indigo-600/30 border border-indigo-500/20 rounded-xl px-4 py-2.5 max-w-[80%]">
                        <p className="text-indigo-200 text-sm">{fu.question}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-700/50 border border-gray-600/20 rounded-xl px-4 py-2.5 max-w-[80%]">
                        <p className="text-gray-200 text-sm whitespace-pre-wrap">{fu.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Streaming answer */}
            {followUpLoading && followUpAnswer && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 border border-gray-600/20 rounded-xl px-4 py-2.5 max-w-[80%]">
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">
                      {followUpAnswer}
                      <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-text-bottom" />
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {followUpError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-600/20 rounded-lg text-red-400 text-sm">
                {followUpError}
              </div>
            )}
            
            {/* Input area */}
            {user ? (
              <div className="flex gap-2" ref={followUpRef}>
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleFollowUp()}
                  placeholder={t('interpretation.followUpPlaceholder')}
                  disabled={followUpLoading}
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollowUp}
                  disabled={!followUpInput.trim() || followUpLoading}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {followUpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-xl text-gray-500">
                <Lock className="w-4 h-4" />
                <span className="text-sm">{t('interpretation.followUpLogin')}</span>
                <button
                  onClick={() => navigate('/login')}
                  className="ml-auto text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t('nav.login')} →
                </button>
              </div>
            )}
            
            <p className="text-gray-600 text-xs mt-2">
              💡 {t('interpretation.followUpCost')}
            </p>
          </div>
        )}
        {/* Share Image Modal */}
        <ShareImage
          visible={showShareImage}
          onClose={() => setShowShareImage(false)}
          shareUrl={shareUrl}
          question={state.question}
          spreadName={state.spreadName}
          readerName={state.readerName}
          interpretation={interpretation}
          cards={state.cards.map(c => ({
            name: c.card.name,
            orientation: c.orientation,
            image: c.card.image,
          }))}
        />
      </div>
    </div>
  );
};

export default Interpretation;
