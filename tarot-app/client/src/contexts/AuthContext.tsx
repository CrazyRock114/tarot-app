import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// 用户类型
interface User {
  id: string;
  username: string;
  email?: string;
  birthday?: string;
  points?: number;
  membership?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User, csrfToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 恢复用户状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User, csrfToken?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (csrfToken) localStorage.setItem('csrfToken', csrfToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Tell server to clear HttpOnly cookies (sessionId + token)
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors — still clear local state
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('csrfToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
