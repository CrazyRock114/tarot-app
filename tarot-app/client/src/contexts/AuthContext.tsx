import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authApi, setCsrfToken } from '../api';

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
  login: (user: User, csrfToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([authApi.getMe(), authApi.getCsrf()])
      .then(([meResponse, csrfResponse]) => {
        if (cancelled) return;
        setUser(meResponse.data);
        setCsrfToken(csrfResponse.data.csrfToken);
      })
      .catch(() => { if (!cancelled) { setUser(null); setCsrfToken(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = (userData: User, token: string) => {
    setCsrfToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Tell server to clear HttpOnly cookies (sessionId + token)
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors — still clear local state
    }
    setCsrfToken(null);
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
