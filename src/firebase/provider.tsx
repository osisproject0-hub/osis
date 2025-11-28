'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, onIdTokenChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { User as AuthUser } from 'firebase/auth';
import { User } from '@/lib/types'; // Assuming this is your Firestore user type
import { doc, onSnapshot } from 'firebase/firestore';


// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; 
  user: User | null; // This will be the Firestore User object
  authUser: AuthUser | null; // This is the raw Firebase Auth user
  isLoading: boolean;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
    children: ReactNode;
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  }

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase Auth user changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      setAuthUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Listen for Firestore user document changes based on authUser
  useEffect(() => {
    if (!firestore) return;
    if (!authUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(firestore, 'users', authUser.uid);
    const unsubscribe = onSnapshot(userDocRef, 
      (doc) => {
        if (doc.exists()) {
          setUser({ id: doc.id, ...doc.data() } as User);
        } else {
          // This case might happen during registration before the doc is created
          setUser(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching user document:", error);
        setUser(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser, firestore]);

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => ({
      firebaseApp,
      firestore,
      auth,
      user,
      authUser,
      isLoading
  }), [firebaseApp, firestore, auth, user, authUser, isLoading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

function useFirebaseContext() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
      throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
    }
    return context;
}

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebaseContext();
  if (!auth) throw new Error("Auth service not available.");
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebaseContext();
  if (!firestore) throw new Error("Firestore service not available.");
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebaseContext();
  if (!firebaseApp) throw new Error("Firebase App not available.");
  return firebaseApp;
};

export interface UserHookResult {
    user: User | null;
    authUser: AuthUser | null;
    isUserLoading: boolean;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const { user, authUser, isLoading } = useFirebaseContext();
  return { user, authUser, isUserLoading: isLoading };
};

/**
 * A wrapper for `React.useMemo` that helps prevent Firestore assertion errors.
 * It ensures that any Firestore query or document reference object is stable across re-renders,
 * which is critical for hooks like `useCollection` and `useDoc` that rely on `useEffect`.
 *
 * @template T The type of the value to be memoized.
 * @param factory A function that computes the value.
 * @param deps An array of dependencies. The factory is re-run if any dependency changes.
 * @returns The memoized value.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}
