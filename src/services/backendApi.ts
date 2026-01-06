import {
  AUTH_API_URL,
  CONTENT_API_URL,
  USER_API_URL,
  INTERACTION_API_URL,
  COMMENTS_API_URL,
  MANGA_API_URL,
  STORAGE_KEYS
} from "@/utils/constants";
import axios, { AxiosInstance } from "axios";

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

// Track refresh token state globally to prevent loops
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

// Function to attach interceptors to an instance
const attachInterceptors = (instance: AxiosInstance, requiresAuth: boolean = true) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getToken(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && requiresAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only handle 401 and redirect for services that require auth
      if (error.response?.status === 401 && !originalRequest._retry && requiresAuth) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // IMPORTANT: Root refresh MUST happen via Auth Service (Port 8000)
          // Since withCredentials is true, the browser will automatically send the refresh cookie
          const refreshResponse = await axios.post(
            `${AUTH_API_URL}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' }
            }
          );

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

            // Still update localStorage for UI compatibility, but security is now in cookies
            if (accessToken) setToken(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            if (newRefreshToken) setToken(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            // Re-run the original request
            // If the browser supports cross-port cookies, the new cookie will be sent automatically
            if (accessToken) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              processQueue(null, accessToken);
            } else {
              processQueue(null, null);
            }
            return instance(originalRequest);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          removeToken(STORAGE_KEYS.ACCESS_TOKEN);
          removeToken(STORAGE_KEYS.REFRESH_TOKEN);
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
};

// Create specialized Axios instances
export const authApi = axios.create({ baseURL: AUTH_API_URL, withCredentials: true });
export const contentApi = axios.create({ baseURL: CONTENT_API_URL, withCredentials: true });
export const userApi = axios.create({ baseURL: USER_API_URL, withCredentials: true });
export const interactionApi = axios.create({ baseURL: INTERACTION_API_URL, withCredentials: true });
export const commentsApi = axios.create({ baseURL: COMMENTS_API_URL, withCredentials: true });
export const mangaApi = axios.create({ baseURL: MANGA_API_URL, withCredentials: true });

// Attach interceptors to all instances
// Manga API doesn't require authentication (public access)
[authApi, contentApi, userApi, interactionApi, commentsApi].forEach(api => attachInterceptors(api, true));
attachInterceptors(mangaApi, false); // Manga is public, no auth required