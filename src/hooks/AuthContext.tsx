// src/hooks/AuthContext.tsx
import { createContext, ReactNode } from 'react';

// Types
export interface ProfileData {
  avatar: string | null;
  bio: string;
  total_xp: number;
}

export interface AchievementData {
  id: number;
  name: string;
  description: string;
  xp_reward: number;
  icon: string | null;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user: number;
  achievement: AchievementData;
  date_unlocked: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  date_joined: string;
  profile: ProfileData;
  achievements: UserAchievement[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile?: {
    bio?: string;
    avatar?: File | null;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<User>;
  getUserAchievements: () => Promise<UserAchievement[]>;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = 'AuthContext';