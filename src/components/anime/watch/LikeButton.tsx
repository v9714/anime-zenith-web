
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

interface LikeButtonProps {
  animeId: number;
  episodeNumber: number;
}

export function LikeButton({ animeId, episodeNumber }: LikeButtonProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  // In a real app, this would check if the user has already liked the episode
  useEffect(() => {
    if (currentUser) {
      const likeStatus = localStorage.getItem(`like-${animeId}-${episodeNumber}`);
      setIsLiked(likeStatus === "true");
    }
  }, [currentUser, animeId, episodeNumber]);
  
  const handleLike = () => {
    if (!currentUser) {
      toast({
        id: String(Date.now()),
        title: "Sign in required",
        description: "Please sign in to like episodes",
      });
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
  
  return (
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
  );
}
