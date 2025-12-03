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

export interface LikedEpisode {
  episodeId: number;
  episodeNumber: number;
  episodeTitle: string;
  thumbnail: string;
  animeId: number;
  animeTitle: string;
  animeCover: string;
  likedAt: string;
}

interface LikedEpisodesResponse {
  success: boolean;
  data: LikedEpisode[];
}

export const likeService = {
  toggleLike: async (episodeId: number, animeId: number, isLiked: boolean): Promise<LikeResponse> => {
    const response = await backendAPI.post<LikeResponse>('/api/interactions/episode/like', {
      episodeId,
      animeId,
      isLiked
    });
    return response.data;
  },

  getLikeStatus: async (episodeId: number): Promise<LikeStatusResponse> => {
    const response = await backendAPI.get<LikeStatusResponse>(`/api/interactions/episode/${episodeId}/like-status`);
    return response.data;
  },

  getLikedEpisodes: async (): Promise<LikedEpisodesResponse> => {
    const response = await backendAPI.get<LikedEpisodesResponse>('/api/interactions/episode/liked');
    return response.data;
  }
};
