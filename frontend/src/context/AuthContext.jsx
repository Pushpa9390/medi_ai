import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'guest-user',
  name: 'Guest User',
  email: 'guest@mediassist.ai',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MediAssistGuest',
  phone: '',
  dob: '',
  bloodGroup: '',
  allergies: '',
  emergencyContact: '',
  joinedAt: new Date().toISOString(),
  medicalHistory: [],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mediassist-user');
      const parsed = stored ? JSON.parse(stored) : null;
      // Always ensure a user exists — never return null
      return parsed || DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mediassist-user', JSON.stringify(user));
    }
  }, [user]);

  // No-op stubs — kept for compatibility with components that still call these
  const signup = () => ({ success: true });
  const login  = () => ({ success: true });

  // Logout resets to guest instead of null — UI never shows sign-in prompts
  const logout = () => {
    localStorage.removeItem('mediassist-user');
    setUser(DEFAULT_USER);
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return { success: true };
  };

  const deleteAccount = () => {
    localStorage.removeItem('mediassist-user');
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
