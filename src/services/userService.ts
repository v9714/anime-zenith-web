import { userApi } from "./backendApi";

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
  displayName: string;
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

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateProfileWithFileRequest {
  displayName?: string;
  avatarFile?: File;
}

export interface UpdateProfileResponse {
  statusCode: number;
  data: UserProfile;
  message: string;
  success: boolean;
}

export interface DeleteAccountResponse {
  statusCode: number;
  message: string;
  success: boolean;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await userApi.get<UserProfileResponse>('/api/users/profile');
    return response.data;
  },

  getAllUsers: async (): Promise<AdminUsersResponse> => {
    const response = await userApi.get<AdminUsersResponse>('/api/admin/users/');
    return response.data;
  },

  updateUser: async (userId: string, updates: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await userApi.patch<UpdateUserResponse>(`/api/admin/users/${userId}`, updates);
    return response.data;
  },

  updateProfile: async (userId: string, updates: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await userApi.patch<UpdateProfileResponse>(`/api/users/${userId}`, updates);
    return response.data;
  },

  updateProfileWithFile: async (userId: string, updates: UpdateProfileWithFileRequest): Promise<UpdateProfileResponse> => {
    const formData = new FormData();

    if (updates.displayName) {
      formData.append('displayName', updates.displayName);
    }

    if (updates.avatarFile) {
      formData.append('avatar', updates.avatarFile);
    }

    const response = await userApi.patch<UpdateProfileResponse>(`/api/users/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async (userId: string): Promise<DeleteAccountResponse> => {
    const response = await userApi.delete<DeleteAccountResponse>(`/api/users/${userId}`);
    return response.data;
  }
};
