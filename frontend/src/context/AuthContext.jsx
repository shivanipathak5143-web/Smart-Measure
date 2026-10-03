import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getProfile, loginUser, registerUser } from '../api/authAPI';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await getProfile();
      // backend returns { success, data: { id, username, email, ... } }
      setUser(data.data || data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    // backend returns { success, data: { user, token } }
    const { user, token } = data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return data;
  };

  const register = async (info) => {
    const { data } = await registerUser(info);
    const { user, token } = data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};