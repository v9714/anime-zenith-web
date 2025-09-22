import backendAPI from './backendApi';

// Custom API Anime interface
export interface Anime {
  id: string;
  title: string;
  alternativeTitles?: string[];
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  year?: number;
  season?: string;
  seasonNumber?: number;
  status?: string;
  type?: string;
  rating?: string;
  votesCount?: number;
  studio?: string;
  episodeDuration?: string;
  genres?: { mal_id: number; name: string }[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnimeResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface SingleAnimeResponse {
  data: Anime;
}

// Get anime list Done
export const getTopAnime = async (page = 1, limit = 15): Promise<AnimeResponse> => {
  const response = await backendAPI.get('/api/anime', { params: { page, limit } });
  return {
    data: response.data.data.anime,
    pagination: {
      current_page: response.data.data.currentPage,
      last_visible_page: response.data.data.totalPages,
      has_next_page: response.data.data.currentPage < response.data.data.totalPages,
      items: {
        count: response.data.data.anime.length,
        total: response.data.data.totalAnime,
        per_page: response.data.data.limit
      }
    }
  };
};

// Search anime Done 
export const searchAnime = async (query: string, page = 1, limit = 15) => {
  const response = await backendAPI.get('/api/anime/search', {
    params: { title: query, page, limit }
  });
  return {
    data: response.data.data || response.data.data.anime || [],
    pagination: {
      current_page: response.data.data.currentPage,
      last_visible_page: response.data.data.totalPages,
      has_next_page: response.data.data.currentPage < response.data.data.totalPages,
      items: {
        count: (response.data.data || response.data.data.anime || []).length,
        total: response.data.data.totalResults || response.data.data.totalAnime || 0,
        per_page: response.data.data.limit
      }
    }
  };
};

// Get seasonal anime Done
export const getSeasonalAnime = async (year = new Date().getFullYear(), season = 'winter', page = 1, limit = 15) => {
  const response = await backendAPI.get('/api/anime/seasonal', {
    params: { year, season, page, limit }
  });
  return response.data;
};

// Get anime by genre Done
export const getAnimeByGenre = async (genreId: number, page = 1, limit = 15) => {
  const response = await backendAPI.get('/api/anime/genre', {
    params: { genreId, page, limit }
  });
  return response.data;
};

// Get anime genres
export const getAnimeGenres = async () => {
  const response = await backendAPI.get('/api/anime/genres');
  return response.data;
};

// Get anime by ID
export const getAnimeById = async (id: number | string) => {
  const response = await backendAPI.get(`/api/anime/${id}`);
  return response.data;
};

// Get anime episodes (paginated)
export const getAnimeEpisodes = async (id: number, page = 1) => {
  const response = await backendAPI.get(`/api/episode/${id}/episodes`, { params: { page } });
  return response.data;
};

// Get anime episodes by season
export interface Episode {
  id: number;
  animeId: number;
  title: string;
  episodeNumber: number;
  thumbnail?: string;
  videoUrl?: string;
  masterUrl?: string;
  duration?: number;
  description?: string;
  airDate?: string;
  views: number;
}

export interface EpisodesBySeasonResponse {
  statusCode: number;
  data: Episode[];
  message: string;
  success: boolean;
}

export const getAnimeEpisodesBySeason = async (id: number | string): Promise<EpisodesBySeasonResponse> => {
  const response = await backendAPI.get(`/api/episode/${id}/episodes`);
  return response.data;
};

// Get anime recommendations
export const getAnimeRecommendations = async (id: number) => {
  const response = await backendAPI.get(`/api/anime/${id}/recommendations`);
  return response.data;
};

