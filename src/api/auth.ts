// src/api/auth.ts
import axiosInstance from './axios';
import { UserData } from './user'; // Import UserData from user.ts

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string; // Fixed from username
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

export interface PasswordResetRequest {
    email: string;
  }
  
  export interface PasswordResetConfirm {
    uid: string;
    token: string;
    new_password: string;
  }

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  const response = await axiosInstance.post<AuthTokens>('/token/', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<UserData> => {
  const response = await axiosInstance.post<UserData>('/register/', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axiosInstance.post('/logout/', { refresh: refreshToken });
        console.log('Logout API call successful');
      } else {
        console.warn('No refresh token found in localStorage');
      }
    } catch (error) {
      console.error('Logout API error details:', error);
      // Continue with cleanup even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
};

export const requestPasswordReset = async (data: PasswordResetRequest): Promise<{ detail: string }> => {
    const response = await axiosInstance.post<{ detail: string }>('/password-reset/', data);
    return response.data;
  };
  
  export const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<{ detail: string }> => {
    const response = await axiosInstance.post<{ detail: string }>('/password-reset-confirm/', data);
    return response.data;
  };