import { 
  IAnimeApiService, 
  ApiResponse, 
  PaginatedResponse, 
  IRateLimiter,
  ApiConfig,
  ApiError,
  IErrorHandler
} from './apiInterface';
import * as api from './api';

// Rate limiter implementation
class RateLimiter implements IRateLimiter {
  private delay: number;

  constructor(delayMs: number = 350) {
    this.delay = delayMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await fn();
    await this.wait(this.delay);
    return result;
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }

  getDelay(): number {
    return this.delay;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Error handler implementation
class ErrorHandler implements IErrorHandler {
  handleError(error: any): ApiError {
    if (error.response) {
      return {
        code: `HTTP_${error.response.status}`,
        message: error.response.data?.message || error.message,
        status: error.response.status,
        details: error.response.data
      };
    }
    
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: error.request
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error
    };
  }

  isRetryableError(error: ApiError): boolean {
    return error.status === 429 || error.status === 503 || error.code === 'NETWORK_ERROR';
  }
}

// Main Anime API Service implementation
export class AnimeApiService implements IAnimeApiService {
  private rateLimiter: IRateLimiter;
  private errorHandler: IErrorHandler;
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseURL: 'https://api.jikan.moe/v4',
      timeout: 10000,
      retryAttempts: 2,
      rateLimitDelay: 350,
      ...config
    };
    
    this.rateLimiter = new RateLimiter(this.config.rateLimitDelay);
    this.errorHandler = new ErrorHandler();
  }

  async getTopAnime(page = 1, limit = 15): Promise<PaginatedResponse<any>> {
    try {
      return await this.rateLimiter.execute(() => api.getTopAnime(page, limit));
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async getAnimeById(id: number): Promise<ApiResponse<any>> {
    try {
      const result = await this.rateLimiter.execute(() => api.getAnimeById(id));
      return {
        data: result.data,
        success: true
      };
    } catch (error) {
      const apiError = this.errorHandler.handleError(error);
      return {
        data: null,
        success: false,
        error: apiError.message
      };
    }
  }

  async searchAnime(query: string, page = 1, limit = 15): Promise<PaginatedResponse<any>> {
    try {
      return await this.rateLimiter.execute(() => api.searchAnime(query, page, limit));
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async getSeasonalAnime(year?: number, season?: string, page = 1, limit = 15): Promise<PaginatedResponse<any>> {
    try {
      return await this.rateLimiter.execute(() => api.getSeasonalAnime(year, season, page, limit));
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async getAnimeByGenre(genreId: number, page = 1, limit = 15): Promise<PaginatedResponse<any>> {
    try {
      return await this.rateLimiter.execute(() => api.getAnimeByGenre(genreId, page, limit));
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async getAnimeGenres(): Promise<ApiResponse<any[]>> {
    try {
      const result = await this.rateLimiter.execute(() => api.getAnimeGenres());
      return {
        data: result.data,
        success: true
      };
    } catch (error) {
      const apiError = this.errorHandler.handleError(error);
      return {
        data: [],
        success: false,
        error: apiError.message
      };
    }
  }

  async getAnimeEpisodes(id: number, page = 1): Promise<PaginatedResponse<any>> {
    try {
      return await this.rateLimiter.execute(() => api.getAnimeEpisodes(id, page));
    } catch (error) {
      throw this.errorHandler.handleError(error);
    }
  }

  async getAnimeRecommendations(id: number): Promise<ApiResponse<any[]>> {
    try {
      const result = await this.rateLimiter.execute(() => api.getAnimeRecommendations(id));
      return {
        data: result.data,
        success: true
      };
    } catch (error) {
      const apiError = this.errorHandler.handleError(error);
      return {
        data: [],
        success: false,
        error: apiError.message
      };
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.rateLimiter.setDelay(this.config.rateLimitDelay || 350);
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const animeApiService = new AnimeApiService();