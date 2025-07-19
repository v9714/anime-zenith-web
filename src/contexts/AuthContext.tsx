
import * as React from "react";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { getCookie, setCookie, deleteCookie } from "@/services/backendApi";

// Define user types and interfaces
export interface UserData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string | null;
  watchHistory: {
    animeId: number;
    title: string;
    imageUrl: string;
    lastWatched: string; // ISO date string
    episodeId?: string;
    episodeNumber?: number;
  }[];
  likedContent: {
    id: number;
    type: "anime" | "episode";
    title: string;
    imageUrl: string;
  }[];
}

interface AuthContextType {
  currentUser: UserData | null;
  isLoading: boolean;
  isAdmin: boolean;
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
const refreshToken = async () => {
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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing user session on mount
  React.useEffect(() => {
    const checkAuthState = async () => {
      const storedUser = localStorage.getItem("otaku-user");
      const accessToken = getCookie('accessToken');
      const refreshTokenValue = getCookie('refreshToken');
      
      if (storedUser && accessToken) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error parsing stored user", error);
        }
      } else if (refreshTokenValue) {
        // Try to refresh token
        const userData = await refreshToken();
        if (userData) {
          const userWithLocalData = {
            ...userData,
            watchHistory: JSON.parse(localStorage.getItem("otaku-watchHistory") || "[]"),
            likedContent: JSON.parse(localStorage.getItem("otaku-likedContent") || "[]"),
          };
          setCurrentUser(userWithLocalData);
          localStorage.setItem("otaku-user", JSON.stringify(userWithLocalData));
        }
      }
      setIsLoading(false);
    };

    checkAuthState();
  }, []);

  // Update localStorage whenever user changes
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem("otaku-user", JSON.stringify(currentUser));
      localStorage.setItem("otaku-watchHistory", JSON.stringify(currentUser.watchHistory));
      localStorage.setItem("otaku-likedContent", JSON.stringify(currentUser.likedContent));
    }
  }, [currentUser]);

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
        
        // Create user data with local storage data
        const userData: UserData = {
          ...user,
          watchHistory: JSON.parse(localStorage.getItem("otaku-watchHistory") || "[]"),
          likedContent: JSON.parse(localStorage.getItem("otaku-likedContent") || "[]"),
        };

        setCurrentUser(userData);
        toast({
          id: String(Date.now()),
          title: "Signed in successfully",
          description: `Welcome back, ${userData.displayName}!`
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
    localStorage.removeItem("otaku-user");
    localStorage.removeItem("otaku-watchHistory");
    localStorage.removeItem("otaku-likedContent");
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

    setCurrentUser((prevUser) => {
      if (!prevUser) return null;
      
      // Remove existing entry for this anime to avoid duplicates
      const filteredHistory = prevUser.watchHistory.filter(
        (item) => item.animeId !== animeData.animeId
      );
      
      // Add new entry at the beginning of the array
      const newHistory = [
        {
          ...animeData,
          lastWatched: new Date().toISOString(),
        },
        ...filteredHistory,
      ];
      
      // Limit history to 20 items
      const limitedHistory = newHistory.slice(0, 20);
      
      return {
        ...prevUser,
        watchHistory: limitedHistory,
      };
    });
  };

  const toggleLikedContent = (content: {
    id: number;
    type: "anime" | "episode";
    title: string;
    imageUrl: string;
  }) => {
    if (!currentUser) return;

    setCurrentUser((prevUser) => {
      if (!prevUser) return null;
      
      const isAlreadyLiked = prevUser.likedContent.some(
        (item) => item.id === content.id && item.type === content.type
      );
      
      let newLikedContent;
      
      if (isAlreadyLiked) {
        // Remove from liked content
        newLikedContent = prevUser.likedContent.filter(
          (item) => !(item.id === content.id && item.type === content.type)
        );
        toast({
          id: String(Date.now()),
          title: "Removed from favorites",
          description: `${content.title} has been removed from your favorites`
        });
      } else {
        // Add to liked content
        newLikedContent = [...prevUser.likedContent, content];
        toast({
          id: String(Date.now()),
          title: "Added to favorites",
          description: `${content.title} has been added to your favorites`
        });
      }
      
      return {
        ...prevUser,
        likedContent: newLikedContent,
      };
    });
  };

  const isContentLiked = (id: number, type: "anime" | "episode") => {
    if (!currentUser) return false;
    return currentUser.likedContent.some(
      (item) => item.id === id && item.type === type
    );
  };

  const value = {
    currentUser,
    isLoading,
    isAdmin: currentUser?.isAdmin || false,
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
