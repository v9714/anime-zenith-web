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

export interface WatchlistAnime {
  animeId: number;
  title: string;
  coverImage: string;
  year: number;
  rating: number;
  status: string;
  addedAt: string;
}

interface WatchlistResponse {
  success: boolean;
  data: WatchlistAnime[];
}

interface WatchlistStatusResponse {
  success: boolean;
  data: {
    isInWatchlist: boolean;
  };
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

  getLikedEpisodes: async (limit: number = 20, offset: number = 0): Promise<LikedEpisodesResponse> => {
    const response = await backendAPI.get<LikedEpisodesResponse>(`/api/interactions/episode/liked?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

export const watchlistService = {
  getWatchlist: async (limit: number = 50, offset: number = 0): Promise<WatchlistResponse> => {
    const response = await backendAPI.get<WatchlistResponse>(`/api/interactions/watchlist/?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  addToWatchlist: async (animeId: number): Promise<{ success: boolean; message: string }> => {
    const response = await backendAPI.post<{ success: boolean; message: string }>('/api/interactions/watchlist', {
      animeId
    });
    return response.data;
  },

  removeFromWatchlist: async (animeId: number): Promise<{ success: boolean }> => {
    const response = await backendAPI.delete<{ success: boolean }>(`/api/interactions/watchlist/${animeId}`);
    return response.data;
  },

  getWatchlistStatus: async (animeId: number): Promise<WatchlistStatusResponse> => {
    const response = await backendAPI.get<WatchlistStatusResponse>(`/api/interactions/watchlist/${animeId}/status`);
    return response.data;
  }
};
