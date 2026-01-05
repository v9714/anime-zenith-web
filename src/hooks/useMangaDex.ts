import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import mangadexApi, { SimpleManga, SimpleChapter } from '@/services/mangadexApi';

// Hook for popular manga
export const usePopularManga = (limit = 20) => {
  return useQuery({
    queryKey: ['manga', 'popular', limit],
    queryFn: () => mangadexApi.getPopular(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for latest updates
export const useLatestUpdates = (limit = 20) => {
  return useQuery({
    queryKey: ['manga', 'latest', limit],
    queryFn: () => mangadexApi.getLatestUpdates(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for recently added
export const useRecentlyAdded = (limit = 20) => {
  return useQuery({
    queryKey: ['manga', 'recent', limit],
    queryFn: () => mangadexApi.getRecentlyAdded(limit),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for manga search with infinite scroll
export const useMangaSearch = (
  query: string,
  filters?: {
    status?: string[];
    demographic?: string[];
    year?: number;
    order?: string;
  }
) => {
  return useInfiniteQuery({
    queryKey: ['manga', 'search', query, filters],
    queryFn: ({ pageParam = 0 }) => mangadexApi.search(query, 20, pageParam, filters),
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return currentCount < lastPage.total ? currentCount : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for single manga details
export const useMangaDetails = (id: string) => {
  return useQuery({
    queryKey: ['manga', 'details', id],
    queryFn: () => mangadexApi.getManga(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for manga chapters
export const useMangaChapters = (mangaId: string, language = 'en') => {
  return useInfiniteQuery({
    queryKey: ['manga', 'chapters', mangaId, language],
    queryFn: ({ pageParam = 0 }) => mangadexApi.getChapters(mangaId, language, 100, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
      return currentCount < lastPage.total ? currentCount : undefined;
    },
    initialPageParam: 0,
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for chapter pages
export const useChapterPages = (chapterId: string, dataSaver = false) => {
  return useQuery({
    queryKey: ['chapter', 'pages', chapterId, dataSaver],
    queryFn: () => mangadexApi.getChapterPages(chapterId, dataSaver),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for random manga
export const useRandomManga = () => {
  return useQuery({
    queryKey: ['manga', 'random'],
    queryFn: () => mangadexApi.getRandom(),
    staleTime: 0, // Always fetch fresh
    enabled: false, // Manual trigger only
  });
};

// Hook for manga tags
export const useMangaTags = () => {
  return useQuery({
    queryKey: ['manga', 'tags'],
    queryFn: () => mangadexApi.getTags(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for manga statistics
export const useMangaStatistics = (mangaIds: string[]) => {
  return useQuery({
    queryKey: ['manga', 'statistics', mangaIds],
    queryFn: () => mangadexApi.getStatistics(mangaIds),
    enabled: mangaIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });
};
