"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          if (userData && userData._id) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      
      Cookies.set('auth_token', access_token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      
      Cookies.set('auth_token', access_token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}