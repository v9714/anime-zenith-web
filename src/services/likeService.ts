import backendAPI from "./backendApi";

interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    episodeId: number;
    userId: number;
    isLiked: boolean;
    totalLikes: number;
  };
}

interface LikeStatusResponse {
  success: boolean;
  data: {
    isLiked: boolean;
  };
}

export const likeService = {
  toggleLike: async (episodeId: number, animeId: number, isLiked: boolean): Promise<LikeResponse> => {
    const response = await backendAPI.post<LikeResponse>('/api/episode/like', {
      episodeId,
      animeId,
      isLiked
    });
    return response.data;
  },

  getLikeStatus: async (episodeId: number): Promise<LikeStatusResponse> => {
    const response = await backendAPI.get<LikeStatusResponse>(`/api/episode/${episodeId}/like-status`);
    return response.data;
  }
};
