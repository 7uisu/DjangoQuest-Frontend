// src/api/auth.ts
import { userApi } from './axios';
import { UserData } from './user';

export interface AuthTokens {
  access: string;
  refresh: string;
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

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
}

// Log in and get tokens
export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  const response = await userApi.post<AuthTokens>('/token/', credentials);
  return response.data;
};

// Register a new user
export const register = async (data: RegisterData): Promise<UserData> => {
  const response = await userApi.post<UserData>('/register/', data);
  return response.data;
};

// Log out and clear tokens
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await userApi.post('/logout/', { refresh: refreshToken });
      console.log('Logout API call successful');
    }
  } catch (error) {
    console.error('Logout API error details:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Request a password reset email
export const requestPasswordReset = async (data: PasswordResetRequest): Promise<{ detail: string }> => {
  const response = await userApi.post<{ detail: string }>('/password-reset/', data);
  return response.data;
};

// Confirm password reset with token
export const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<{ detail: string }> => {
  const response = await userApi.post<{ detail: string }>('/password-reset-confirm/', data);
  return response.data;
};