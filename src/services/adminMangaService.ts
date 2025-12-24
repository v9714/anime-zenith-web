import { mangaApi } from "./backendApi";
import { Manga, Chapter } from "./mangaService";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const adminMangaService = {
    getMangaForAdmin: async (): Promise<ApiResponse<Manga[]>> => {
        const response = await mangaApi.get<ApiResponse<Manga[]>>('/api/admin/manga');
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
