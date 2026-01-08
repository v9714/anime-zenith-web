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
const attachInterceptors = (instance: AxiosInstance, requiresAuth: boolean = true, autoRedirect: boolean = true) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = getToken(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && (requiresAuth || token)) { // Attach token even if auth is optional but token exists
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

      // Only handle 401 and refresh if there's a 401 error
      if (error.response?.status === 401 && !originalRequest._retry) {
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

            if (accessToken) setToken(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            if (newRefreshToken) setToken(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

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

          // ONLY redirect if autoRedirect is explicitly enabled (for core user functions)
          if (autoRedirect && window.location.pathname !== '/') {
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
// Manga API allows optional auth - sends credentials for logged-in users
export const mangaApi = axios.create({ baseURL: MANGA_API_URL, withCredentials: true });

// Attach interceptors to all instances
// authApi and userApi require strict auth and redirect on failure
[authApi, userApi].forEach(api => attachInterceptors(api, true, true));

// contentApi, interactionApi, commentsApi, and mangaApi are public but use auth if available
// They should NOT redirect on session expiry to prevent interrupting public viewing
[contentApi, interactionApi, commentsApi, mangaApi].forEach(api => attachInterceptors(api, true, false));