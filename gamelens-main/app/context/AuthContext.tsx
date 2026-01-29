'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'user';
}

// Simulamos usuarios de base de datos
const MOCK_USERS: User[] = [
  { id: 99, name: 'Valentín (Admin)', role: 'admin', avatarUrl: '' },
  { id: 2, name: 'Orne (User)', role: 'user', avatarUrl: '' }
];

interface AuthContextType {
  user: User | null;
  login: (userId: number) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al iniciar, chequeamos si había alguien logueado (persistencia básica)
  useEffect(() => {
    const savedId = localStorage.getItem('gamelens_active_user_id');
    if (savedId) {
      const found = MOCK_USERS.find(u => u.id === parseInt(savedId));
      if (found) setUser(found);
    }
    setIsLoading(false);
  }, []);

  const login = (userId: number) => {
    const found = MOCK_USERS.find(u => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem('gamelens_active_user_id', userId.toString());
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gamelens_active_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}