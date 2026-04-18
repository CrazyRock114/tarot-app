import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { User, History, Settings, Heart, ChevronRight, LogOut, Sparkles, BookOpen, Coins , Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const Profile: FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Crown, label: t('profile.membership'), desc: t('profile.membershipDesc'), path: '/membership', vip: true },
    { icon: Coins, label: t('profile.points'), desc: t('profile.pointsDesc'), path: '/points' },
    { icon: History, label: t('profile.history'), desc: t('profile.historyDesc'), path: '/history' },
    { icon: Heart, label: t('profile.favorites'), desc: t('profile.favoritesDesc'), path: '#' },
    { icon: Settings, label: t('profile.settings'), desc: t('profile.settingsDesc'), path: '#' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600/20 mb-6">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{t('profile.title')}</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {t('profile.loginPrompt')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <User className="w-5 h-5" />
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                {t('nav.register')}
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">{t('gallery.subtitle')}</h3>
                <p className="text-gray-500 text-sm">{t('gallery.title')}</p>
              </div>
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">{t('home.aiReading')}</h3>
                <p className="text-gray-500 text-sm">{t('home.aiReadingDesc')}</p>
              </div>
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <History className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">{t('profile.history')}</h3>
                <p className="text-gray-500 text-sm">{t('profile.historyDesc')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
          <p className="text-gray-500 text-sm mt-2">
            {t('profile.title')}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: t('history.title'), value: '-' },
            { label: t('profile.favorites'), value: '-' },
            { label: t('points.streak'), value: '1' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-gray-800/50 rounded-xl text-center border border-gray-700/50">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-8"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50"
              >
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Link>
            );
          })}
        </motion.div>

        {/* Admin Button */}
      {user?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-red-400" />
            <span className="text-red-300">🔧 管理后台</span>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400" />
        </button>
      )}

      {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20 transition-colors border border-red-600/20"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
