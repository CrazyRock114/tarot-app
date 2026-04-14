import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Shuffle, Sun, Users, User, Menu, X, History, LogOut, LogIn, Crown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { path: '/', name: t('nav.home'), icon: Sparkles },
    { path: '/draw', name: t('nav.draw'), icon: Shuffle },
    { path: '/daily', name: t('nav.fortune'), icon: Sun },
    { path: '/gallery', name: t('nav.gallery'), icon: BookOpen },
    { path: '/readers', name: t('nav.readers'), icon: Users },
    { path: '/membership', name: t('nav.membership'), icon: Crown },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                2or Tarot
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <LanguageSwitcher />

              {isAuthenticated ? (
                <div className="relative ml-1">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block text-sm">{user?.username}</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                      >
                        <Link to="/history" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                          <History className="w-4 h-4" />{t('nav.history')}
                        </Link>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                          <User className="w-4 h-4" />{t('nav.profile')}
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors text-left">
                          <LogOut className="w-4 h-4" />{t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 ml-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm">
                  <LogIn className="w-4 h-4" />{t('nav.login')}
                </Link>
              )}
            </div>

            {/* Mobile right: language + hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <LanguageSwitcher />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" /><span>{item.name}</span>
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                    <History className="w-5 h-5" /><span>{t('nav.history')}</span>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                    <User className="w-5 h-5" /><span>{t('nav.profile')}</span>
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors text-left">
                    <LogOut className="w-5 h-5" /><span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white">
                  <LogIn className="w-5 h-5" /><span>{t('nav.login')}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2026 2or Tarot · {t('home.ctaSubtitle')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
