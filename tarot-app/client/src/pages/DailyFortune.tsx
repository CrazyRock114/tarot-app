import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, Briefcase, Coins, Activity, Sparkles, Star, ChevronRight, History, Save } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

interface FortuneData {
  zodiac: string;
  zodiacEn: string;
  zodiacJa?: string;
  zodiacKo?: string;
  zodiacTw?: string;
  date: string;
  cardName: string;
  cardNameEn: string;
  cardNameJa?: string;
  cardNameKo?: string;
  cardNameTw?: string;
  cardImage: string;
  cardOrientation: string;
  fortune: string;
  scores: { overall: number; love: number; career: number; wealth: number; health: number };
  luckyNumber: number;
  luckyColor: string;
  advice: string;
}

interface FortuneHistory {
  date: string;
  zodiac: string;
  cardName: string;
  cardImage: string;
  cardOrientation: string;
  overall: number;
  advice: string;
}

const getZodiacEmoji = (zodiac: string) => {
  const map: Record<string, string> = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
    '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋', '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏', '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓',
    '牡羊座': '♈', '牡牛座': '♉', '蟹座': '♋', '乙女座': '♍', '山羊座': '♑', '魚座': '♓',
    '양자리': '♈', '황소자리': '♉', '쌍둥이자리': '♊', '게자리': '♋', '사자자리': '♌', '처녀자리': '♍', '천칭자리': '♎', '전갈자리': '♏', '궁수자리': '♐', '염소자리': '♑', '물병자리': '♒', '물고기자리': '♓'
  };
  return map[zodiac] || '⭐';
};

const ScoreBar = ({ label, score, icon: Icon, textColor, bgColor }: { label: string; score: number; icon: any; textColor: string; bgColor: string }) => (
  <div className="flex items-center gap-3">
    <Icon className={`w-4 h-4 ${textColor} flex-shrink-0`} />
    <span className="text-gray-400 text-sm w-12">{label}</span>
    <div className="flex-1 flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-2.5 flex-1 rounded-full transition-all ${i <= score ? bgColor : 'bg-gray-700'}`} />
      ))}
    </div>
    <span className={`text-sm font-medium ${textColor}`}>{score}/5</span>
  </div>
);

