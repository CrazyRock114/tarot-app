import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, History, Settings, Heart, ChevronRight, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export const Profile: FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: History, label: '占卜历史', desc: '查看以往的占卜记录', path: '/history' },
    { icon: Heart, label: '收藏牌组', desc: '保存有意义的牌阵', path: '#' },
    { icon: Settings, label: '设置', desc: '个性化你的体验', path: '#' },
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
            <h1 className="text-3xl font-bold text-white mb-4">欢迎来到 AI塔罗</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              登录后可以保存您的占卜历史，随时回顾AI解读结果，追踪您的塔罗之旅
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <User className="w-5 h-5" />
                登录
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                创建账号
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">78张塔罗牌</h3>
                <p className="text-gray-500 text-sm">完整的韦特塔罗牌体系</p>
              </div>
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">AI深度解读</h3>
                <p className="text-gray-500 text-sm">基于DeepSeek的智能分析</p>
              </div>
              <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <History className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">历史记录</h3>
                <p className="text-gray-500 text-sm">保存并追踪您的占卜历程</p>
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
            第一版暂不支持完整用户功能
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
            { label: '占卜次数', value: '-' },
            { label: '收藏牌组', value: '-' },
            { label: '连续天数', value: '1' },
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

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20 transition-colors border border-red-600/20"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
