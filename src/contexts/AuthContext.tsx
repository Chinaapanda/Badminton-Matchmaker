"use client";

import type { Profile } from '@/lib/api/auth';
import { signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp, getCurrentProfile } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const userProfile = await getCurrentProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: signedInUser } = await apiSignIn(email, password);
    setUser(signedInUser);
    await loadProfile(signedInUser);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await apiSignUp(email, password, displayName);
    setUser(newUser);
    await loadProfile(newUser);
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await loadProfile(user);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
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
