import { authApi } from "./backendApi";

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

export interface RegisterResponse {
  statusCode: number;
  data: {
    id: number;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    isPremium: boolean;
    isAdmin: boolean;
    createdAt: string;
    lastLogin: string | null;
  };
  message: string;
  success: boolean;
}

export interface ForgotPasswordResponse {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
}

export interface ResetPasswordResponse {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
}

export interface VerifyEmailResponse {
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
  register: async (email: string, displayName: string): Promise<RegisterResponse> => {
    const response = await authApi.post<RegisterResponse>('/auth/register', {
      email,
      displayName
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authApi.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await authApi.post<RefreshTokenResponse>('/auth/refresh-token', {});
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await authApi.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await authApi.post<ResetPasswordResponse>('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await authApi.post<VerifyEmailResponse>('/auth/verify-email', {
      token
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      const { removeToken } = await import('./backendApi');
      removeToken('accessToken');
      removeToken('refreshToken');
    }
  }
};
