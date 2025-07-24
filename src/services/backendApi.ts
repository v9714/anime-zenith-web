import axios from "axios";

// Backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081";

// LocalStorage utility functions for tokens
export const getToken = (name: string): string | null => {
  try {
    return localStorage.getItem(name);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const setToken = (name: string, value: string) => {
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const removeToken = (name: string) => {
  try {
    localStorage.removeItem(name);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Create unified axios instance for backend API
const backendAPI = axios.create({
  baseURL: BACKEND_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add token to headers
backendAPI.interceptors.request.use(
  (config) => {
    const token = getToken('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track refresh token state to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle token refresh
backendAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return backendAPI(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a separate axios instance to avoid interceptor loops
        const refreshResponse = await axios.post(
          `${BACKEND_API_BASE_URL}/auth/refresh-token`, 
          {}, 
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          
          // Set new tokens in localStorage
          setToken('accessToken', accessToken);
          setToken('refreshToken', newRefreshToken);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Process the queued requests
          processQueue(null, accessToken);
          
          return backendAPI(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        // Process queue with error
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        removeToken('accessToken');
        removeToken('refreshToken');
        
        // Only redirect if we're not already on the home page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default backendAPI;