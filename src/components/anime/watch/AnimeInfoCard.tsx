import { useState, useEffect } from "react";
import { Play, Bookmark, Heart, Share, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { watchlistService } from "@/services/likeService";
import { LoginPromptModal } from "@/components/auth/LoginPromptModal";
import { AuthModal } from "@/components/auth/AuthModal";

// Define the anime type correctly
interface AnimeData {
  title: string;
  description: string;
  rating: number;
  votes: number;
  genres?: string[];
  year?: number;
  studio?: string;
  duration?: string;
  status?: string;
  imageUrl?: string;
}

interface AnimeInfoCardProps {
  anime: AnimeData;
  animeId: number;
}

export function AnimeInfoCard({ anime, animeId }: AnimeInfoCardProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  // Fetch watchlist status on mount
  useEffect(() => {
    if (currentUser && animeId) {
      fetchWatchlistStatus();
    }
  }, [currentUser, animeId]);

  const fetchWatchlistStatus = async () => {
    try {
      const response = await watchlistService.getWatchlistStatus(animeId);
      if (response.success) {
        setIsSaved(response.data.isInWatchlist);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist status:", error);
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    const newSaveStatus = !isSaved;
    
    // Optimistic update
    setIsSaved(newSaveStatus);
    
    try {
      if (newSaveStatus) {
        await watchlistService.addToWatchlist(animeId);
      } else {
        await watchlistService.removeFromWatchlist(animeId);
      }
      
      toast({
        id: String(Date.now()),
        title: newSaveStatus ? "Added to Watchlist" : "Removed from Watchlist",
        description: newSaveStatus 
          ? `${anime.title} has been added to your watchlist`
          : `${anime.title} has been removed from your watchlist`,
      });
    } catch (error) {
      // Revert on error
      setIsSaved(!newSaveStatus);
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to update watchlist",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    setShowLoginPrompt(false);
    setAuthView("signin");
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setShowLoginPrompt(false);
    setAuthView("signup");
    setShowAuthModal(true);
  };

  return (
    <>
      <Card className="bg-card/90 w-full shadow-xl border-border/50">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <img
              src={anime.imageUrl || "https://cdn.myanimelist.net/images/anime/13/56139.jpg"}
              alt={anime.title}
              className="w-full h-40 rounded-md object-cover shadow-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-md"></div>
            <div className="absolute bottom-0 p-3">
              <h2 className="text-lg font-bold text-white">{anime.title}</h2>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>{anime.year}</span>
                <span className="w-1 h-1 rounded-full bg-white/80"></span>
                <span>{anime.studio}</span>
                <span className="w-1 h-1 rounded-full bg-white/80"></span>
                <span>{anime.duration}</span>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center bg-primary/10 rounded-lg p-2 text-primary">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="ml-1 text-lg font-bold">{anime.rating}</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">User Rating</div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${(anime.rating / 10) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Genre tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {anime.genres?.map((genre, idx) => (
              <Badge key={idx} variant="secondary" className="bg-secondary/20 text-secondary-foreground">{genre}</Badge>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-foreground mb-4 line-clamp-3">{anime.description}</p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Play className="h-4 w-4 mr-1" /> Watch Now
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full ${isSaved ? 'bg-primary/10 border-primary/30' : 'border-primary/30 hover:bg-primary/10'}`}
                  onClick={handleSaveToggle}
                  disabled={isLoading}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Add to List'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSaved ? 'Remove from your list' : 'Add to your watchlist'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Extra options */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={handleSaveToggle}
                  disabled={isLoading}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Share className="h-4 w-4 mr-1" /> Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share this anime</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        action="save this anime"
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView={authView}
      />
    </>
  );
}
