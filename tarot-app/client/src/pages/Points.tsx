import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, CalendarCheck, Share2, UserPlus, ChevronLeft, Copy, Check, Loader2, Gift, Crown, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import LuckyWheel from '../components/LuckyWheel';

interface PointsData {
  points: number;
  canCheckIn: boolean;
  inviteCode: string;
  lastCheckIn: string | null;
  streak: number;
  totalCheckIns: number;
  achievements: string[];
  inviteUrl: string;
  inviteCount?: number;
  totalEarned?: number;
  logs: LogEntry[];
}

interface LogEntry {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

const getAchievements = (t: any): Record<string, { name: string; desc: string; icon: string; color: string }> => ({
  week_streak:   { name: t('achievement.week_streak'), desc: t('achievement.week_streakDesc'), icon: '🔥', color: 'from-orange-600 to-red-600' },
  month_streak:  { name: t('achievement.month_streak'), desc: t('achievement.month_streakDesc'), icon: '🌟', color: 'from-yellow-500 to-orange-500' },
  centurion:     { name: t('achievement.centurion'), desc: t('achievement.centurionDesc'), icon: '💎', color: 'from-cyan-600 to-blue-600' },
  first_share:   { name: t('achievement.first_share'), desc: t('achievement.first_shareDesc'), icon: '📢', color: 'from-blue-600 to-indigo-600' },
  invite_5:      { name: t('achievement.invite_5'), desc: t('achievement.invite_5Desc'), icon: '👥', color: 'from-purple-600 to-pink-600' },
  reader_all:    { name: t('achievement.reader_all'), desc: t('achievement.reader_allDesc'), icon: '✨', color: 'from-indigo-600 to-purple-600' },
});

const getTypeLabels = (t: any): Record<string, { label: string; icon: string; color: string }> => ({
  checkin:     { label: t('points.checkin'), icon: '📅', color: 'text-green-400' },
  share:       { label: t('points.shareDraw'), icon: '🔗', color: 'text-blue-400' },
  invite:      { label: t('points.inviteFriend'), icon: '👥', color: 'text-purple-400' },
  achievement: { label: t('points.achievements'), icon: '🏆', color: 'text-yellow-400' },
  lucky_draw:  { label: t('points.luckyDraw'), icon: '🎰', color: 'text-pink-400' },
  subscribe:   { label: t('membership.title'), icon: '👑', color: 'text-orange-400' },
  spend:       { label: t('membership.pointsUnit'), icon: '💎', color: 'text-red-400' },
});

const Points = () => {
  const { t } = useTranslation();
  const ACHIEVEMENTS = getAchievements(t);
  const typeLabels = getTypeLabels(t);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const token = localStorage.getItem('token');
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    loadData();
  }, [isAuthenticated, authLoading]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/points/all', { headers });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/points/checkin', { method: 'POST', headers });
      const d = await res.json();
      if (res.ok) {
        setCheckInMsg(d.message || t('points.checkinSuccess', { amount: d.pointsEarned }));
        if (d.newAchievements?.length) setNewAchievements(d.newAchievements);
        loadData();
        setTimeout(() => setCheckInMsg(''), 3000);
      } else {
        setCheckInMsg(d.message || t('points.checkinFailed'));
        setTimeout(() => setCheckInMsg(''), 3000);
      }
    } finally { setCheckingIn(false); }
  };

  const handleCopy = async () => {
    if (!data?.inviteUrl) return;
    try { await navigator.clipboard.writeText(data.inviteUrl); }
    catch {
      const inp = document.createElement('input');
      inp.value = data.inviteUrl;
      document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex items-center justify-center">
      <SEO title={t('points.seoTitle')} description={t('points.seoDesc')} />
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  const unlockedAchievements = data?.achievements || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <SEO title={t('points.seoTitle')} description={t('points.seoDesc')} />

      <AnimatePresence>
        {showWheel && (
          <LuckyWheel
            points={data?.points || 0}
            onDraw={loadData}
            onClose={() => setShowWheel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 bg-yellow-600 text-white rounded-xl shadow-xl flex items-center gap-2"
            onAnimationComplete={() => setTimeout(() => setNewAchievements([]), 2500)}
          >
            <Trophy className="w-5 h-5" />
            {t('points.achievementUnlockedMsg', { names: newAchievements.map(a => ACHIEVEMENTS[a]?.name || a).join('、') })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/10 border border-yellow-600/20 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 text-sm font-medium">{t("points.vipBanner")}</p>
              <p className="text-gray-500 text-xs">{t('points.vipBannerSub')}</p>
            </div>
          </div>
          <Link to="/membership" className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs rounded-lg font-medium">{t('points.viewMembership')} →</Link>
        </motion.div>

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Coins className="w-7 h-7 text-yellow-400" />{t("points.title")}</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-600/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-5xl font-bold text-yellow-400">{data?.points || 0}</div>
              <div className="text-gray-400 text-sm mt-1">{t("points.current")}</div>
            </div>
            <div className="w-px h-16 bg-yellow-600/20" />
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-orange-400">🔥 {data?.streak || 0}</div>
              <div className="text-gray-400 text-sm mt-1">{t("points.streak")}</div>
            </div>
            <div className="w-px h-16 bg-yellow-600/20" />
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-purple-400">{data?.totalCheckIns || 0}</div>
              <div className="text-gray-400 text-sm mt-1">{t("points.totalCheckins")}</div>
            </div>
          </div>
        </motion.div>

        {(data?.streak || 0) > 0 && (
          <div className="mb-4 px-4 py-2 bg-orange-900/20 border border-orange-600/20 rounded-lg text-orange-300 text-xs text-center">
            {t('points.streakHint', { days: data?.streak })} · {data!.streak >= 7 ? t('points.keepGoing') : t('points.streakUnlock', { days: 7 - data!.streak })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium text-sm">{t("points.checkin")}</span>
              <span className="text-green-400 text-xs ml-auto">+10~50</span>
            </div>
            <p className="text-gray-500 text-xs mb-3">{t('points.checkinDesc')}</p>
            <button onClick={handleCheckIn} disabled={!data?.canCheckIn || checkingIn}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${data?.canCheckIn ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
            >
              {checkingIn ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : checkInMsg || (data?.canCheckIn ? t('points.checkinNow') : t('points.checkedIn'))}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-pink-400" />
              <span className="text-white font-medium text-sm">{t("points.luckyDraw")}</span>
              <span className="text-pink-400 text-xs ml-auto">-20</span>
            </div>
            <p className="text-gray-500 text-xs mb-3">{t('points.luckyDrawDesc')}</p>
            <button onClick={() => setShowWheel(true)} disabled={(data?.points || 0) < 20}
              className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t('points.startDraw')}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium text-sm">{t("points.shareDraw")}</span>
              <span className="text-blue-400 text-xs ml-auto">+5</span>
            </div>
            <p className="text-gray-500 text-xs mb-3">{t('points.shareDesc')}</p>
            <button onClick={() => navigate('/draw')} className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all">
              {t('points.goReading')}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-gray-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium text-sm">{t("points.inviteFriend")}</span>
              <span className="text-purple-400 text-xs ml-auto">+50</span>
            </div>
            <p className="text-gray-500 text-xs mb-3">{t('points.inviteCode')}：<code className="text-yellow-400">{data?.inviteCode}</code></p>
            <button onClick={handleCopy} className="w-full py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all flex items-center justify-center gap-1">
              {copied ? <><Check className="w-3.5 h-3.5" /> {t('points.copied')}</> : <><Copy className="w-3.5 h-3.5" /> {t('points.copyLink')}</>}
            </button>
          </motion.div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            {t('points.achievements')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {unlockedAchievements.map(id => {
              const ach = ACHIEVEMENTS[id];
              if (!ach) return null;
              return (
                <motion.div key={id} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${ach.color} flex items-center gap-3`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{ach.name}</div>
                    <div className="text-white/70 text-xs">{ach.desc}</div>
                  </div>
                </motion.div>
              );
            })}
            {Object.entries(ACHIEVEMENTS).map(([id, ach]) => {
              if (unlockedAchievements.includes(id)) return null;
              return (
                <div key={id} className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center gap-3 opacity-50">
                  <span className="text-2xl grayscale">{ach.icon}</span>
                  <div>
                    <div className="text-gray-400 font-medium text-sm">{ach.name}</div>
                    <div className="text-gray-600 text-xs">{ach.desc}</div>
                  </div>
                  <span className="ml-auto text-gray-600 text-xs">🔒</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center text-gray-600 text-xs">
            {t('points.achievementUnlocked', { count: unlockedAchievements.length, total: Object.keys(ACHIEVEMENTS).length })}
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            {t('points.log')}
          </h2>
          {!data?.logs?.length ? (
            <p className="text-gray-500 text-center py-8">{t("points.noLog")}</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.logs.map(log => {
                const info = typeLabels[log.type] || { label: log.type, icon: '💎', color: 'text-gray-400' };
                return (
                  <div key={log._id} className="flex items-center justify-between py-2 border-b border-gray-700/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{info.icon}</span>
                      <div>
                        <div className="text-white text-sm">{log.description || info.label}</div>
                        <div className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString('zh-CN')}</div>
                      </div>
                    </div>
                    <span className={`font-medium text-sm ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Points;
