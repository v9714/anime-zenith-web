import { contentApi } from "./backendApi";

export interface Genre {
    id: number;
    name: string;
    description: string | null;
    animeCount?: number;
}

export interface GenreResponse {
    statusCode: number;
    data: Genre[];
    message: string;
    success: boolean;
}

export interface SingleGenreResponse {
    statusCode: number;
    data: Genre;
    message: string;
    success: boolean;
}

export const genreService = {
    // Get all genres
    getAllGenres: async (): Promise<GenreResponse> => {
        const response = await contentApi.get<GenreResponse>('/api/anime/genres');
        return response.data;
    },

    // Search genres
    searchGenres: async (query: string): Promise<GenreResponse> => {
        const response = await contentApi.get<GenreResponse>(`/api/admin/anime/genres/search?q=${query}`);
        return response.data;
    },

    // Create a new genre
    createGenre: async (name: string): Promise<SingleGenreResponse> => {
        const response = await contentApi.post<SingleGenreResponse>('/api/admin/genres', { name });
        return response.data;
    },

    // Update a genre
    updateGenre: async (id: number, name: string): Promise<SingleGenreResponse> => {
        const response = await contentApi.patch<SingleGenreResponse>(`/api/admin/genres/${id}`, { name });
        return response.data;
    },

    // Delete a genre
    deleteGenre: async (id: number) => {
        const response = await contentApi.delete(`/api/admin/genres/${id}`);
        return response.data;
    },

    // Add genre to anime
    addGenreToAnime: async (animeId: string | number, genreId: number) => {
        const response = await contentApi.post(`/api/admin/admin/${animeId}/genres`, { genreId });
        return response.data;
    },

    // Remove genre from anime
    removeGenreFromAnime: async (animeId: string | number, genreId: number) => {
        const response = await contentApi.delete(`/api/admin/anime/${animeId}/genres/${genreId}`);
        return response.data;
    }
};
