
import * as React from "react";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { userService, UserProfile } from "@/services/userService";
import { getCookie, setCookie, deleteCookie } from "@/services/backendApi";
import { 
  watchHistoryUtils, 
  likedContentUtils, 
  WatchHistoryItem, 
  LikedContentItem 
} from "@/utils/localStorage";

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  watchHistory: WatchHistoryItem[];
  likedContent: LikedContentItem[];
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateWatchHistory: (animeData: {
    animeId: number;
    title: string;
    imageUrl: string;
    episodeId?: string;
    episodeNumber?: number;
  }) => void;
  toggleLikedContent: (content: {
    id: number;
    type: "anime" | "episode";
    title: string;
    imageUrl: string;
  }) => void;
  isContentLiked: (id: number, type: "anime" | "episode") => boolean;
}

// Create the auth context
const AuthContext = React.createContext<AuthContextType | null>(null);

// Token refresh function
const refreshToken = async (): Promise<UserProfile | null> => {
  try {
    const response = await authService.refreshToken();
    
    if (response.success) {
      const { user, accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Set tokens in cookies
      setCookie('accessToken', accessToken, 1); // 1 day
      setCookie('refreshToken', newRefreshToken, 7); // 7 days
      
      return user;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
  return null;
};

// Fetch current user profile
const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await userService.getProfile();
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [watchHistory, setWatchHistory] = React.useState<WatchHistoryItem[]>([]);
  const [likedContent, setLikedContent] = React.useState<LikedContentItem[]>([]);

  // Load localStorage data on mount
  React.useEffect(() => {
    setWatchHistory(watchHistoryUtils.get());
    setLikedContent(likedContentUtils.get());
  }, []);

  // Check for existing user session on mount
  React.useEffect(() => {
    const checkAuthState = async () => {
      const accessToken = getCookie('accessToken');
      const refreshTokenValue = getCookie('refreshToken');
      
      if (accessToken) {
        // If we have access token, fetch current user profile
        const userData = await fetchUserProfile();
        if (userData) {
          setCurrentUser(userData);
        }
      } else if (refreshTokenValue) {
        // Try to refresh token if we have refresh token
        const userData = await refreshToken();
        if (userData) {
          setCurrentUser(userData);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthState();
  }, []);


  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      // For now, keep the existing signup logic as the API endpoint wasn't provided
      toast({
        id: String(Date.now()),
        title: "Sign up unavailable",
        description: "Please use the demo accounts for now"
      });
    } catch (error: any) {
      toast({
        id: String(Date.now()),
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        const { user, accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Set tokens in cookies
        setCookie('accessToken', accessToken, 1); // 1 day
        setCookie('refreshToken', newRefreshToken, 7); // 7 days
        
        // Set user data in state (no localStorage for user data)
        setCurrentUser(user);
        
        toast({
          id: String(Date.now()),
          title: "Signed in successfully",
          description: `Welcome back, ${user.displayName}!`
        });
      }
    } catch (error: any) {
      toast({
        id: String(Date.now()),
        title: "Sign in failed",
        description: error.response?.data?.message || error.message || "Invalid email or password"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    watchHistoryUtils.clear();
    likedContentUtils.clear();
    setWatchHistory([]);
    setLikedContent([]);
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    toast({
      id: String(Date.now()),
      title: "Signed out",
      description: "You've been signed out successfully"
    });
  };

  const updateWatchHistory = (animeData: {
    animeId: number;
    title: string;
    imageUrl: string;
    episodeId?: string;
    episodeNumber?: number;
  }) => {
    if (!currentUser) return;

    const newHistory = watchHistoryUtils.add(animeData);
    setWatchHistory(newHistory);
  };

  const toggleLikedContent = (content: {
    id: number;
    type: "anime" | "episode";
    title: string;
    imageUrl: string;
  }) => {
    if (!currentUser) return;

    const { liked, wasAdded } = likedContentUtils.toggle(content);
    setLikedContent(liked);
    
    toast({
      id: String(Date.now()),
      title: wasAdded ? "Added to favorites" : "Removed from favorites",
      description: `${content.title} has been ${wasAdded ? "added to" : "removed from"} your favorites`
    });
  };

  const isContentLiked = (id: number, type: "anime" | "episode") => {
    return likedContentUtils.isLiked(id, type);
  };

  const value = {
    currentUser,
    isLoading,
    isAdmin: currentUser?.isAdmin || false,
    watchHistory,
    likedContent,
    signUp,
    signIn,
    signOut,
    updateWatchHistory,
    toggleLikedContent,
    isContentLiked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
