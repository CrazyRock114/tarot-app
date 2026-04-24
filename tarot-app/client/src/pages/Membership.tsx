import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Zap, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

interface Plan {
  id: string;
  name: string;
  price: string;
  pointsPrice: number;
  duration: number;
  features: string[];
}

interface MembershipInfo {
  membership: string;
  membershipExpiry: string | null;
  isActive: boolean;
  daysLeft: number;
  points: number;
  plans: Plan[];
}

const planIcons: Record<string, React.ReactNode> = {
  weekly: <Zap className="w-6 h-6" />,
  monthly: <Star className="w-6 h-6" />,
  yearly: <Crown className="w-6 h-6" />,
};

const planColors: Record<string, string> = {
  weekly: 'from-blue-600 to-cyan-600',
  monthly: 'from-purple-600 to-indigo-600',
  yearly: 'from-yellow-500 to-orange-500',
};

export default function Membership() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<MembershipInfo | null>(null);
  
  const [subscribing, setSubscribing] = useState('');
  const [_loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (authLoading) return;
    loadInfo();
  }, [authLoading]);

  const loadInfo = async () => {
    
    try {
      if (token) {
        const res = await fetch('/api/membership', { headers });
        if (res.ok) setInfo(await res.json());
      } else {
        // Show plans without user info
        const res = await fetch('/api/membership');
        if (res.ok) setInfo(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubscribing(planId);
    setMessage('');
    try {
      const res = await fetch('/api/membership/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadInfo();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch {
      setMessage('❌ ' + t('errors.deleteFailed'));
    } finally {
      setSubscribing('');
    }
  };

  const defaultPlans: Plan[] = [
    { id: 'weekly', name: t('membership.weekly'), price: t('membership.weeklyPrice'), pointsPrice: 150, duration: 7, features: [t('home.unlimitedReading'), t('home.allReaders'), t('home.unlimitedFollowup')] },
    { id: 'monthly', name: t('membership.monthly'), price: t('membership.monthlyPrice'), pointsPrice: 500, duration: 30, features: [t('home.unlimitedReading'), t('home.allReaders'), t('home.unlimitedFollowup'), t('home.voiceReading'), t('home.exclusiveBack')] },
    { id: 'yearly', name: t('membership.yearly'), price: t('membership.yearlyPrice'), pointsPrice: 4000, duration: 365, features: [t('home.allBenefits'), t('home.annualReport'), t('home.earlyAccess')] },
  ];

  // Always use frontend i18n plans, backend plans text is Chinese-only
  const plans = defaultPlans;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950/20 to-gray-900 py-8 px-4">
      <SEO title={t('membership.seoTitle') + ' - 2or.com'} description={t('membership.seoDesc')} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              {t('membership.title')}
            </h1>
            <p className="text-gray-400 text-sm">{t("membership.subtitle")}</p>
          </div>
        </div>

        {/* Current Status */}
        {info?.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-600/30 rounded-2xl flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-yellow-400 font-semibold">{t('membership.current')}: {info.membership === 'yearly' ? t('membership.yearly') : t('membership.monthly')}</p>
              <p className="text-gray-400 text-sm">
                {t('membership.daysLeft', { days: info.daysLeft })} · {info.membershipExpiry ? new Date(info.membershipExpiry).toLocaleDateString(localStorage.getItem('i18nextLng') || 'zh-CN') : ''}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full border border-yellow-500/30">{t('membership.active')}</span>
            </div>
          </motion.div>
        )}

        {/* Current points */}
        {info && (
          <div className="mb-6 text-center text-gray-400 text-sm">
            {t('membership.points', { points: info.points })}
            {!isAuthenticated && <span className="ml-2 text-gray-500"></span>}
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan, i) => {
            const isPopular = plan.id === 'monthly';
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full font-medium">
                      ✦ {t('membership.popular')}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${planColors[plan.id]} flex items-center justify-center text-white`}>
                    {planIcons[plan.id]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{plan.name}</h3>
                    <p className="text-gray-400 text-xs">{plan.duration}{t('points.days')}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">{plan.price}</div>
                  <div className="text-purple-400 text-sm mt-1">
                    {t('membership.subscribe')}: {plan.pointsPrice} {t('membership.pointsUnit')}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Subscribe button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan.id); }}
                  disabled={!!subscribing}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${planColors[plan.id]} text-white shadow-lg`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  {subscribing === plan.id ? (
                    <><Sparkles className="w-4 h-4 animate-spin" /> {t('membership.subscribing')}</>
                  ) : (
                    <>{planIcons[plan.id]} {t('membership.subscribe')} <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-3 px-6 rounded-xl mb-6 ${
              message.startsWith('✅') ? 'bg-green-900/20 text-green-400 border border-green-600/30' : 'bg-red-900/20 text-red-400 border border-red-600/30'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Payment coming soon notice */}
        <div className="text-center p-5 bg-gray-800/20 border border-gray-700/30 rounded-2xl">
          <p className="text-gray-400 text-sm">💳 {t('home.vipNote')}</p>
        </div>

        {/* Benefits comparison */}
        <div className="mt-8">
          <h2 className="text-white font-semibold mb-4 text-center">{t('membership.freeVsMember')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-3 px-4">{t('membership.feature')}</th>
                  <th className="text-center py-3 px-4">{t('membership.freeUser')}</th>
                  <th className="text-center py-3 px-4 text-purple-400">{t('membership.memberUser')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  [t('membership.dailyLimit'), t('membership.dailyFreeLimit'), t('membership.dailyMemberLimit')],
                  [t('membership.readersAccess'), t('membership.readersFree'), t('membership.readersMember')],
                  [t('membership.followupAccess'), t('membership.followupFree'), t('membership.followupMember')],
                  [t('membership.voiceReading'), '✓', '✓'],
                  [t('membership.history'), '✓', '✓'],
                  [t('membership.exclusiveBack'), '✗', '✓'],
                  [t('membership.annualReport'), '✗', '✓ ' + t('membership.annualOnly')],
                  [t('membership.earlyAccess'), '✗', '✓ ' + t('membership.annualOnly')],
                ].map(([feat, free, vip], i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="py-3 px-4">{feat}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{free}</td>
                    <td className="py-3 px-4 text-center text-purple-400 font-medium">{vip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
