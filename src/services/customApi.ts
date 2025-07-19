import axios from 'axios';

// Base URL for your custom API
const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance for your custom API
const customApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Types matching your API response structure
export interface CustomAnime {
  id: string;
  title: string;
  alternativeTitles: {
    en: string;
    jp: string;
  };
  description: string;
  coverImage: string;
  bannerImage: string;
  year: number;
  season: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
  status: 'AIRING' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED';
  type: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
  rating: string;
  votesCount: number;
  studio: string;
  episodeDuration: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomAnimeResponse {
  statusCode: number;
  data: {
    anime: CustomAnime[];
    currentPage: number;
    limit: number;
    totalPages: number;
    totalAnime: number;
  };
  message: string;
  success: boolean;
}

export interface CustomSearchResponse {
  statusCode: number;
  data: {
    results: CustomAnime[];
    currentPage: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  message: string;
  success: boolean;
}

// API functions for your custom backend
export const getCustomAnime = async (page = 1, limit = 10): Promise<CustomAnimeResponse> => {
  try {
    const response = await customApiInstance.get('/anime', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime:', error);
    throw error;
  }
};

export const searchCustomAnime = async (query: string, page = 1, limit = 10): Promise<CustomSearchResponse> => {
  try {
    const response = await customApiInstance.get('/search', {
      params: { title: query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

export const getCustomAnimeById = async (id: string): Promise<{ statusCode: number; data: CustomAnime; message: string; success: boolean }> => {
  try {
    const response = await customApiInstance.get(`/anime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by ID:', error);
    throw error;
  }
};