
// Site Information
export const SITE_NAME = "OtakuTv";
export const SITE_DESCRIPTION = "Your Ultimate Anime Streaming Platform";

// API Endpoints
export const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
export const BACKEND_API_Image_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
export const COMMENTS_API_BASE_URL = import.meta.env.VITE_COMMENTS_API_URL || "http://localhost:8001/api/comments";
export const OPEN_CHAR_API_BASE_URL = "https://api.jikan.moe/v4";

// React Query Configuration
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  RETRY_COUNT: 2,
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  REFETCH_ON_WINDOW_FOCUS: false,
};

// API Pagination Limits
export const API_LIMITS = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 15,
  COMMENTS_PAGE_SIZE: 20,
};

// Token Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  WATCH_HISTORY: 'watchHistory',
  USER_PREFERENCES: 'userPreferences',
};

// Episodes seasons options
export const EPISODE_SEASONS = ["winter", "spring", "summer", "fall"] as const;
export type EpisodeSeason = typeof EPISODE_SEASONS[number];

// Theme Colors
export const THEME_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  background: "hsl(var(--background))",
  headerDark: "rgba(17, 12, 26, 0.95)" // Dark purple for header
};

// Contact Information
export const CONTACT_EMAIL = "contact@otakutv.com";

// Social Links
export const SOCIAL_LINKS = {
  facebook: "#",
  twitter: "#",
  instagram: "#",
  discord: "#"
};

// Default Images
export const DEFAULT_EPISODE_THUMBNAIL = "/src/assets/default-episode-thumbnail.jpg";

// Routes
export const ROUTES = {
  home: "/",
  anime: "/anime",
  episodes: "/episodes",
  search: "/search",
  contact: "/contact"
};