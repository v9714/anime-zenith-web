import backendAPI from "./backendApi";

export interface Genre {
    id: number;
    name: string;
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
        const response = await backendAPI.get<GenreResponse>('/api/anime/genres');
        return response.data;
    },

    // Search genres
    searchGenres: async (query: string): Promise<GenreResponse> => {
        const response = await backendAPI.get<GenreResponse>(`/api/admin/anime/genres/search?q=${query}`);
        return response.data;
    },

    // Create new genre
    createGenre: async (name: string): Promise<SingleGenreResponse> => {
        const response = await backendAPI.post<SingleGenreResponse>('/api/admin/genres', { name });
        return response.data;
    },

    // Update genre
    updateGenre: async (id: number, name: string): Promise<SingleGenreResponse> => {
        const response = await backendAPI.patch<SingleGenreResponse>(`/api/admin/genres/${id}`, { name });
        return response.data;
    },

    // Delete genre
    deleteGenre: async (id: number) => {
        const response = await backendAPI.delete(`/api/admin/genres/${id}`);
        return response.data;
    },

    // Add genre to anime
    addGenreToAnime: async (animeId: string | number, genreId: number) => {
        const response = await backendAPI.post(`/api/admin/admin/${animeId}/genres`, { genreId });
        return response.data;
    },

    // Remove genre from anime
    removeGenreFromAnime: async (animeId: string | number, genreId: number) => {
        const response = await backendAPI.delete(`/api/admin/anime/${animeId}/genres/${genreId}`);
        return response.data;
    }
};