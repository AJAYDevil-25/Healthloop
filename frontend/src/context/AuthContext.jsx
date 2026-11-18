import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile);
        setIsGuest(Boolean(data.user.is_guest));
      } else {
        api.setToken(null);
      }
    } catch (err) {
      console.warn('Authentication token check failed:', err.message);
      api.setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setProfile(data.profile);
    setIsGuest(Boolean(data.user.is_guest));
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    setUser(data.user);
    setProfile(data.profile);
    setIsGuest(false);
    return data;
  };

  const guestLogin = async () => {
    const data = await api.guestLogin();
    setUser(data.user);
    setProfile(data.profile);
    setIsGuest(true);
    return data;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setProfile(null);
    setIsGuest(false);
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        login,
        register,
        guestLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
