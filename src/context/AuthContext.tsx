import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

interface User {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'resident';
  residentId?: string;
  propertyId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pg_auth_token');
    const savedUser = localStorage.getItem('pg_user_data');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pg_user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('pg_auth_token', newToken);
    localStorage.setItem('pg_user_data', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('pg_auth_token');
    localStorage.removeItem('pg_user_data');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data && data.user) {
        const updated: User = {
          userId: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          residentId: data.residentProfile?._id,
          propertyId: data.residentProfile?.propertyId?._id || data.user.propertyId,
        };
        setUser(updated);
        localStorage.setItem('pg_user_data', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

