
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

interface LikeButtonProps {
  animeId: number;
  episodeNumber: number;
}

export function LikeButton({ animeId, episodeNumber }: LikeButtonProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  
  // In a real app, this would check if the user has already liked the episode
  useEffect(() => {
    if (currentUser) {
      const likeStatus = localStorage.getItem(`like-${animeId}-${episodeNumber}`);
      setIsLiked(likeStatus === "true");
    }
  }, [currentUser, animeId, episodeNumber]);
  
  const handleLike = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    localStorage.setItem(`like-${animeId}-${episodeNumber}`, String(newLikeStatus));
    
    toast({
      id: String(Date.now()),
      title: newLikeStatus ? "Liked!" : "Like removed",
      description: newLikeStatus 
        ? "This episode has been added to your liked content"
        : "This episode has been removed from your liked content",
    });
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
