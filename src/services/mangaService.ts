import { mangaApi, interactionApi } from "./backendApi";

export interface Genre {
    id: number;
    name: string;
}

export interface MangaGenre {
    mangaId: number;
    genreId: number;
    genre: Genre;
}

export interface Manga {
    id: number;
    title: string;
    titleEng?: string;
    titleJp?: string;
    alternativeTitles: string[];
    description: string;
    coverImage: string;
    bannerImage: string;
    status: string;
    author: string;
    artist: string;
    rating: string;
    votesCount: number;
    releaseYear?: number;
    isDeleted: boolean;
    updatedAt: string;
    genres?: MangaGenre[];
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
    mangaId: number;
    chapterId: number;
    lastPage: number;
    isRead: boolean;
    updatedAt: string;
    manga?: Manga;
    chapter?: Chapter;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Pagination metadata interface
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Paginated manga response (matches backend structure)
export interface PaginatedMangaResponse {
    data: Manga[];
    meta: PaginationMeta;
}

export const mangaService = {
    getAllManga: async (page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedMangaResponse>> => {
        const response = await mangaApi.get<ApiResponse<PaginatedMangaResponse>>('/api/manga', {
            params: { page, limit }
        });
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
        const response = await interactionApi.post<ApiResponse<MangaProgress>>('/api/interactions/manga/progress', data);
        return response.data;
    },

    getProgress: async (mangaId: number): Promise<ApiResponse<MangaProgress>> => {
        const response = await interactionApi.get<ApiResponse<MangaProgress>>(`/api/interactions/manga/${mangaId}/progress`);
        return response.data;
    },

    // Interactions
    toggleLike: async (mangaId: number): Promise<ApiResponse<{ isLiked: boolean; totalLikes: number }>> => {
        const response = await interactionApi.post<ApiResponse<{ isLiked: boolean; totalLikes: number }>>('/api/interactions/manga/like', { mangaId });
        return response.data;
    },

    getLikeStatus: async (mangaId: number): Promise<ApiResponse<{ isLiked: boolean; totalLikes: number }>> => {
        const response = await interactionApi.get<ApiResponse<{ isLiked: boolean; totalLikes: number }>>(`/api/interactions/manga/${mangaId}/like-status`);
        return response.data;
    },

    toggleBookmark: async (mangaId: number): Promise<ApiResponse<{ isBookmarked: boolean }>> => {
        const response = await interactionApi.post<ApiResponse<{ isBookmarked: boolean }>>('/api/interactions/manga/bookmark', { mangaId });
        return response.data;
    },

    checkBookmarkStatus: async (mangaId: number): Promise<ApiResponse<{ isBookmarked: boolean }>> => {
        const response = await interactionApi.get<ApiResponse<{ isBookmarked: boolean }>>(`/api/interactions/manga/${mangaId}/bookmark-status`);
        return response.data;
    },

    getLikedManga: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Manga[]>> => {
        const response = await interactionApi.get<ApiResponse<Manga[]>>('/api/interactions/manga/liked', {
            params: { limit, offset }
        });
        return response.data;
    },

    getBookmarkedManga: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Manga[]>> => {
        const response = await interactionApi.get<ApiResponse<Manga[]>>('/api/interactions/manga/bookmarked', {
            params: { limit, offset }
        });
        return response.data;
    },

    getAllMangaProgress: async (): Promise<ApiResponse<MangaProgress[]>> => {
        const response = await interactionApi.get<ApiResponse<MangaProgress[]>>('/api/interactions/manga/progress/all');
        return response.data;
    },

    searchManga: async (title: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedMangaResponse>> => {
        const response = await mangaApi.get<ApiResponse<PaginatedMangaResponse>>('/api/manga/search', {
            params: { title, page, limit }
        });
        return response.data;
    }
};
