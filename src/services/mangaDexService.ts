import axios from 'axios';
import { MANGADEX_API_URL, MANGADEX_COVERS_URL } from '@/utils/constants';
import { Manga, Chapter, MangaGenre } from './mangaService';

// ─── MangaDex API Client ─────────────────────────────────────────────────────

const mdxApi = axios.create({
    baseURL: MANGADEX_API_URL,
    timeout: 15000,
});

// Rate limit: simple delay helper (MangaDex allows 5 req/s)
let lastRequestTime = 0;
async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < 200) {
        await new Promise(resolve => setTimeout(resolve, 200 - elapsed));
    }
    lastRequestTime = Date.now();
    return fn();
}

// ─── Helper: Extract cover art URL ───────────────────────────────────────────

function getCoverUrl(manga: any): string {
    const coverRel = manga.relationships?.find((r: any) => r.type === 'cover_art');
    if (coverRel?.attributes?.fileName) {
        return `${MANGADEX_COVERS_URL}/${manga.id}/${coverRel.attributes.fileName}.512.jpg`;
    }
    return '/placeholder-manga.jpg';
}

function getCoverUrlSmall(manga: any): string {
    const coverRel = manga.relationships?.find((r: any) => r.type === 'cover_art');
    if (coverRel?.attributes?.fileName) {
        return `${MANGADEX_COVERS_URL}/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
    }
    return '/placeholder-manga.jpg';
}

// ─── Helper: Extract author/artist name ──────────────────────────────────────

function extractRelName(manga: any, type: string): string {
    const rel = manga.relationships?.find((r: any) => r.type === type);
    return rel?.attributes?.name || 'Unknown';
}

// ─── Helper: Extract tags as MangaGenre format ───────────────────────────────

function extractTags(manga: any): MangaGenre[] {
    const tags = manga.attributes?.tags || [];
    return tags
        .filter((t: any) => t.attributes?.group === 'genre' || t.attributes?.group === 'theme')
        .slice(0, 6)
        .map((t: any, index: number) => ({
            mangaId: 0,
            genreId: index + 1000, // Use high IDs to avoid collision with local genres
            genre: {
                id: index + 1000,
                name: t.attributes?.name?.en || t.attributes?.name?.ja || 'Unknown',
            }
        }));
}

// ─── Helper: Extract alternative titles ──────────────────────────────────────

function extractAltTitles(manga: any): string[] {
    const altTitles = manga.attributes?.altTitles || [];
    const result: string[] = [];
    for (const alt of altTitles.slice(0, 3)) {
        const val = Object.values(alt)[0] as string;
        if (val) result.push(val);
    }
    return result;
}

// ─── Normalize MangaDex manga to our Manga interface ─────────────────────────

export function normalizeMangaDexManga(mdxManga: any): Manga {
    const attrs = mdxManga.attributes;
    const title = attrs.title?.en
        || attrs.title?.['ja-ro']
        || Object.values(attrs.title || {})[0] as string
        || 'Untitled';

    return {
        id: `mdx-${mdxManga.id}`,
        title,
        titleEng: attrs.title?.en || title,
        titleJp: attrs.title?.ja || attrs.title?.['ja'] || undefined,
        alternativeTitles: extractAltTitles(mdxManga),
        description: attrs.description?.en || attrs.description?.['ja-ro'] || '',
        coverImage: getCoverUrl(mdxManga),
        bannerImage: getCoverUrl(mdxManga),
        status: attrs.status || 'unknown',
        author: extractRelName(mdxManga, 'author'),
        artist: extractRelName(mdxManga, 'artist'),
        rating: '0',
        votesCount: 0,
        releaseYear: attrs.year || undefined,
        isDeleted: false,
        updatedAt: attrs.updatedAt || new Date().toISOString(),
        genres: extractTags(mdxManga),
        _source: 'mangadex',
    };
}

// ─── Normalize MangaDex chapter to our Chapter interface ─────────────────────

function normalizeMangaDexChapter(mdxChapter: any, mangaId: string): Chapter {
    const attrs = mdxChapter.attributes;
    return {
        id: `mdx-${mdxChapter.id}`,
        mangaId: `mdx-${mangaId}`,
        title: attrs.title || `Chapter ${attrs.chapter || '?'}`,
        chapterNumber: parseFloat(attrs.chapter) || 0,
        pdfUrl: '',
        externalPages: [], // Will be filled when reading
        pagesCount: attrs.pages || 0,
        views: 0,
        createdAt: attrs.publishAt || attrs.createdAt || new Date().toISOString(),
    };
}

// ─── Public API Methods ──────────────────────────────────────────────────────

export const mangaDexService = {
    /**
     * Get popular manga from MangaDex
     */
    getPopularManga: async (limit: number = 20, offset: number = 0): Promise<Manga[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get('/manga', {
                    params: {
                        limit,
                        offset,
                        'order[followedCount]': 'desc',
                        'includes[]': ['cover_art', 'author', 'artist'],
                        'availableTranslatedLanguage[]': ['en'],
                        'contentRating[]': ['safe', 'suggestive'],
                        hasAvailableChapters: true,
                    },
                })
            );
            return (response.data.data || []).map(normalizeMangaDexManga);
        } catch (error) {
            console.error('MangaDex: Error fetching popular manga:', error);
            return [];
        }
    },

    /**
     * Get latest updated manga from MangaDex
     */
    getLatestManga: async (limit: number = 20, offset: number = 0): Promise<Manga[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get('/manga', {
                    params: {
                        limit,
                        offset,
                        'order[latestUploadedChapter]': 'desc',
                        'includes[]': ['cover_art', 'author', 'artist'],
                        'availableTranslatedLanguage[]': ['en'],
                        'contentRating[]': ['safe', 'suggestive'],
                        hasAvailableChapters: true,
                    },
                })
            );
            return (response.data.data || []).map(normalizeMangaDexManga);
        } catch (error) {
            console.error('MangaDex: Error fetching latest manga:', error);
            return [];
        }
    },

    /**
     * Search manga on MangaDex
     */
    searchManga: async (query: string, limit: number = 20, offset: number = 0): Promise<Manga[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get('/manga', {
                    params: {
                        title: query,
                        limit,
                        offset,
                        'includes[]': ['cover_art', 'author', 'artist'],
                        'availableTranslatedLanguage[]': ['en'],
                        'contentRating[]': ['safe', 'suggestive'],
                        'order[relevance]': 'desc',
                    },
                })
            );
            return (response.data.data || []).map(normalizeMangaDexManga);
        } catch (error) {
            console.error('MangaDex: Error searching manga:', error);
            return [];
        }
    },

    /**
     * Get manga details by MangaDex UUID
     */
    getMangaById: async (mangaDexId: string): Promise<Manga | null> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get(`/manga/${mangaDexId}`, {
                    params: {
                        'includes[]': ['cover_art', 'author', 'artist'],
                    },
                })
            );
            return normalizeMangaDexManga(response.data.data);
        } catch (error) {
            console.error('MangaDex: Error fetching manga details:', error);
            return null;
        }
    },

    /**
     * Get chapters for a manga from MangaDex
     */
    getMangaChapters: async (mangaDexId: string, limit: number = 100, offset: number = 0): Promise<Chapter[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get(`/manga/${mangaDexId}/feed`, {
                    params: {
                        limit,
                        offset,
                        'translatedLanguage[]': ['en'],
                        'order[chapter]': 'asc',
                        'includes[]': ['scanlation_group'],
                    },
                })
            );

            const chapters = (response.data.data || [])
                .filter((ch: any) => ch.attributes?.chapter !== null) // Filter out unnumbered chapters
                .map((ch: any) => normalizeMangaDexChapter(ch, mangaDexId));

            // Deduplicate by chapter number (keep first occurrence)
            const seen = new Set<number>();
            return chapters.filter((ch: Chapter) => {
                if (seen.has(ch.chapterNumber)) return false;
                seen.add(ch.chapterNumber);
                return true;
            });
        } catch (error) {
            console.error('MangaDex: Error fetching chapters:', error);
            return [];
        }
    },

    /**
     * Get chapter page image URLs from MangaDex@Home
     */
    getChapterPages: async (mangaDexChapterId: string): Promise<string[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get(`/at-home/server/${mangaDexChapterId}`)
            );

            const { baseUrl, chapter } = response.data;
            // Use data-saver quality for faster loading
            const pages: string[] = (chapter.dataSaver || chapter.data || []).map(
                (filename: string) => {
                    // Use data-saver if available for speed, otherwise full quality
                    const quality = chapter.dataSaver ? 'data-saver' : 'data';
                    return `${baseUrl}/${quality}/${chapter.hash}/${filename}`;
                }
            );
            return pages;
        } catch (error) {
            console.error('MangaDex: Error fetching chapter pages:', error);
            return [];
        }
    },

    /**
     * Get recently added manga from MangaDex
     */
    getRecentManga: async (limit: number = 15, offset: number = 0): Promise<Manga[]> => {
        try {
            const response = await rateLimitedRequest(() =>
                mdxApi.get('/manga', {
                    params: {
                        limit,
                        offset,
                        'order[createdAt]': 'desc',
                        'includes[]': ['cover_art', 'author', 'artist'],
                        'availableTranslatedLanguage[]': ['en'],
                        'contentRating[]': ['safe', 'suggestive'],
                        hasAvailableChapters: true,
                    },
                })
            );
            return (response.data.data || []).map(normalizeMangaDexManga);
        } catch (error) {
            console.error('MangaDex: Error fetching recent manga:', error);
            return [];
        }
    },
};

// ─── Utility: Check if an ID is a MangaDex ID ───────────────────────────────

export function isMangaDexId(id: string | number): boolean {
    return typeof id === 'string' && id.startsWith('mdx-');
}

/**
 * Extract the raw MangaDex UUID from a prefixed ID
 * e.g. "mdx-a1b2c3d4-..." → "a1b2c3d4-..."
 */
export function extractMangaDexId(prefixedId: string): string {
    return prefixedId.replace(/^mdx-/, '');
}
