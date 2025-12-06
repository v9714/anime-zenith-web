import backendAPI from "./backendApi";

interface VideoProgressData {
    animeId: number;
    episodeId: number;
    currentTime: number;
    duration: number;
}

interface VideoProgressResponse {
    success: boolean;
    message: string;
    data: {
        episodeId: number;
        currentTime: number;
        percentage: number;
    };
}

interface GetProgressResponse {
    success: boolean;
    message: string;
    data: {
        episodeId: number;
        currentTime: number;
        duration: number;
        lastUpdated: string;
    } | null;
}

interface AnimeProgressItem {
    episodeId: number;
    episodeNumber: number;
    episodeTitle: string;
    currentTime: number;
    duration: number;
    percentage: number;
    lastUpdated: string;
}

interface AnimeProgressResponse {
    success: boolean;
    message: string;
    data: AnimeProgressItem[];
}

interface BatchProgressResponse {
    success: boolean;
    message: string;
    data: {
        saved: number;
    };
}

interface DeleteProgressResponse {
    success: boolean;
    message: string;
    data: null;
}

export const videoProgressService = {
    // Save current playback position
    saveProgress: async (data: VideoProgressData): Promise<VideoProgressResponse> => {
        const response = await backendAPI.post<VideoProgressResponse>('/api/interactions/video-progress', data);
        return response.data;
    },

    // Save multiple progress entries at once
    saveBatchProgress: async (progressData: VideoProgressData[]): Promise<BatchProgressResponse> => {
        const response = await backendAPI.post<BatchProgressResponse>('/api/interactions/video-progress/batch', {
            progressData
        });
        return response.data;
    },

    // Get saved playback position for an episode
    getProgress: async (episodeId: number): Promise<GetProgressResponse> => {
        try {
            const response = await backendAPI.get<GetProgressResponse>(`/api/interactions/video-progress/${episodeId}`);
            return response.data;
        } catch (error) {
            // Return null data if no progress found
            return {
                success: false,
                message: "No progress found",
                data: null
            };
        }
    },

    // Get all progress for an anime
    getAnimeProgress: async (animeId: number): Promise<AnimeProgressResponse> => {
        const response = await backendAPI.get<AnimeProgressResponse>(`/api/interactions/video-progress/anime/${animeId}`);
        return response.data;
    },

    // Delete progress for an episode
    deleteProgress: async (episodeId: number): Promise<DeleteProgressResponse> => {
        const response = await backendAPI.delete<DeleteProgressResponse>(`/api/interactions/video-progress/${episodeId}`);
        return response.data;
    }
};
