import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '../api';
import SEO from '../components/SEO';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 py-12 px-4">
      <SEO title={t('forgotPassword.seoTitle')} description={t('forgotPassword.seoDesc')} />
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ChevronLeft className="w-5 h-5" />{t('common.back')}
        </button>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Mail className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('forgotPassword.title')}</h1>
          <p className="text-gray-400 text-center text-sm mb-6">{t('forgotPassword.desc')}</p>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="text-green-300 text-center text-sm">{t('forgotPassword.sent')}</p>
              <Link to="/login" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">{t('forgotPassword.backToLogin')}</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your@email.com"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}</> : t('forgotPassword.submit')}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">{t('forgotPassword.backToLogin')}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
