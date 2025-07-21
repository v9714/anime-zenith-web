import axios from 'axios';
import backendAPI from './backendApi';

// Base URLs for both custom API and fallback Jikan API
const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4';

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance for Jikan API
const jikanApiInstance = axios.create({
  baseURL: JIKAN_API_BASE_URL,
});

// Function to fetch from custom API first, fallback to Jikan API
async function fetchWithFallback(endpoint: string, params = {}, useCustom = true) {
  if (useCustom) {
    try {
      const response = await backendAPI.get(`/api${endpoint}`, { params });
      return response.data;
    } catch (error) {
      console.warn('Custom API failed, falling back to Jikan API:', error);
      // Fall back to Jikan API
      const response = await jikanApiInstance.get(endpoint, { params });
      await delay(350); // Rate limit for Jikan API
      return response.data;
    }
  } else {
    try {
      const response = await jikanApiInstance.get(endpoint, { params });
      await delay(350);
      return response.data;
    } catch (error) {
      console.error('Jikan API Error:', error);
      throw error;
    }
  }
}

// Unified Anime interface that works with both APIs
export interface Anime {
  // Custom API fields
  id?: string;
  title: string;
  alternativeTitles?: {
    en: string;
    jp: string;
  };
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  year?: number;
  season?: string;
  status?: string;
  type?: string;
  rating?: string;
  votesCount?: number;
  studio?: string;
  episodeDuration?: string;
  
  // Jikan API fields (for backward compatibility)
  // mal_id?: number;
  // title_english?: string;
  // title_japanese?: string;
  // images?: {
  //   jpg: {
  //     image_url: string;
  //     small_image_url: string;
  //     large_image_url: string;
  //   };
  //   webp: {
  //     image_url: string;
  //     small_image_url: string;
  //     large_image_url: string;
  //   };
  // };
  // episodes?: number;
  // airing?: boolean;
  synopsis?: string;
  // score?: number;
  // scored_by?: number;
  genres?: { mal_id: number; name: string }[];
  // aired?: {
  //   from: string;
  //   to: string;
  // };
  // duration?: string;
  // trailer?: {
  //   youtube_id: string;
  //   url: string;
  // };
  // createdAt?: string;
  // updatedAt?: string;
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

// Get anime by ID (custom API first)
export const getAnimeById = async (id: number | string) => {
  try {
    // Try custom API first
    const response = await backendAPI.get(`/api/anime/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Custom API failed for getAnimeById, using Jikan API:', error);
    return fetchWithFallback(`/anime/${id}`, {}, false);
  }
};

  // Get anime list (custom API first)
  export const getTopAnime = async (page = 1, limit = 15) : Promise<AnimeResponse> => {
    try {
      // Try custom API first
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
    } catch (error) {
      console.warn('Custom API failed for getTopAnime, using Jikan API:', error);
      // return fetchWithFallback('/top/anime', { page, limit }, false);
    }
  };

// Get anime episodes
export const getAnimeEpisodes = async (id: number, page = 1) => {
  return fetchWithFallback(`/anime/${id}/episodes`, { page }, false);
};

// Search anime (custom API first)
export const searchAnime = async (query: string, page = 1, limit = 15) => {
  try {
    // Try custom API first
    const response = await backendAPI.get('/api/anime/search', { 
      params: { title: query, page, limit } 
    });
    return {
      data: response.data.data.results || response.data.data.anime || [],
      pagination: {
        current_page: response.data.data.currentPage,
        last_visible_page: response.data.data.totalPages,
        has_next_page: response.data.data.currentPage < response.data.data.totalPages,
        items: {
          count: (response.data.data.results || response.data.data.anime || []).length,
          total: response.data.data.totalResults || response.data.data.totalAnime || 0,
          per_page: response.data.data.limit
        }
      }
    };
  } catch (error) {
    console.warn('Custom API failed for searchAnime, using Jikan API:', error);
    return fetchWithFallback('/anime', { title: query, page, limit, sfw: true }, false);
  }
};

// Get seasonal anime
export const getSeasonalAnime = async (year = new Date().getFullYear(), season = 'winter', page = 1, limit = 15) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  // Get current season if none specified
  if (season === 'winter' && year === currentDate.getFullYear()) {
    if (currentMonth >= 0 && currentMonth < 3) {
      season = 'winter';
    } else if (currentMonth >= 3 && currentMonth < 6) {
      season = 'spring';
    } else if (currentMonth >= 6 && currentMonth < 9) {
      season = 'summer';
    } else {
      season = 'fall';
    }
  }
  
  return fetchWithFallback(`/seasons/${year}/${season}`, { page, limit }, false);
};

// Get anime by genre
export const getAnimeByGenre = async (genreId: number, page = 1, limit = 15) => {
  return fetchWithFallback('/anime', { genres: genreId, page, limit }, false);
};

// Get anime recommendations based on an anime ID
export const getAnimeRecommendations = async (id: number) => {
  return fetchWithFallback(`/anime/${id}/recommendations`, {}, false);
};

// Get popular anime genres
export const getAnimeGenres = async () => {
  return fetchWithFallback('/genres/anime', {}, false);
};