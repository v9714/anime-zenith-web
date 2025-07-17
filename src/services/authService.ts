import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

// Create axios instance for auth
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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

// Request interceptor to add token to headers
authAPI.interceptors.request.use(
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
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Set new tokens in cookies
          setCookie('accessToken', accessToken, 1); // 1 day
          setCookie('refreshToken', newRefreshToken, 7); // 7 days
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return authAPI(originalRequest);
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

export interface LoginResponse {
  statusCode: number;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      isPremium: boolean;
      isAdmin: boolean;
      createdAt: string;
      lastLogin: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

export interface RefreshTokenResponse {
  statusCode: number;
  data: {
    user: {
      id: string;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      isPremium: boolean;
      isAdmin: boolean;
      createdAt: string;
      lastLogin: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authAPI.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await authAPI.post<RefreshTokenResponse>('/auth/refresh-token', {});
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await authAPI.post('/auth/logout', {});
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.error('Logout error:', error);
    } finally {
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
    }
  }
};

export default authAPI;