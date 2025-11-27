'use client';

import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (uid: string, password?: string) => boolean;
  logout: () => void;
  updateUserPassword: (uid: string, currentPassword?: string, newPassword?: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// A copy of mockUsers to simulate a database that can be modified in memory.
let userDatabase = [...mockUsers];

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserUid = localStorage.getItem('currentUserUid');
      if (storedUserUid) {
        const foundUser = userDatabase.find(u => u.uid === storedUserUid);
        setUser(foundUser || null);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((uid: string, password?: string) => {
    const foundUser = userDatabase.find(u => u.uid === uid);
    if (foundUser && foundUser.password === password) {
      try {
        localStorage.setItem('currentUserUid', uid);
        setUser(foundUser);
        return true;
      } catch (error) {
        console.error("Could not access localStorage", error);
        return false;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUserUid');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setUser(null);
  }, []);

  const updateUserPassword = useCallback((uid: string, currentPassword?: string, newPassword?: string) => {
    const userIndex = userDatabase.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
      const userToUpdate = userDatabase[userIndex];
      if (userToUpdate.password === currentPassword && newPassword) {
        userDatabase[userIndex] = { ...userToUpdate, password: newPassword };
        // We also update the currently logged-in user object if it matches
        if(user?.uid === uid) {
          setUser(userDatabase[userIndex]);
        }
        return true;
      }
    }
    return false;
  }, [user]);


  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUserPassword }}>
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
