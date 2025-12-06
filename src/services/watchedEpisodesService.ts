import backendAPI from "./backendApi";

interface WatchedEpisodeDetail {
    episodeNumber: number;
    episodeId: number;
    watchedAt: string;
}

interface WatchedEpisodesResponse {
    success: boolean;
    message: string;
    data: {
        animeId: number;
        watchedEpisodes: number[];
        details: WatchedEpisodeDetail[];
    };
}

interface MarkWatchedResponse {
    success: boolean;
    message: string;
    data: {
        episodeId: number;
        watchedAt: string;
    };
}

interface UnmarkWatchedResponse {
    success: boolean;
    message: string;
    data: null;
}

interface WatchProgressResponse {
    success: boolean;
    message: string;
    data: {
        animeId: number;
        totalEpisodes: number;
        watchedEpisodes: number;
        percentage: number;
    };
}

export interface WatchedAnime {
    animeId: number;
    title: string;
    coverImage: string;
    totalEpisodes: number;
    watchedEpisodes: number;
    percentage: number;
    lastWatchedAt: string;
}

interface AllWatchedAnimesResponse {
    success: boolean;
    message: string;
    data: WatchedAnime[];
}

export const watchedEpisodesService = {
    markAsWatched: async (animeId: number, episodeId: number, episodeNumber: number): Promise<MarkWatchedResponse> => {
        const response = await backendAPI.post<MarkWatchedResponse>('/api/interactions/watched-episodes', {
            animeId,
            episodeId,
            episodeNumber
        });
        return response.data;
    },

    getWatchedEpisodes: async (animeId: number): Promise<WatchedEpisodesResponse> => {
        const response = await backendAPI.get<WatchedEpisodesResponse>(`/api/interactions/watched-episodes/${animeId}`);
        return response.data;
    },

    unmarkAsWatched: async (episodeId: number): Promise<UnmarkWatchedResponse> => {
        const response = await backendAPI.delete<UnmarkWatchedResponse>(`/api/interactions/watched-episodes/${episodeId}`);
        return response.data;
    },

    getWatchProgress: async (animeId: number): Promise<WatchProgressResponse> => {
        const response = await backendAPI.get<WatchProgressResponse>(`/api/interactions/watched-episodes/${animeId}/progress`);
        return response.data;
    },

    getAllWatchedAnimes: async (limit: number = 50, offset: number = 0): Promise<AllWatchedAnimesResponse> => {
        const response = await backendAPI.get<AllWatchedAnimesResponse>(`/api/interactions/watched-episodes?limit=${limit}&offset=${offset}`);
        return response.data;
    }
};
