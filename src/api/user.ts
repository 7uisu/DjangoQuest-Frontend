// src/api/user.ts
import api from './axios';

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

export interface UserAchievementData {
  id: number;
  user: number;
  achievement: AchievementData;
  date_unlocked: string;
}

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

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile?: {
    bio?: string;
    avatar?: File | null;
  };
}

// User API Functions
export const getUserProfile = async (): Promise<UserData> => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateUserProfile = async (data: ProfileUpdateData): Promise<UserData> => {
  if (data.profile?.avatar instanceof File) {
    const formData = new FormData();
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.username) formData.append('username', data.username);
    if (data.profile.bio) formData.append('profile.bio', data.profile.bio);
    if (data.profile.avatar) formData.append('profile.avatar', data.profile.avatar);
    const response = await api.patch('/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } else {
    const response = await api.patch('/profile/', data); // Fixed from formData to data
    return response.data;
  }
};

export const getUserAchievements = async (): Promise<UserAchievementData[]> => {
  const response = await api.get('/user-achievements/');
  return response.data;
};

export const getAchievements = async (): Promise<AchievementData[]> => {
  const response = await api.get('/achievements/');
  return response.data;
};