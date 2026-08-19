import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (token) {
          const data = await apiRequest('/auth/me');
          if (!data.user.isAdmin) {
            clearToken();
          } else {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (phone, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { phone, password },
      auth: false,
    });

    if (!data.user.isAdmin) {
      throw new Error(
        "This account isn't an admin. Promote it first with the backend's `npm run make-admin -- <phone>` command."
      );
    }

    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
