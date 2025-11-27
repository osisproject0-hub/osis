'use client';

import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (uid: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserUid = localStorage.getItem('currentUserUid');
      if (storedUserUid) {
        const foundUser = mockUsers.find(u => u.uid === storedUserUid);
        setUser(foundUser || null);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((uid: string) => {
    const foundUser = mockUsers.find(u => u.uid === uid);
    if (foundUser) {
      try {
        localStorage.setItem('currentUserUid', uid);
        setUser(foundUser);
      } catch (error) {
        console.error("Could not access localStorage", error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUserUid');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
