export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
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

// API Interface for Anime Service
export interface IAnimeApiService {
  // Core anime operations
  getTopAnime(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  getAnimeById(id: number): Promise<ApiResponse<any>>;
  searchAnime(query: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  
  // Seasonal and genre operations
  getSeasonalAnime(year?: number, season?: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  getAnimeByGenre(genreId: number, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
  getAnimeGenres(): Promise<ApiResponse<any[]>>;
  
  // Episode operations
  getAnimeEpisodes(id: number, page?: number): Promise<PaginatedResponse<any>>;
  
  // Recommendations
  getAnimeRecommendations(id: number): Promise<ApiResponse<any[]>>;
}

// Rate limiting interface
export interface IRateLimiter {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  setDelay(ms: number): void;
  getDelay(): number;
}

// Base API client interface
export interface IApiClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  setBaseURL(url: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
}

// Configuration interface
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  rateLimitDelay?: number;
  defaultHeaders?: Record<string, string>;
}

// Error handling interface
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export interface IErrorHandler {
  handleError(error: any): ApiError;
  isRetryableError(error: ApiError): boolean;
}