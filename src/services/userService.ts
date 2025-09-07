import backendAPI from "./backendApi";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isPremium: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserProfileResponse {
  statusCode: number;
  data: UserProfile;
  message: string;
  success: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  canComment: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  statusCode: number;
  data: AdminUser[];
  message: string;
  success: boolean;
}

export interface UpdateUserRequest {
  isBlocked?: boolean;
  canComment?: boolean;
}

export interface UpdateUserResponse {
  statusCode: number;
  data: AdminUser;
  message: string;
  success: boolean;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await backendAPI.get<UserProfileResponse>('auth/me');
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUsersResponse> => {
    const response = await backendAPI.get<AdminUsersResponse>('/api/users');
    return response.data;
  },

  updateUser: async (userId: string, updates: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await backendAPI.patch<UpdateUserResponse>(`/api/users/${userId}`, updates);
    return response.data;
  }
};