import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPromptModal } from "@/components/auth/LoginPromptModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { watchlistService } from "@/services/likeService";

interface SaveButtonProps {
  animeId: number;
  title: string;
}

export function SaveButton({ animeId, title }: SaveButtonProps) {
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
  
  const handleSave = async () => {
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
          ? `${title} has been added to your watchlist`
          : `${title} has been removed from your watchlist`,
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            size="sm" 
            variant={isSaved ? "default" : "outline"}
            className={`gap-2 ${isSaved ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
            onClick={handleSave}
            disabled={isLoading}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isSaved ? "Remove from Watchlist" : "Add to Watchlist"}</TooltipContent>
      </Tooltip>

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
