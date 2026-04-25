// src/api/user.ts
import { userApi } from './axios';

// User profile data structure
export interface ProfileData {
  avatar: string | null;
  bio: string;
  total_xp: number;
  classroom_name: string | null;
  teacher_name: string | null;
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

// Certificate data from backend
export interface CertificateData {
  id: string;
  professor: string;
  topic: string;
  professor_key: string;
  completed: boolean;
  completed_at: string | null;
}

// Full user data
export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_teacher: boolean;
  is_student: boolean;
  date_joined: string;
  profile: ProfileData;
  achievements: UserAchievementData[];
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

// Download certificate PDF
export const downloadCertificate = async (professorKey: string): Promise<void> => {
  const response = await userApi.get(`/certificates/${professorKey}/image/`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificate-${professorKey}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// View certificate PDF in a new tab
export const viewCertificate = async (professorKey: string): Promise<void> => {
  const response = await userApi.get(`/certificates/${professorKey}/image/`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  window.open(url, '_blank');
};