import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Draw from './pages/Draw';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Interpretation from './pages/Interpretation';
import Share from './pages/Share';
import Points from './pages/Points';
import Membership from './pages/Membership';
import CardDetail from './pages/CardDetail';
import DailyFortune from './pages/DailyFortune';
import Readers from './pages/Readers';
import ReaderDetail from './pages/ReaderDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

const App: FC = () => {
  return (
    <HelmetProvider>
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
        <Layout>
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
        </Layout>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
