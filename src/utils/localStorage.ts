// Types for localStorage data
export interface WatchHistoryItem {
  animeId: number;
  title: string;
  imageUrl: string;
  lastWatched: string; // ISO date string
  episodeId?: string;
  episodeNumber?: number;
}

export interface LikedContentItem {
  id: number;
  type: "anime" | "episode";
  title: string;
  imageUrl: string;
}

export interface AudioSettings {
  backgroundMusic: boolean;
  buttonClickSound: boolean;
}

// Keys for localStorage
const WATCH_HISTORY_KEY = "otaku-watchHistory";
const LIKED_CONTENT_KEY = "otaku-likedContent";
const AUDIO_SETTINGS_KEY = "otaku-audioSettings";

// Watch History Management
export const watchHistoryUtils = {
  get: (): WatchHistoryItem[] => {
    try {
      const stored = localStorage.getItem(WATCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading watch history:', error);
      return [];
    }
  },

  add: (animeData: {
    animeId: number;
    title: string;
    imageUrl: string;
    episodeId?: string;
    episodeNumber?: number;
  }): WatchHistoryItem[] => {
    try {
      const current = watchHistoryUtils.get();
      
      // Remove existing entry for this anime to avoid duplicates
      const filtered = current.filter(item => item.animeId !== animeData.animeId);
      
      // Add new entry at the beginning
      const newHistory = [
        {
          ...animeData,
          lastWatched: new Date().toISOString(),
        },
        ...filtered,
      ];
      
      // Limit to 20 items
      const limited = newHistory.slice(0, 20);
      
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(limited));
      return limited;
    } catch (error) {
      console.error('Error updating watch history:', error);
      return watchHistoryUtils.get();
    }
  },

  clear: (): void => {
    localStorage.removeItem(WATCH_HISTORY_KEY);
  }
};

// Liked Content Management
export const likedContentUtils = {
  get: (): LikedContentItem[] => {
    try {
      const stored = localStorage.getItem(LIKED_CONTENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading liked content:', error);
      return [];
    }
  },

  toggle: (content: {
    id: number;
    type: "anime" | "episode";
    title: string;
    imageUrl: string;
  }): { liked: LikedContentItem[]; wasAdded: boolean } => {
    try {
      const current = likedContentUtils.get();
      const isAlreadyLiked = current.some(
        item => item.id === content.id && item.type === content.type
      );

      let newLikedContent: LikedContentItem[];
      let wasAdded: boolean;

      if (isAlreadyLiked) {
        // Remove from liked content
        newLikedContent = current.filter(
          item => !(item.id === content.id && item.type === content.type)
        );
        wasAdded = false;
      } else {
        // Add to liked content
        newLikedContent = [...current, content];
        wasAdded = true;
      }

      localStorage.setItem(LIKED_CONTENT_KEY, JSON.stringify(newLikedContent));
      return { liked: newLikedContent, wasAdded };
    } catch (error) {
      console.error('Error updating liked content:', error);
      return { liked: likedContentUtils.get(), wasAdded: false };
    }
  },

  isLiked: (id: number, type: "anime" | "episode"): boolean => {
    const current = likedContentUtils.get();
    return current.some(item => item.id === id && item.type === type);
  },

  clear: (): void => {
    localStorage.removeItem(LIKED_CONTENT_KEY);
  }
};

// Audio Settings Management
export const audioSettingsUtils = {
  get: (): AudioSettings => {
    try {
      const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { backgroundMusic: true, buttonClickSound: false };
    } catch (error) {
      console.error('Error reading audio settings:', error);
      return { backgroundMusic: true, buttonClickSound: false };
    }
  },

  update: (settings: Partial<AudioSettings>): AudioSettings => {
    try {
      const current = audioSettingsUtils.get();
      const updated = { ...current, ...settings };
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating audio settings:', error);
      return audioSettingsUtils.get();
    }
  },

  clear: (): void => {
    localStorage.removeItem(AUDIO_SETTINGS_KEY);
  }
};
