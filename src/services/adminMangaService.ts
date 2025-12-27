import { mangaApi } from "./backendApi";
import { Manga, Chapter } from "./mangaService";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Paginated admin manga response
export interface PaginatedAdminMangaResponse {
    manga: Manga[];
    currentPage: number;
    totalPages: number;
    total: number;
}

// Manga admin filters
export interface MangaFilters {
    search?: string;
    status?: string;
}

export const adminMangaService = {
    getMangaForAdmin: async (page: number = 1, limit: number = 15, filters: MangaFilters = {}): Promise<ApiResponse<PaginatedAdminMangaResponse>> => {
        const response = await mangaApi.get<ApiResponse<PaginatedAdminMangaResponse>>('/api/admin/manga', {
            params: {
                page,
                limit,
                ...filters
            }
        });
        return response.data;
    },

    createManga: async (formData: FormData): Promise<ApiResponse<Manga>> => {
        const response = await mangaApi.post<ApiResponse<Manga>>('/api/admin/manga', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateManga: async (id: number, formData: FormData): Promise<ApiResponse<Manga>> => {
        const response = await mangaApi.patch<ApiResponse<Manga>>(`/api/admin/manga/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteManga: async (id: number): Promise<ApiResponse<null>> => {
        const response = await mangaApi.delete<ApiResponse<null>>(`/api/admin/manga/${id}`);
        return response.data;
    },

    hardDeleteManga: async (id: number): Promise<ApiResponse<null>> => {
        const response = await mangaApi.delete<ApiResponse<null>>(`/api/admin/manga/${id}/hard`);
        return response.data;
    },

    uploadChapter: async (mangaId: number, formData: FormData): Promise<ApiResponse<Chapter>> => {
        const response = await mangaApi.post<ApiResponse<Chapter>>(`/api/admin/manga/${mangaId}/chapter`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteChapter: async (id: number): Promise<ApiResponse<null>> => {
        const response = await mangaApi.delete<ApiResponse<null>>(`/api/admin/manga/chapter/${id}`);
        return response.data;
    }
};