const DailyFortune = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';
  const isTw = i18n.language === 'zh-TW';
  const isJa = i18n.language === 'ja';
  const isKo = i18n.language === 'ko';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [birthday, setBirthday] = useState('');
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [error, setError] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<FortuneHistory[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);

  // Auto-load birthday from user profile or localStorage
  useEffect(() => {
    const savedBirthday = user?.birthday || localStorage.getItem('tarot_birthday') || '';
    if (savedBirthday) {
      setBirthday(savedBirthday);
      setAutoLoading(true);
      fetchFortune(savedBirthday);
    }
  }, [user]);

  // 语言切换时重新获取运势（后端会返回对应语言的缓存）
  useEffect(() => {
    if (fortune && birthday) {
      fetchFortune(birthday);
    }
  }, [i18n.language]);

  const fetchFortune = async (bday: string) => {
    setStep('loading');
    setError('');
    
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch('/api/daily-fortune', {
        method: 'POST',
        headers,
        body: JSON.stringify({ birthday: bday }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t('errors.getFortuneFailed'));
      }
      
      const data = await res.json();
      setFortune(data);
      setStep('result');
      setTimeout(() => setCardFlipped(true), 800);
    } catch (e: any) {
      setError(e.message);
      setStep('input');
    } finally {
      setAutoLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!birthday) return;
    
    // Save birthday
    localStorage.setItem('tarot_birthday', birthday);
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      try {
        await fetch('/api/user/birthday', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } as any,
          body: JSON.stringify({ birthday }),
        });
      } catch (e) { /* silent */ }
    }
    
    fetchFortune(birthday);
  };

  const loadHistory = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fortune-history', {
        headers: { 'Authorization': `Bearer ${token}` } as any,
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        setShowHistory(true);
      }
    } catch (e) { /* silent */ }
  };

  const changeBirthday = () => {
    setStep('input');
    setFortune(null);
    setCardFlipped(false);
    localStorage.removeItem('tarot_birthday');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 py-8 px-4">
      <SEO title={t('fortune.title')} description={t('fortune.seoDesc')} />
      
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Birthday Input */}
          {step === 'input' && !autoLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🔮</div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('fortune.title')}</h1>
              <p className="text-gray-400 mb-8">{t('fortune.subtitle')}</p>

              <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50 max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span className="text-gray-300">{t('fortune.birthdayLabel')}</span>
                </div>
                
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 [color-scheme:dark]"
                />
                
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                
                <button
                  onClick={handleSubmit}
                  disabled={!birthday}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('fortune.getToday')}
                </button>

                {isAuthenticated && (
                  <p className="text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
                    <Save className="w-3 h-3" />
                    {t('fortune.save')}
                  </p>
                )}
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                {[
                  { step: '1', title: t('fortune.setBirthday'), desc: t('fortune.subtitle') },
                  { step: '2', title: t('fortune.title'), desc: t('fortune.subtitle') },
                  { step: '3', title: t('fortune.advice'), desc: t('fortune.subtitle') },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-gray-800/20 rounded-xl p-5"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                      {item.step}
                    </div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Loading */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 border-2 border-indigo-400 border-t-transparent rounded-full"
              />
              <p className="text-gray-300 text-lg">{t('fortune.generating')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('fortune.generating')}</p>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && fortune && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-2">
                  {getZodiacEmoji(fortune.zodiacEn) || '⭐'}
                </motion.div>
                <h1 className="text-2xl font-bold text-white">{isZh ? fortune.zodiac : (isTw ? (fortune.zodiacTw || fortune.zodiac) : (isJa ? (fortune.zodiacJa || fortune.zodiacEn) : (isKo ? (fortune.zodiacKo || fortune.zodiacEn) : fortune.zodiacEn)))} {t('fortune.title')}</h1>
                <p className="text-gray-400 text-sm mt-1">{fortune.date}</p>
              </div>

              {/* Card */}
              <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: cardFlipped ? 0 : 180 }}
                transition={{ duration: 0.8 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-48 aspect-[512/917] sm:w-56 mx-auto cursor-pointer"
                onClick={() => setCardFlipped(!cardFlipped)}
              >
                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30" style={{ backfaceVisibility: 'hidden' }}>
                    <div className={fortune.cardOrientation === 'reversed' || fortune.cardOrientation?.toLowerCase().includes('reverse') ? 'w-full h-full rotate-180' : 'w-full h-full'}>
                      <img src={fortune.cardImage} alt={fortune.cardName} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 border-2 border-yellow-600/50 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="text-yellow-600/50 text-6xl">✦</div>
                  </div>
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-white font-medium">{isZh ? fortune.cardName : (isTw ? (fortune.cardNameTw || fortune.cardName) : (isJa ? (fortune.cardNameJa || fortune.cardNameEn) : (isKo ? (fortune.cardNameKo || fortune.cardNameEn) : fortune.cardNameEn)))} · {t(`draw.${fortune.cardOrientation === 'reversed' || fortune.cardOrientation?.toLowerCase().includes('reverse') ? 'reversed' : 'upright'}`)}</p>
                <p className="text-gray-500 text-xs">{(isZh || isTw) ? fortune.cardNameEn : fortune.cardName}</p>
              </div>

              {/* Fortune */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                <p className="text-gray-200 leading-relaxed">{fortune.fortune}</p>
              </motion.div>

              {/* Scores */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 space-y-4">
                <h2 className="text-white font-semibold mb-2">{t('fortune.overallFortune')}</h2>
                <ScoreBar label={t('fortune.overallFortune')} score={fortune.scores.overall} icon={Star} textColor="text-purple-400" bgColor="bg-purple-400" />
                <ScoreBar label={t('fortune.love')} score={fortune.scores.love} icon={Heart} textColor="text-pink-400" bgColor="bg-pink-400" />
                <ScoreBar label={t('fortune.career')} score={fortune.scores.career} icon={Briefcase} textColor="text-blue-400" bgColor="bg-blue-400" />
                <ScoreBar label={t('fortune.wealth')} score={fortune.scores.wealth} icon={Coins} textColor="text-yellow-400" bgColor="bg-yellow-400" />
                <ScoreBar label={t('fortune.health')} score={fortune.scores.health} icon={Activity} textColor="text-green-400" bgColor="bg-green-400" />
              </motion.div>

              {/* Lucky */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 text-center">
                  <p className="text-gray-500 text-xs mb-1">{t("fortune.luckyNumber")}</p>
                  <p className="text-2xl font-bold text-yellow-400">{fortune.luckyNumber}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 text-center">
                  <p className="text-gray-500 text-xs mb-1">{t("fortune.luckyColor")}</p>
                  <p className="text-2xl font-bold text-cyan-400">{fortune.luckyColor}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="bg-indigo-600/10 border border-indigo-600/20 rounded-xl p-5 text-center">
                <p className="text-indigo-300 text-sm">💡 {t('fortune.advice')}</p>
                <p className="text-white font-medium mt-1">{fortune.advice}</p>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={changeBirthday} className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all text-sm">
                  {t('fortune.setBirthday')}
                </button>
                {isAuthenticated && (
                  <button onClick={loadHistory} className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-sm">
                    <History className="w-4 h-4" /> {t('fortune.history')}
                  </button>
                )}
                <button onClick={() => navigate('/draw')} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 text-sm">
                  {t('home.startReading')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowHistory(false)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-indigo-400" /> {t('fortune.history')}</h2>
                  <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[55vh] space-y-3">
                  {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t('fortune.noHistory')}</p>
                  ) : history.map((item: any, i) => {
                    const histCardName = isZh ? item.cardName : (isJa ? (item.cardNameJa || item.cardNameEn) : (isKo ? (item.cardNameKo || item.cardNameEn) : item.cardNameEn));
                    return (
                    <div key={i} className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                      <img src={item.cardImage} alt={histCardName} className="w-12 aspect-[512/917] rounded-lg object-contain flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{histCardName}</span>
                          <span className="text-gray-500 text-xs">{item.cardOrientation === 'reversed' || item.cardOrientation?.toLowerCase().includes('reverse') ? t('draw.reversed') : t('draw.upright')}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 truncate">{item.advice}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= item.overall ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-500 text-xs">{item.date}</p>
                        <p className="text-lg">{getZodiacEmoji(item.zodiacEn || item.zodiac) || '⭐'}</p>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyFortune;
