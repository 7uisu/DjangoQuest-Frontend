// src/hooks/AuthProvider.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/axios'; // Changed from api to userApi
import { requestPasswordReset as apiRequestPasswordReset, confirmPasswordReset as apiConfirmPasswordReset } from '../api/auth';
import { AuthContext, AuthContextType, AuthProviderProps, TokenResponse, User } from './AuthContext';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    console.log("checkAuth triggered");
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      console.log("Token:", token);
      if (token) {
        try {
          const userData = await getUserProfile();
          console.log("User data fetched:", userData);
          setUser(userData);
        } catch (err) {
          console.log("Error fetching user profile", err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch user profile
  const getUserProfile = async (): Promise<User> => {
    const response = await userApi.get('/profile/'); // Use userApi
    return response.data;
  };

  // Login function
  const login: AuthContextType['login'] = async (credentials) => {
    setIsLoading(true);
    setError(null);
    console.log("Attempting login with:", credentials);
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log("Cleared tokens before login");

    try {
      const response = await userApi.post<TokenResponse>('/token/', credentials); // Use userApi
      const { access, refresh } = response.data;
      console.log("Login successful, tokens:", { access, refresh });
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      console.log("Stored refresh token:", localStorage.getItem('refresh_token'));
      
      const userData = await getUserProfile();
      setUser(userData);
      
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      console.log("Login error:", errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register: AuthContextType['register'] = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await userApi.post('/register/', data); // Use userApi
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout: AuthContextType['logout'] = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      console.log("Refresh token before logout:", refreshToken);
      if (refreshToken && typeof refreshToken === 'string' && refreshToken.trim() !== '') {
        try {
          const response = await userApi.post('/logout/', { refresh: refreshToken }); // Use userApi
          console.log("API logout successful:", response.data);
        } catch (apiErr: any) {
          console.warn('API logout failed, but continuing with client-side logout:', {
            error: apiErr.message,
            response: apiErr.response?.data
          });
        }
      } else {
        console.warn('No valid refresh token found, proceeding with client-side logout');
      }
    } catch (err) {
      console.error('Unexpected logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log("Tokens after logout:", {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
      });
      setUser(null);
      setIsLoading(false);
      navigate('/login');
    }
  };

  const updateProfile: AuthContextType['updateProfile'] = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      if (data.profile?.avatar instanceof File) {
        const formData = new FormData();
        if (data.first_name) formData.append('first_name', data.first_name);
        if (data.last_name) formData.append('last_name', data.last_name);
        if (data.username) formData.append('username', data.username);
        if (data.profile.bio) formData.append('profile.bio', data.profile.bio);
        if (data.profile.avatar) formData.append('profile.avatar', data.profile.avatar);
        
        response = await userApi.patch('/profile/', formData, { // Use userApi
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await userApi.patch('/profile/', data); // Use userApi
      }
      
      const updatedUser = response.data;
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Profile update failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAchievements: AuthContextType['getUserAchievements'] = async () => {
    setError(null);
    
    try {
      const response = await userApi.get('/user-achievements/'); // Use userApi
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch achievements.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const requestPasswordReset: AuthContextType['requestPasswordReset'] = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequestPasswordReset(data);
      console.log("Password reset request response:", response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Password reset request failed.';
      console.log("Password reset error:", err.response?.status, err.response?.data);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset: AuthContextType['confirmPasswordReset'] = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiConfirmPasswordReset(data);
      console.log("Password reset confirm response:", response);
      await new Promise(resolve => setTimeout(resolve, 5000));
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Password reset confirmation failed.';
      console.log("Password reset confirm error:", err.response?.status, err.response?.data);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError: AuthContextType['clearError'] = useCallback(() => {
    console.log("Clearing error [AuthProvider]");
    setError(null);
  }, []);

  useEffect(() => {
    console.log("Auth state changed:", !!user);
  }, [user]);

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    getUserAchievements,
    getUserProfile,
    requestPasswordReset,
    confirmPasswordReset,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}