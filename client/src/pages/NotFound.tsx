import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl mb-6">🔮</div>
        <h1 className="text-4xl font-bold text-white mb-3">404</h1>
        <p className="text-gray-400 text-lg mb-8">{t('common.pageNotFound', '页面不存在，水晶球也找不到...')}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back', '返回')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            {t('nav.home', '首页')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
