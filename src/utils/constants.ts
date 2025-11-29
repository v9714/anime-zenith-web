
// Site Information
export const SITE_NAME = "OtakuTv";
export const SITE_DESCRIPTION = "Your Ultimate Anime Streaming Platform";

// API Endpoints
export const BACKEND_API_BASE_URL = "http://localhost:8000";
export const BACKEND_API_Image_URL = "http://localhost:8000";
export const COMMENTS_API_BASE_URL = "http://localhost:8001/api/comments";
export const OPEN_CHAR_API_BASE_URL = "https://api.jikan.moe/v4";

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