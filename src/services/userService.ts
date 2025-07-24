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

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await backendAPI.get<UserProfileResponse>('/api/users/me');
    return response.data;
  }
};