/**
 * MangaDex API Service
 * Public API - No authentication required
 * Docs: https://api.mangadex.org/docs/
 */

const MANGADEX_API = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
const CORS_PROXY = 'https://corsproxy.io/?';

// Helper to get cover image URL
export const getCoverUrl = (mangaId: string, fileName: string, quality: 'small' | 'medium' | 'full' = 'medium'): string => {
  const sizes = {
    small: '.256.jpg',
    medium: '.512.jpg', 
    full: ''
  };
  return `${COVER_BASE_URL}/${mangaId}/${fileName}${sizes[quality]}`;
};

// Types
export interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: {
    title: { [key: string]: string };
    altTitles: { [key: string]: string }[];
    description: { [key: string]: string };
    isLocked: boolean;
    links: { [key: string]: string } | null;
    originalLanguage: string;
    lastVolume: string | null;
    lastChapter: string | null;
    publicationDemographic: 'shounen' | 'shoujo' | 'josei' | 'seinen' | null;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    year: number | null;
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
    tags: MangaDexTag[];
    state: string;
    createdAt: string;
    updatedAt: string;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexTag {
  id: string;
  type: 'tag';
  attributes: {
    name: { [key: string]: string };
    description: { [key: string]: string };
    group: string;
  };
}

export interface MangaDexRelationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
    description?: string;
    volume?: string;
    createdAt?: string;
  };
}

export interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexResponse<T> {
  result: 'ok' | 'error';
  response: string;
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
}

