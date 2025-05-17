
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define user types and interfaces
export interface UserData {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
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
const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "admin123", // In a real app, never store plain text passwords
    displayName: "Admin User",
    isAdmin: true,
    watchHistory: [],
    likedContent: [],
  },
  {
    id: "user-1",
    email: "user@example.com",
    password: "user123", // In a real app, never store plain text passwords
    displayName: "Regular User",
    isAdmin: false,
    watchHistory: [],
    likedContent: [],
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("otaku-user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage whenever user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("otaku-user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const existingUser = MOCK_USERS.find(user => user.email === email);
      if (existingUser) {
        throw new Error("Email already in use");
      }

      // Create new user
      const newUser: UserData = {
        id: `user-${Date.now()}`,
        email,
        displayName,
        isAdmin: false,
        watchHistory: [],
        likedContent: [],
      };

      // Add to mock users (in a real app, this would be a database operation)
      MOCK_USERS.push({ ...newUser, password });

      // Log in the new user
      setCurrentUser(newUser);
      toast({
        id: String(Date.now()),
        title: "Account created!",
        description: "Welcome to Otaku Anime!"
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
      // Find user with matching email and password
      const user = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Create user data without password
      const userData: UserData = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        watchHistory: user.watchHistory,
        likedContent: user.likedContent,
      };

      setCurrentUser(userData);
      toast({
        id: String(Date.now()),
        title: "Signed in successfully",
        description: `Welcome back, ${userData.displayName}!`
      });
    } catch (error: any) {
      toast({
        id: String(Date.now()),
        title: "Sign in failed",
        description: error.message || "Invalid email or password"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("otaku-user");
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
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
