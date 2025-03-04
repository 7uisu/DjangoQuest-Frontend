// src/api/axios.ts
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || '/api', // For Vite
  // OR if using Create React App, use window._env_ pattern
  // baseURL: (window as any)._env_?.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip redirect for /token/ requests (login)
    if (originalRequest.url.includes('/token/')) {
      return Promise.reject(error);
    }
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Define the base URL the same way as above
        const baseURL = import.meta.env?.VITE_API_URL || '/api';
        
        // Try to refresh the token
        const response = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        
        // Save the new token
        localStorage.setItem('access_token', access);
        
        // Update the header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Process any queued requests
        processQueue(null, access);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Process queued requests with error
        processQueue(err, null);
        isRefreshing = false;
        
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;