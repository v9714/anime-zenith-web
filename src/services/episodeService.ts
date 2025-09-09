import backendAPI from "./backendApi";

export interface Episode {
  id?: number;
  animeId: number;
  animeTitle: string;
  title: string;
  episodeNumber: number;
  thumbnail: string;
  masterUrl: string;
  duration: number;
  description: string;
  airDate: string;
  isDeleted: boolean;
  commentsEnabled: boolean;
  loginRequired: boolean;
  views: number;
  sourceFile?: string;
  processingStatus: "QUEUED" | "PROCESSING" | "READY" | "FAILED";
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeFilters {
  animeId?: number;
  status?: string;
  search?: string;
}

export interface PaginatedEpisodeResponse {
  statusCode: number;
  data: {
    episodes: Episode[];
    currentPage: number;
    totalPages: number;
    total: number;
  };
  message: string;
  success: boolean;
}

export interface AnimeSearchResponse {
  statusCode: number;
  data: {
    id: number;
    title: string;
  }[];
  success: boolean;
}

export const episodeService = {
  // Get paginated episodes with filters
  getPaginatedEpisodes: async (
    page: number = 1,
    limit: number = 20,
    filters?: EpisodeFilters
  ): Promise<PaginatedEpisodeResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.animeId) params.append('animeId', filters.animeId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await backendAPI.get<PaginatedEpisodeResponse>(`/api/admin/episode?${params.toString()}`);
    return response.data;
  },

  // Search anime for episode form
  searchAnime: async (query: string): Promise<AnimeSearchResponse> => {
    const params = new URLSearchParams({ q: query });
    const response = await backendAPI.get<AnimeSearchResponse>(`/api/admin/anime/search?${params.toString()}`);
    return response.data;
  },

  // Create new episode
  createEpisode: async (episodeData: FormData | Partial<Episode>) => {
    const config = episodeData instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};

    const response = await backendAPI.post('/api/admin/episode', episodeData, config);
    return response.data;
  },

  // Update existing episode
  updateEpisode: async (id: string | number, episodeData: FormData | Partial<Episode>) => {
    const config = episodeData instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};

    const response = await backendAPI.patch(`/api/admin/episode/${id}`, episodeData, config);
    return response.data;
  },

  // Delete episode
  deleteEpisode: async (id: string | number) => {
    const response = await backendAPI.delete(`/api/admin/episode/${id}`);
    return response.data;
  }
};