export interface ChapterPages {
  result: 'ok' | 'error';
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

// Simplified Manga type for UI
export interface SimpleManga {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  coverUrl: string;
  status: string;
  year: number | null;
  contentRating: string;
  tags: string[];
  author: string;
  artist: string;
  demographic: string | null;
  lastChapter: string | null;
  updatedAt: string;
}

// Simplified Chapter type for UI
export interface SimpleChapter {
  id: string;
  chapter: string | null;
  volume: string | null;
  title: string | null;
  language: string;
  pages: number;
  publishedAt: string;
  scanlationGroup: string;
}

// Helper to extract best title
const getTitle = (manga: MangaDexManga): string => {
  const titles = manga.attributes.title;
  return titles.en || titles['ja-ro'] || titles.ja || Object.values(titles)[0] || 'Unknown Title';
};

// Helper to extract description
const getDescription = (manga: MangaDexManga): string => {
  const desc = manga.attributes.description;
  return desc.en || desc['ja-ro'] || Object.values(desc)[0] || 'No description available.';
};

// Helper to extract cover filename from relationships
const getCoverFileName = (manga: MangaDexManga): string | null => {
  const coverRel = manga.relationships.find(r => r.type === 'cover_art');
  return coverRel?.attributes?.fileName || null;
};

// Helper to extract author/artist
const getCreator = (manga: MangaDexManga, type: 'author' | 'artist'): string => {
  const creator = manga.relationships.find(r => r.type === type);
  return creator?.attributes?.name || 'Unknown';
};

// Transform MangaDex manga to simplified format
const transformManga = (manga: MangaDexManga): SimpleManga => {
  const coverFileName = getCoverFileName(manga);
  return {
    id: manga.id,
    title: getTitle(manga),
    altTitles: manga.attributes.altTitles.map(t => Object.values(t)[0]).filter(Boolean),
    description: getDescription(manga),
    coverUrl: coverFileName ? getCoverUrl(manga.id, coverFileName) : '/placeholder.svg',
    status: manga.attributes.status,
    year: manga.attributes.year,
    contentRating: manga.attributes.contentRating,
    tags: manga.attributes.tags.map(t => t.attributes.name.en || Object.values(t.attributes.name)[0]),
    author: getCreator(manga, 'author'),
    artist: getCreator(manga, 'artist'),
    demographic: manga.attributes.publicationDemographic,
    lastChapter: manga.attributes.lastChapter,
    updatedAt: manga.attributes.updatedAt,
  };
};

// Transform chapter to simplified format
const transformChapter = (chapter: MangaDexChapter): SimpleChapter => {
  const scanlationGroup = chapter.relationships.find(r => r.type === 'scanlation_group');
  return {
    id: chapter.id,
    chapter: chapter.attributes.chapter,
    volume: chapter.attributes.volume,
    title: chapter.attributes.title,
    language: chapter.attributes.translatedLanguage,
    pages: chapter.attributes.pages,
    publishedAt: chapter.attributes.publishAt,
    scanlationGroup: scanlationGroup?.attributes?.name || 'Unknown',
  };
};

// API Functions
export const mangadexApi = {
  // Get popular manga (most followed)
  getPopular: async (limit = 20, offset = 0): Promise<{ data: SimpleManga[]; total: number }> => {
    const url = `${MANGADEX_API}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&includes[]=artist&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga[]> = await response.json();
    
    return {
      data: data.data.map(transformManga),
      total: data.total || 0,
    };
  },

  // Get latest updates
  getLatestUpdates: async (limit = 20, offset = 0): Promise<{ data: SimpleManga[]; total: number }> => {
    const url = `${MANGADEX_API}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&includes[]=artist&order[latestUploadedChapter]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga[]> = await response.json();
    
    return {
      data: data.data.map(transformManga),
      total: data.total || 0,
    };
  },

  // Get recently added manga
  getRecentlyAdded: async (limit = 20, offset = 0): Promise<{ data: SimpleManga[]; total: number }> => {
    const url = `${MANGADEX_API}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&includes[]=artist&order[createdAt]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga[]> = await response.json();
    
    return {
      data: data.data.map(transformManga),
      total: data.total || 0,
    };
  },

  // Search manga
  search: async (
    query: string,
    limit = 20,
    offset = 0,
    filters?: {
      status?: string[];
      demographic?: string[];
      contentRating?: string[];
      tags?: string[];
      year?: number;
      order?: string;
    }
  ): Promise<{ data: SimpleManga[]; total: number }> => {
    let url = `${MANGADEX_API}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&includes[]=artist&hasAvailableChapters=true`;
    
    if (query) {
      url += `&title=${encodeURIComponent(query)}`;
    }
    
    // Default content rating
    url += '&contentRating[]=safe&contentRating[]=suggestive';
    
    if (filters?.status) {
      filters.status.forEach(s => url += `&status[]=${s}`);
    }
    
    if (filters?.demographic) {
      filters.demographic.forEach(d => url += `&publicationDemographic[]=${d}`);
    }
    
    if (filters?.year) {
      url += `&year=${filters.year}`;
    }
    
    if (filters?.order) {
      url += `&order[${filters.order}]=desc`;
    } else {
      url += '&order[relevance]=desc';
    }
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga[]> = await response.json();
    
    return {
      data: data.data.map(transformManga),
      total: data.total || 0,
    };
  },

  // Get manga by ID
  getManga: async (id: string): Promise<SimpleManga> => {
    const url = `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga> = await response.json();
    
    return transformManga(data.data);
  },

  // Get manga chapters
  getChapters: async (
    mangaId: string, 
    language = 'en',
    limit = 100,
    offset = 0,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: SimpleChapter[]; total: number }> => {
    const url = `${MANGADEX_API}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&translatedLanguage[]=${language}&includes[]=scanlation_group&order[chapter]=${order}&order[volume]=${order}`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexChapter[]> = await response.json();
    
    return {
      data: data.data.map(transformChapter),
      total: data.total || 0,
    };
  },

  // Get chapter pages
  getChapterPages: async (chapterId: string, dataSaver = false): Promise<string[]> => {
    const url = `${MANGADEX_API}/at-home/server/${chapterId}`;
    
    const response = await fetch(url);
    const data: ChapterPages = await response.json();
    
    const quality = dataSaver ? 'dataSaver' : 'data';
    const qualityPath = dataSaver ? 'data-saver' : 'data';
    
    return data.chapter[quality].map(
      (page) => `${data.baseUrl}/${qualityPath}/${data.chapter.hash}/${page}`
    );
  },

  // Get random manga
  getRandom: async (): Promise<SimpleManga> => {
    const url = `${MANGADEX_API}/manga/random?includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexManga> = await response.json();
    
    return transformManga(data.data);
  },

  // Get all tags
  getTags: async (): Promise<{ id: string; name: string; group: string }[]> => {
    const url = `${MANGADEX_API}/manga/tag`;
    
    const response = await fetch(url);
    const data: MangaDexResponse<MangaDexTag[]> = await response.json();
    
    return data.data.map(tag => ({
      id: tag.id,
      name: tag.attributes.name.en || Object.values(tag.attributes.name)[0],
      group: tag.attributes.group,
    }));
  },

  // Get manga statistics (rating, follows)
  getStatistics: async (mangaIds: string[]): Promise<Record<string, { rating: { average: number }; follows: number }>> => {
    const url = `${MANGADEX_API}/statistics/manga?${mangaIds.map(id => `manga[]=${id}`).join('&')}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.statistics || {};
  },
};

export default mangadexApi;
