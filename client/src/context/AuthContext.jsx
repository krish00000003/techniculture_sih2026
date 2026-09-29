import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/** Role → default landing path */
const ROLE_HOME = {
  trainee: '/trainee/dashboard',
  employer: '/employer/talent',
  provider: '/provider/upload',
  admin: '/admin/rankings',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, verify stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /** Save JWT + user after successful login */
  const handleLoginResponse = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  /** Google login */
  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    handleLoginResponse(data);
    return data.user;
  };

  /** Password login (email or phone + password) */
  const loginWithPassword = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    handleLoginResponse(data);
    return data.user;
  };

  /** Request magic link */
  const requestMagicLink = async (phone, channel = 'whatsapp') => {
    const { data } = await api.post('/auth/magic-link', { phone, channel });
    return data;
  };

  /** Verify magic-link token */
  const verifyMagicLink = async (token) => {
    const { data } = await api.get(`/auth/magic-link/verify/${token}`);
    handleLoginResponse(data);
    return data.user;
  };

  /** Register new user */
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    handleLoginResponse(data);
    return data.user;
  };

  /** Dev Login Bypass */
  const devLogin = async (role = 'admin') => {
    const { data } = await api.post('/auth/dev-login', { role });
    handleLoginResponse(data);
    return data.user;
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      loginWithPassword,
      requestMagicLink,
      verifyMagicLink,
      register,
      devLogin,
      logout,
      roleHome: user ? ROLE_HOME[user.role] || '/' : '/login',
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { ROLE_HOME };
