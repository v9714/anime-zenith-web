import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
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
import { likeService } from "@/services/likeService";

interface LikeButtonProps {
  animeId: number;
  episodeId: number;
}

export function LikeButton({ animeId, episodeId }: LikeButtonProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  
  // Fetch like status on mount
  useEffect(() => {
    if (currentUser && episodeId) {
      fetchLikeStatus();
    }
  }, [currentUser, episodeId]);

  const fetchLikeStatus = async () => {
    try {
      const response = await likeService.getLikeStatus(episodeId);
      if (response.success) {
        setIsLiked(response.data.isLiked);
      }
    } catch (error) {
      console.error("Failed to fetch like status:", error);
    }
  };
  
  const handleLike = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    const newLikeStatus = !isLiked;
    
    // Optimistic update
    setIsLiked(newLikeStatus);
    
    try {
      const response = await likeService.toggleLike(episodeId, animeId, newLikeStatus);
      
      if (response.success) {
        toast({
          id: String(Date.now()),
          title: newLikeStatus ? "Liked!" : "Like removed",
          description: newLikeStatus 
            ? "This episode has been added to your liked content"
            : "This episode has been removed from your liked content",
        });
      } else {
        // Revert on failure
        setIsLiked(!newLikeStatus);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikeStatus);
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to update like status",
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
            variant="ghost" 
            className={`text-white hover:bg-white/10 h-8 w-8 p-0 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLiked ? "Unlike" : "Like"}</TooltipContent>
      </Tooltip>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        action="like this episode"
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView={authView}
      />
    </>
  );
}