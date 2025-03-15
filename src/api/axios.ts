import axios from 'axios';

// Factory function to create Axios instances with shared config and interceptors
const createApiInstance = (baseURL: string) => {
  // Create instance with base URL and default headers
  const instance = axios.create({
    baseURL: import.meta.env?.VITE_API_URL || baseURL, // Use env var or fallback
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 10-second timeout
  });

  // Inject JWT token into every request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Token refresh logic
  let isRefreshing = false;
  let failedQueue: any[] = [];

  // Process queued requests after refresh
  const processQueue = (error: any, token = null) => {
    failedQueue.forEach(prom => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    failedQueue = [];
  };

  // Handle 401 errors by refreshing token
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (originalRequest.url.includes('/token/')) return Promise.reject(error); // Skip for login
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue request if refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            window.location.href = '/login';
            return Promise.reject(error);
          }
          const baseURL = import.meta.env?.VITE_API_URL || '/api/users';
          const response = await axios.post(`${baseURL}/token/refresh/`, { refresh: refreshToken });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          processQueue(null, access);
          isRefreshing = false;
          return instance(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          processQueue(err, null);
          isRefreshing = false;
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export instances for users and tutorials
export const userApi = createApiInstance('/api/users'); // For auth and user endpoints
export const tutorialApi = createApiInstance('/api/tutorials'); // For tutorial endpoints