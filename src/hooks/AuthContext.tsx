// src/hooks/AuthContext.tsx
import { createContext, ReactNode } from 'react';

// Types
export interface ProfileData {
  avatar: string | null;
  bio: string;
  total_xp: number;
  classroom_name?: string | null;
  teacher_name?: string | null;
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

export interface CertificateData {
  id: string;
  professor: string;
  topic: string;
  professor_key: string;
  completed: boolean;
  completed_at: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_teacher: boolean;
  is_student: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  profile: ProfileData;
  achievements: UserAchievement[];
  certificates?: CertificateData[];
  story_progress?: number;
  challenges_completed?: number;
  learning_modules_completed?: number;
  ch1_quiz_score?: number;
  ch1_did_remedial?: boolean;
  ch1_remedial_score?: number;
  detailed_grades?: any[];
  story_mode_gwa?: number;
  learning_mode_gwa?: number;
  learning_mode_detailed_grades?: { professor: string; grade: number; label?: string }[];
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
  first_name: string;
  last_name: string;
  role?: 'student' | 'teacher';
  educator_code?: string;
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
  getUserProfile: () => Promise<User>; // Add this line
  requestPasswordReset: (data: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = 'AuthContext';