"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { authDb, initializeData } from '@/lib/mock-db';
import { initializeMockData } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (userData: Omit<User, 'id' | 'createdAt' | 'followerCount' | 'followingCount'>) => Promise<User | null>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!dataInitialized) {
          initializeData();
          await initializeMockData();
          setDataInitialized(true);
        }
        
        // Check for existing session
        const currentUser = await authDb.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [dataInitialized]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const loggedInUser = await authDb.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return loggedInUser;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt' | 'followerCount' | 'followingCount'>): Promise<User | null> => {
    try {
      const { userDb } = await import('@/lib/mock-db');
      const newUser = await userDb.create(userData);
      await authDb.setCurrentUser(newUser);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Signup failed:', error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authDb.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}