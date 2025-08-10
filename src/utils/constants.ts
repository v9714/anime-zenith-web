
// Site Information
export const SITE_NAME = "OtakuTv";
export const SITE_DESCRIPTION = "Your Ultimate Anime Streaming Platform";

// API Endpoints
export const BACKEND_API_BASE_URL = 'http://localhost:8081';
export const BACKEND_API_Image_URL = 'http://localhost:8081/uploads';

// Open Characters API (Jikan)
export const OPEN_CHAR_API_BASE_URL = 'https://api.jikan.moe/v4';

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

// Social Links
export const SOCIAL_LINKS = {
  facebook: "#",
  twitter: "#",
  instagram: "#",
  discord: "#"
};

// Routes
export const ROUTES = {
  home: "/",
  anime: "/anime",
  episodes: "/episodes",
  search: "/search",
  contact: "/contact"
};
