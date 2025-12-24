import { mangaApi } from "./backendApi";

export interface Manga {
    id: number;
    title: string;
    alternativeTitles: string[];
    description: string;
    coverImage: string;
    bannerImage: string;
    status: string;
    author: string;
    artist: string;
    rating: string;
    votesCount: number;
    isDeleted: boolean;
    updatedAt: string;
}

export interface Chapter {
    id: number;
    mangaId: number;
    title: string;
    chapterNumber: number;
    pdfUrl: string;
    pagesCount: number;
    views: number;
    createdAt: string;
}

export interface MangaDetails extends Manga {
    chapters: Chapter[];
}

export interface MangaProgress {
    id: number;
    chapterId: number;
    lastPage: number;
    isRead: boolean;
    chapter?: Chapter;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const mangaService = {
    getAllManga: async (): Promise<ApiResponse<Manga[]>> => {
        const response = await mangaApi.get<ApiResponse<Manga[]>>('/api/manga');
        return response.data;
    },

    getMangaDetails: async (id: number): Promise<ApiResponse<MangaDetails>> => {
        const response = await mangaApi.get<ApiResponse<MangaDetails>>(`/api/manga/${id}`);
        return response.data;
    },

    getChapterDetails: async (id: number): Promise<ApiResponse<Chapter>> => {
        const response = await mangaApi.get<ApiResponse<Chapter>>(`/api/manga/chapter/${id}`);
        return response.data;
    },

    updateProgress: async (data: { mangaId: number; chapterId: number; lastPage: number; isRead?: boolean }): Promise<ApiResponse<MangaProgress>> => {
        const response = await mangaApi.post<ApiResponse<MangaProgress>>('/api/manga/progress', data);
        return response.data;
    },

    getProgress: async (mangaId: number): Promise<ApiResponse<MangaProgress>> => {
        const response = await mangaApi.get<ApiResponse<MangaProgress>>(`/api/manga/progress/${mangaId}`);
        return response.data;
    }
};
