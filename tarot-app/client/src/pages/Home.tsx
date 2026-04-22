import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Shuffle, Sun, Heart , Crown, Check } from 'lucide-react';
import SEO from '../components/SEO';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sparkles,
      title: t('home.aiReading'),
      desc: t('home.aiReadingDesc'),
      path: '/draw',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Shuffle,
      title: t('home.multiSpread'),
      desc: t('home.multiSpreadDesc'),
      path: '/draw',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Sun,
      title: t('home.dailyFortune'),
      desc: t('home.dailyFortuneDesc'),
      path: '/daily',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: BookOpen,
      title: t('nav.gallery'),
      desc: t('gallery.subtitle'),
      path: '/gallery',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const tarotReaders = [
    { id: 'mystic', name: t('readers_data.mystic.name'), style: t('readers_data.mystic.title'), desc: t('readers_data.mystic.desc'), avatar: '/readers/mystic.jpg', emoji: '🌙' },
    { id: 'rational', name: t('readers_data.rational.name'), style: t('readers_data.rational.title'), desc: t('readers_data.rational.desc'), avatar: '/readers/rational.jpg', emoji: '📊' },
    { id: 'warm', name: t('readers_data.warm.name'), style: t('readers_data.warm.title'), desc: t('readers_data.warm.desc'), avatar: '/readers/warm.jpg', emoji: '🌸' },
    { id: 'punk', name: t('readers_data.punk.name'), style: t('readers_data.punk.title'), desc: t('readers_data.punk.desc'), avatar: '/readers/punk.jpg', emoji: '🔥' },
  ];

  const vipPlans = [
    { plan: t('membership.weekly'), price: t('membership.weeklyPrice'), points: 150, color: 'from-blue-600 to-cyan-600', features: [t('home.unlimitedReading'), t('home.allReaders'), t('home.unlimitedFollowup')] },
    { plan: t('membership.monthly'), price: t('membership.monthlyPrice'), points: 500, color: 'from-purple-600 to-indigo-600', popular: true, features: [t('home.unlimitedReading'), t('home.allReaders'), t('home.unlimitedFollowup'), t('home.voiceReading'), t('home.exclusiveBack')] },
    { plan: t('membership.yearly'), price: t('membership.yearlyPrice'), points: 4000, color: 'from-yellow-500 to-orange-500', features: [t('home.allBenefits'), t('home.annualReport'), t('home.earlyAccess')] },
  ];

  return (
    <div className="min-h-screen">
      <SEO title={t('seo.homeTitle')} description={t('seo.homeDesc')} />
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
              <span>{t('home.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('home.title')}<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{t('home.titleHighlight')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/draw"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {t('home.startReading')}
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t('nav.gallery')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('home.features')}</h2>
            <p className="text-gray-400">{t('home.multiSpreadDesc')}</p>
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
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('home.selectReader')}</h2>
            <p className="text-gray-400">{t('home.selectReaderDesc')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tarotReaders.map((reader, index) => (
              <motion.div
                key={reader.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => window.location.href = '/readers/' + reader.id}
                className="p-4 bg-gray-800/30 rounded-xl border border-gray-800 text-center hover:border-indigo-500/30 transition-colors cursor-pointer group"
              >
                <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                  <img src={reader.avatar} alt={reader.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-white font-medium">{reader.emoji} {reader.name}</div>
                <div className="text-indigo-400 text-sm mb-1">{reader.style}</div>
                <div className="text-gray-500 text-xs">{reader.desc}</div>
                <div className="text-purple-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">{t('readers.viewDetail')} →</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* VIP Membership Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-purple-950/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm mb-4">
              <Crown className="w-4 h-4" />
              {t('home.vipSection')}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('home.vipTitle')}</h2>
            <p className="text-gray-400">{t('home.vipSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {vipPlans.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 ${item.popular ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700/50 bg-gray-800/20'}`}
              >
                {item.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full">
                    {t('home.popular')}
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} mb-4`}>
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{item.plan}</h3>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-white">{item.price}</span>
                </div>
                <p className="text-purple-400 text-sm mb-4">{t('membership.subscribe')}: {item.points} {t('membership.pointsUnit')}</p>
                <ul className="space-y-2 mb-5">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20"
            >
              <Crown className="w-5 h-5" />
              {t('home.vipButton')}
            </Link>
            <p className="text-gray-500 text-sm mt-3">{t('home.vipNote')}</p>
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
              {t('home.ctaTitle')}
            </h2>
            <p className="text-gray-300 mb-8">
              {t('home.ctaSubtitle')}
            </p>
            <Link
              to="/draw"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              {t('home.ctaButton')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
