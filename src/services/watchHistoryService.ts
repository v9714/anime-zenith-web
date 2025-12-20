import { interactionApi } from "./backendApi";

interface WatchHistoryData {
    animeId: number;
    episodeId: number;
    timestamp: number;
    duration: number;
}

interface WatchHistoryUpdateResponse {
    success: boolean;
    message: string;
    data: {
        animeId: number;
        episodeId: number;
        lastWatched: string;
    };
}

export interface WatchHistoryItem {
    animeId: number;
    title: string;
    imageUrl: string;
    episodeNumber: number;
    episodeTitle: string;
    episodeThumbnail: string;
    timestamp: number;
    watchedPercentage: number;
    lastWatched: string;
}

interface WatchHistoryListResponse {
    success: boolean;
    message: string;
    data: WatchHistoryItem[];
}

interface AnimeWatchHistoryResponse {
    success: boolean;
    message: string;
    data: {
        animeId: number;
        episodeNumber: number;
        episodeTitle: string;
        timestamp: number;
        watchedPercentage: number;
        lastWatched: string;
    } | null;
}

interface DeleteWatchHistoryResponse {
    success: boolean;
    message: string;
    data: null;
}

interface ClearWatchHistoryResponse {
    success: boolean;
    message: string;
    data: {
        deletedCount: number;
    };
}

export const watchHistoryService = {
    // Add to watch history
    addToHistory: async (data: WatchHistoryData): Promise<WatchHistoryUpdateResponse> => {
        const response = await interactionApi.post<WatchHistoryUpdateResponse>('/api/interactions/watch-history', data);
        return response.data;
    },

    // Get user's watch history
    getWatchHistory: async (limit: number = 20, offset: number = 0): Promise<WatchHistoryListResponse> => {
        const response = await interactionApi.get<WatchHistoryListResponse>(`/api/interactions/watch-history?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    // Get watch history for specific anime
    getAnimeWatchHistory: async (animeId: number): Promise<AnimeWatchHistoryResponse> => {
        try {
            const response = await interactionApi.get<AnimeWatchHistoryResponse>(`/api/interactions/watch-history/${animeId}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "No watch history found",
                data: null
            };
        }
    },

    // Delete watch history entry for an anime
    deleteAnimeHistory: async (animeId: number): Promise<DeleteWatchHistoryResponse> => {
        const response = await interactionApi.delete<DeleteWatchHistoryResponse>(`/api/interactions/watch-history/${animeId}`);
        return response.data;
    },

    // Clear all watch history
    clearAllHistory: async (): Promise<ClearWatchHistoryResponse> => {
        const response = await interactionApi.delete<ClearWatchHistoryResponse>('/api/interactions/watch-history');
        return response.data;
    }
};
