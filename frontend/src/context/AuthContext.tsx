import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  user: {
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
  } | null;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
  } | null>({
    name: 'Pulkit Khandelwal',
    email: 'admin@finguard.ai',
    role: 'ADMIN' as UserRole,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pulkit'
  });

  const setRole = (role: UserRole) => {
    setUser(prev => prev ? { ...prev, role } : {
      name: 'Pulkit Khandelwal',
      email: 'admin@finguard.ai',
      role,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pulkit'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
