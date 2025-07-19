import axios from "axios";

// Backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081";

// Cookie utility functions
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
backendAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${BACKEND_API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Set new tokens in cookies
          setCookie('accessToken', accessToken, 1); // 1 day
          setCookie('refreshToken', newRefreshToken, 7); // 7 days
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return backendAPI(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default backendAPI;