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
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  // Fetch like status and count on mount
  useEffect(() => {
    if (episodeId) {
      fetchLikesCount();
      if (currentUser) {
        fetchLikeStatus();
      }
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

  const fetchLikesCount = async () => {
    try {
      const response = await likeService.getLikesCount(episodeId);
      if (response.success) {
        setLikesCount(response.data.totalLikes);
      }
    } catch (error) {
      console.error("Failed to fetch likes count:", error);
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
    setLikesCount(prev => newLikeStatus ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await likeService.toggleLike(episodeId, animeId, newLikeStatus);

      if (response.success) {
        setLikesCount(response.data.totalLikes);
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
        setLikesCount(prev => newLikeStatus ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikeStatus);
      setLikesCount(prev => newLikeStatus ? Math.max(0, prev - 1) : prev + 1);
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
            variant={isLiked ? "default" : "outline"}
            className={`gap-2 ${isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount > 0 ? likesCount : ""} {isLiked ? "Liked" : "Like"}
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