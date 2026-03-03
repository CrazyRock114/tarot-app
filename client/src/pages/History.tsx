// 极简版历史记录页面 - 暂不支持历史记录功能
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </button>

        <div className="text-center py-20">
          <Info className="w-16 h-16 text-gray-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">历史记录</h1>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            第一版暂不支持历史记录功能。每次占卜都是全新的体验！
          </p>
          <button
            onClick={() => navigate('/draw')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            开始新占卜
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
