
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Shuffle, Sun, Star, Heart } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI塔罗占卜',
    desc: '输入你的问题，AI为你深度解读',
    path: '/draw',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Shuffle,
    title: '传统抽牌',
    desc: '模拟真实洗牌，动态翻牌效果',
    path: '/draw',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Sun,
    title: '每日运势',
    desc: '24小时更新个人运势指引',
    path: '/daily',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: BookOpen,
    title: '塔罗图鉴',
    desc: '78张塔罗牌完整图鉴',
    path: '/gallery',
    color: 'from-emerald-500 to-teal-600',
  },
];

const tarotReaders = [
  { name: '星月', style: '直觉系', desc: '相信直觉，解读诗意' },
  { name: '墨尘', style: '逻辑系', desc: '理性分析，清晰建议' },
  { name: '暖阳', style: '治愈系', desc: '温柔关怀，疗愈内心' },
  { name: '夜羽', style: '神秘系', desc: '揭示深层灵性含义' },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-indigo-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI驱动的塔罗占卜体验</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              探索<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">命运</span>的指引
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              结合古老智慧与人工智能，为你提供深刻的塔罗解读。
              无论爱情、事业还是人生方向，让塔罗为你照亮前路。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/draw"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                开始占卜
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                浏览图鉴
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">核心功能</h2>
            <p className="text-gray-400">多种占卜方式，满足你的不同需求</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={feature.path}
                    className="block p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Readers */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">选择你的AI塔罗师</h2>
            <p className="text-gray-400">不同风格，为你提供独特的解读体验</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tarotReaders.map((reader, index) => (
              <motion.div
                key={reader.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-800/30 rounded-xl border border-gray-800 text-center hover:border-indigo-500/30 transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-white font-medium">{reader.name}</div>
                <div className="text-indigo-400 text-sm mb-1">{reader.style}</div>
                <div className="text-gray-500 text-xs">{reader.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30"
          >
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              准备好探索你的命运了吗？
            </h2>
            <p className="text-gray-300 mb-8">
              每一次抽牌都是与内心的对话，让塔罗为你揭示隐藏的真相
            </p>
            <Link
              to="/draw"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              立即开始
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
