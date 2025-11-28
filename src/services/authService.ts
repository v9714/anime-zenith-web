import backendAPI from "./backendApi";

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

export const authService = {
  register: async (email: string, displayName: string): Promise<RegisterResponse> => {
    const response = await backendAPI.post<RegisterResponse>('/auth/register', {
      email,
      displayName
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await backendAPI.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await backendAPI.post<RefreshTokenResponse>('/auth/refresh-token', {});
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await backendAPI.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await backendAPI.post<ResetPasswordResponse>('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await backendAPI.post('/auth/logout', {});
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.error('Logout error:', error);
    } finally {
      const { removeToken } = await import('./backendApi');
      removeToken('accessToken');
      removeToken('refreshToken');
    }
  }
};

export default backendAPI;