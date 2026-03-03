// 极简版注册页面 - 第一版暂不支持注册
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </button>

        <div className="text-center py-12">
          <Info className="w-16 h-16 text-gray-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">用户注册</h1>
          <p className="text-gray-400 mb-8">
            第一版暂不支持用户系统，可直接使用所有功能！
          </p>
          <button
            onClick={() => navigate('/draw')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            开始占卜
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
