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

export interface WatchedEpisodeItem {
    episodeId: number;
    episodeNumber: number;
    episodeTitle: string;
    thumbnail: string | null;
    duration: number;
    animeId: number;
    animeTitle: string;
    animeCover: string;
    watchedAt: string;
}

interface AllWatchedEpisodesResponse {
    success: boolean;
    message: string;
    data: WatchedEpisodeItem[];
}

export interface GroupedWatchedAnime {
    animeId: number;
    title: string;
    coverImage: string;
    watchedEpisodesCount: number;
    lastWatchedAt: string;
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

    getAllWatchedEpisodes: async (limit: number = 50, offset: number = 0): Promise<AllWatchedEpisodesResponse> => {
        const response = await backendAPI.get<AllWatchedEpisodesResponse>(`/api/interactions/watched-episodes?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    getGroupedWatchedAnimes: async (limit: number = 50, offset: number = 0): Promise<GroupedWatchedAnime[]> => {
        const response = await backendAPI.get<AllWatchedEpisodesResponse>(`/api/interactions/watched-episodes?limit=${limit}&offset=${offset}`);
        if (!response.data.success) return [];

        // Group episodes by anime
        const animeMap = new Map<number, GroupedWatchedAnime>();
        response.data.data.forEach(episode => {
            const existing = animeMap.get(episode.animeId);
            if (existing) {
                existing.watchedEpisodesCount++;
                if (new Date(episode.watchedAt) > new Date(existing.lastWatchedAt)) {
                    existing.lastWatchedAt = episode.watchedAt;
                }
            } else {
                animeMap.set(episode.animeId, {
                    animeId: episode.animeId,
                    title: episode.animeTitle,
                    coverImage: episode.animeCover,
                    watchedEpisodesCount: 1,
                    lastWatchedAt: episode.watchedAt
                });
            }
        });

        return Array.from(animeMap.values());
    }
};
