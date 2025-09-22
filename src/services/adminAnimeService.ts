import backendAPI from "./backendApi";
import { Anime } from "./api";

export interface AdminAnimeResponse {
    statusCode: number;
    data: Anime[];
    message: string;
    success: boolean;
}

export interface PaginatedAnimeResponse {
    statusCode: number;
    data: {
        anime: Anime[];
        totalPages: number;
        currentPage: number;
        totalAnime: number;
        limit: number;
    };
    message: string;
    success: boolean;
}

export interface AnimeFilters {
    search?: string;
    status?: string;
    type?: string;
    genre?: string;
    year?: number;
}

export const adminAnimeService = {
    getAllAnime: async (): Promise<AdminAnimeResponse> => {
        const response = await backendAPI.get<AdminAnimeResponse>('/api/admin/anime');
        return response.data;
    },

    getPaginatedAnime: async (
        page: number = 1,
        limit: number = 20,
        filters?: AnimeFilters
    ): Promise<PaginatedAnimeResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.genre) params.append('genre', filters.genre);
        if (filters?.year) params.append('year', filters.year.toString());

        const response = await backendAPI.get<PaginatedAnimeResponse>(`/api/admin/anime?${params.toString()}`);
        return response.data;
    },

    // Create new anime
    createAnime: async (animeData: Partial<Anime>) => {
        const config = animeData instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};

        const response = await backendAPI.post('/api/admin/anime/', animeData, config);
        return response.data;
    },

    // Update existing anime
    updateAnime: async (id: string | number, animeData: Partial<Anime>) => {
        const config = animeData instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};

        const response = await backendAPI.patch(`/api/admin/anime/${id}`, animeData, config);
        return response.data;
    },

    // Delete anime
    deleteAnime: async (id: string | number) => {
        const response = await backendAPI.delete(`/api/admin/anime/${id}`);
        return response.data;
    }
};