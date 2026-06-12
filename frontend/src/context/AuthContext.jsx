import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mediassist-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('mediassist-users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mediassist-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mediassist-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mediassist-user');
    }
  }, [user]);

  const signup = ({ name, email, password, phone, dob, bloodGroup }) => {
    const exists = users.find(u => u.email === email);
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Note: plain text only for demo; use hashing in production
      phone: phone || '',
      dob: dob || '',
      bloodGroup: bloodGroup || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      joinedAt: new Date().toISOString(),
      medicalHistory: [],
      allergies: '',
      emergencyContact: '',
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    const { password: _p, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  };

  const login = ({ email, password }) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, message: 'Invalid email or password.' };
    }
    const { password: _p, ...safeUser } = found;
    setUser(safeUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Also update stored users list
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
