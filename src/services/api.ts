
import axios from 'axios';

// Base URL for Jikan API (MyAnimeList unofficial API)
const API_BASE_URL = 'https://api.jikan.moe/v4';

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API rate limit handling - Jikan API has a rate limit of 3 requests per second
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Function to fetch data with automatic delay to respect rate limits
async function fetchWithRateLimit(endpoint: string, params = {}) {
  try {
    const response = await axiosInstance.get(endpoint, { params });
    // Add a small delay to avoid hitting rate limits
    await delay(350);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Types
export interface Anime {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  type: string;
  episodes: number;
  status: string;
  airing: boolean;
  synopsis: string;
  score: number;
  scored_by?: number; // Adding this field which appears in the API response
  genres: { mal_id: number; name: string }[];
  rating: string;
  aired: {
    from: string;
    to: string;
  };
  season: string;
  year: number;
  duration: string;
  trailer: {
    youtube_id: string;
    url: string;
  };
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

// Get top anime
export const getTopAnime = async (page = 1, limit = 15) => {
  return fetchWithRateLimit('/top/anime', { page, limit });
};

// Get anime by ID
export const getAnimeById = async (id: number) => {
  return fetchWithRateLimit(`/anime/${id}`);
};

// Get anime episodes
export const getAnimeEpisodes = async (id: number, page = 1) => {
  return fetchWithRateLimit(`/anime/${id}/episodes`, { page });
};

// Search anime
export const searchAnime = async (query: string, page = 1, limit = 15) => {
  return fetchWithRateLimit('/anime', { 
    q: query, 
    page, 
    limit,
    sfw: true, // Safe for work content only
  });
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
  
  return fetchWithRateLimit(`/seasons/${year}/${season}`, { page, limit });
};

// Get anime by genre
export const getAnimeByGenre = async (genreId: number, page = 1, limit = 15) => {
  return fetchWithRateLimit('/anime', { genres: genreId, page, limit });
};

// Get anime recommendations based on an anime ID
export const getAnimeRecommendations = async (id: number) => {
  return fetchWithRateLimit(`/anime/${id}/recommendations`);
};

// Get popular anime genres
export const getAnimeGenres = async () => {
  return fetchWithRateLimit('/genres/anime');
};
