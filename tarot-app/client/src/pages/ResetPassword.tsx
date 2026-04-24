import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../api';
import SEO from '../components/SEO';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4 flex items-center justify-center">
        <SEO title={t('resetPassword.seoTitle')} description={t('resetPassword.seoDesc')} />
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-4">{t('resetPassword.invalidLink')}</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">{t('forgotPassword.title')}</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
      <SEO title={t('resetPassword.seoTitle')} description={t('resetPassword.seoDesc')} />
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ChevronLeft className="w-5 h-5" />{t('common.back')}
        </button>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('resetPassword.title')}</h1>
          <p className="text-gray-400 text-center text-sm mb-6">{t('resetPassword.desc')}</p>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="text-green-300 text-center text-sm">{t('resetPassword.success')}</p>
              <p className="text-gray-400 text-xs">{t('resetPassword.redirecting')}</p>
            </div>
          ) : (
            <>
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('resetPassword.newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required minLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                      placeholder="••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('resetPassword.confirmPassword')}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</> : t('resetPassword.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
