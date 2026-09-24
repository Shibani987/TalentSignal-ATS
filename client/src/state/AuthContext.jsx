import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ats_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('ats_token'));

  useEffect(() => {
    if (token) localStorage.setItem('ats_token', token);
    else localStorage.removeItem('ats_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('ats_user', JSON.stringify(user));
    else localStorage.removeItem('ats_user');
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    login(payload) {
      setToken(payload.token);
      setUser(payload.user);
    },
    logout() {
      setToken(null);
      setUser(null);
    },
    async refresh() {
      const { data } = await api.get('/users/me');
      setUser(data.user);
    }
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
