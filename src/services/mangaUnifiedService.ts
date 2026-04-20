import { mangaService, Manga, Chapter, MangaDetails, PaginatedMangaResponse } from './mangaService';
import { mangaDexService, isMangaDexId, extractMangaDexId } from './mangaDexService';

// ─── Unified Manga Service ───────────────────────────────────────────────────
// Merges local backend manga with MangaDex open API manga.
// Local manga always appear first; MangaDex fills the rest.

interface UnifiedApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const mangaUnifiedService = {
    /**
     * Get all manga: local first, then MangaDex popular to fill remaining slots
     */
    getAllManga: async (page: number = 1, limit: number = 20): Promise<UnifiedApiResponse<PaginatedMangaResponse>> => {
        try {
            // Fetch both in parallel
            const [localRes, mdxManga] = await Promise.allSettled([
                mangaService.getAllManga(page, limit).catch(() => null),
                mangaDexService.getPopularManga(limit, (page - 1) * limit),
            ]);

            const localData = localRes.status === 'fulfilled' && localRes.value?.success
                ? localRes.value.data.data : [];
            const mdxData = mdxManga.status === 'fulfilled' ? mdxManga.value : [];

            // Mark local manga
            const markedLocal = localData.map((m: Manga) => ({ ...m, _source: 'local' as const }));

            // Combine: local first, then MangaDex
            const combined = [...markedLocal, ...mdxData];

            // Get total from local response if available
            const localMeta = localRes.status === 'fulfilled' && localRes.value?.success
                ? localRes.value.data.meta : null;

            return {
                success: true,
                message: 'OK',
                data: {
                    data: combined,
                    meta: {
                        page,
                        limit,
                        total: (localMeta?.total || 0) + mdxData.length,
                        totalPages: Math.max(localMeta?.totalPages || 1, 10), // MangaDex has many pages
                        hasNext: true,
                        hasPrev: page > 1,
                    }
                }
            };
        } catch (error) {
            console.error('UnifiedService: Error in getAllManga:', error);
            // Fallback to MangaDex only
            const mdxManga = await mangaDexService.getPopularManga(limit, (page - 1) * limit);
            return {
                success: true,
                message: 'MangaDex only',
                data: {
                    data: mdxManga,
                    meta: { page, limit, total: mdxManga.length, totalPages: 10, hasNext: true, hasPrev: page > 1 }
                }
            };
        }
    },

    /**
     * Search manga across both local and MangaDex
     */
    searchManga: async (query: string, page: number = 1, limit: number = 20): Promise<UnifiedApiResponse<PaginatedMangaResponse>> => {
        try {
            const [localRes, mdxResults] = await Promise.allSettled([
                mangaService.searchManga(query, page, limit).catch(() => null),
                mangaDexService.searchManga(query, limit, (page - 1) * limit),
            ]);

            const localData = localRes.status === 'fulfilled' && localRes.value?.success
                ? localRes.value.data.data : [];
            const mdxData = mdxResults.status === 'fulfilled' ? mdxResults.value : [];

            const markedLocal = localData.map((m: Manga) => ({ ...m, _source: 'local' as const }));

            // Deduplicate by title similarity
            const localTitles = new Set(markedLocal.map((m: Manga) => m.title.toLowerCase().trim()));
            const filteredMdx = mdxData.filter((m: Manga) => !localTitles.has(m.title.toLowerCase().trim()));

            const combined = [...markedLocal, ...filteredMdx];

            const localMeta = localRes.status === 'fulfilled' && localRes.value?.success
                ? localRes.value.data.meta : null;

            return {
                success: true,
                message: 'OK',
                data: {
                    data: combined,
                    meta: {
                        page,
                        limit,
                        total: combined.length,
                        totalPages: Math.max(localMeta?.totalPages || 1, 5),
                        hasNext: true,
                        hasPrev: page > 1,
                    }
                }
            };
        } catch (error) {
            console.error('UnifiedService: Error in searchManga:', error);
            return {
                success: true,
                message: 'Error',
                data: { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } }
            };
        }
    },

    /**
     * Get manga details - routes to correct source based on ID
     */
    getMangaDetails: async (id: string | number): Promise<MangaDetails | null> => {
        if (isMangaDexId(String(id))) {
            const rawId = extractMangaDexId(String(id));
            const [manga, chapters] = await Promise.all([
                mangaDexService.getMangaById(rawId),
                mangaDexService.getMangaChapters(rawId),
            ]);
            if (!manga) return null;
            return {
                ...manga,
                chapters,
            } as MangaDetails;
        } else {
            // Local manga
            try {
                const res = await mangaService.getMangaDetails(Number(id));
                if (res.success) {
                    return { ...res.data, _source: 'local' };
                }
                return null;
            } catch {
                return null;
            }
        }
    },

    /**
     * Get chapter pages - for MangaDex chapters, fetches from at-home server
     */
    getChapterPages: async (chapterId: string | number): Promise<string[]> => {
        if (isMangaDexId(String(chapterId))) {
            const rawId = extractMangaDexId(String(chapterId));
            return mangaDexService.getChapterPages(rawId);
        }
        return []; // Local chapters use PDF/images via existing mechanism
    },

    /**
     * Get popular manga from MangaDex (for specific sections)
     */
    getPopularManga: async (limit: number = 20): Promise<Manga[]> => {
        return mangaDexService.getPopularManga(limit);
    },

    /**
     * Get latest updated manga from MangaDex (for specific sections)
     */
    getLatestManga: async (limit: number = 20): Promise<Manga[]> => {
        return mangaDexService.getLatestManga(limit);
    },

    /**
     * Get recently added manga from MangaDex
     */
    getRecentManga: async (limit: number = 15): Promise<Manga[]> => {
        return mangaDexService.getRecentManga(limit);
    },

    /**
     * Check if a manga ID is from MangaDex
     */
    isMangaDex: (id: string | number): boolean => {
        return isMangaDexId(String(id));
    },
};
