import type { FC } from 'react';
import { User, History, Settings, Heart, ChevronRight } from 'lucide-react';

export const Profile: FC = () => {
  const menuItems = [
    { icon: History, label: '占卜历史', desc: '查看以往的占卜记录' },
    { icon: Heart, label: '收藏牌组', desc: '保存有意义的牌阵' },
    { icon: Settings, label: '设置', desc: '个性化你的体验' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">访客用户</h1>
          <p className="text-gray-400 mt-1">登录以保存你的占卜历史</p>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
            登录 / 注册
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '占卜次数', value: '0' },
            { label: '收藏牌组', value: '0' },
            { label: '连续签到', value: '1' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-gray-800/50 rounded-xl text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
