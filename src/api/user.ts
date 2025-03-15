// src/api/user.ts
import { userApi } from './axios';

// User profile data structure
export interface ProfileData {
  avatar: string | null;
  bio: string;
  total_xp: number;
}

// Achievement structure
export interface AchievementData {
  id: number;
  name: string;
  description: string;
  xp_reward: number;
  icon: string | null;
  created_at: string;
}

// User achievement link
export interface UserAchievementData {
  id: number;
  user: number;
  achievement: AchievementData;
  date_unlocked: string;
}

// Full user data
export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  date_joined: string;
  profile: ProfileData;
  achievements: UserAchievementData[];
}

// Data for updating profile
export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile?: {
    bio?: string;
    avatar?: File | null;
  };
}

// Fetch current user’s profile
export const getUserProfile = async (): Promise<UserData> => {
  const response = await userApi.get('/profile/');
  return response.data;
};

// Update user profile (supports file upload for avatar)
export const updateUserProfile = async (data: ProfileUpdateData): Promise<UserData> => {
  if (data.profile?.avatar instanceof File) {
    const formData = new FormData();
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.username) formData.append('username', data.username);
    if (data.profile.bio) formData.append('profile.bio', data.profile.bio);
    if (data.profile.avatar) formData.append('profile.avatar', data.profile.avatar);
    const response = await userApi.patch('/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } else {
    const response = await userApi.patch('/profile/', data);
    return response.data;
  }
};

// Get user’s achievements
export const getUserAchievements = async (): Promise<UserAchievementData[]> => {
  const response = await userApi.get('/user-achievements/');
  return response.data;
};

// Get all available achievements
export const getAchievements = async (): Promise<AchievementData[]> => {
  const response = await userApi.get('/achievements/');
  return response.data;
};