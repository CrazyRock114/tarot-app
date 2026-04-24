import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

// Lazy load heavy routes for code splitting
const Gallery = lazy(() => import('./pages/Gallery'));
const Draw = lazy(() => import('./pages/Draw'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const History = lazy(() => import('./pages/History'));
const HistoryDetail = lazy(() => import('./pages/HistoryDetail'));
const Interpretation = lazy(() => import('./pages/Interpretation'));
const Share = lazy(() => import('./pages/Share'));
const Points = lazy(() => import('./pages/Points'));
const Membership = lazy(() => import('./pages/Membership'));
const CardDetail = lazy(() => import('./pages/CardDetail'));
const DailyFortune = lazy(() => import('./pages/DailyFortune'));
const Readers = lazy(() => import('./pages/Readers'));
const ReaderDetail = lazy(() => import('./pages/ReaderDetail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Admin = lazy(() => import('./pages/Admin'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: FC = () => {
  useEffect(() => {
    // Clean up cache-busting query param after forced reload
    if (window.location.search.includes('_r=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('_r');
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  return (
    <HelmetProvider>
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/draw" element={<Draw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/tr-admin" element={<Admin />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<HistoryDetail />} />
            <Route path="/interpretation" element={<Interpretation />} />
            <Route path="/interpretation/:id" element={<Interpretation />} />
            <Route path="/share/:shareId" element={<Share />} />
            <Route path="/points" element={<Points />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/gallery/:cardId" element={<CardDetail />} />
            <Route path="/daily" element={<DailyFortune />} />
            <Route path="/readers" element={<Readers />} />
            <Route path="/readers/:readerId" element={<ReaderDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </Layout>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
