
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SaveButtonProps {
  animeId: number;
  title: string;
}

export function SaveButton({ animeId, title }: SaveButtonProps) {
  const { currentUser, toggleLikedContent, isContentLiked } = useAuth();
  const { toast } = useToast();
  const isSaved = currentUser ? isContentLiked(animeId, "anime") : false;
  
  const handleSave = () => {
    if (!currentUser) {
      toast({
        id: String(Date.now()),
        title: "Sign in required",
        description: "Please sign in to save content",
      });
      return;
    }
    
    toggleLikedContent({
      id: animeId,
      type: "anime",
      title: title,
      imageUrl: "https://cdn.myanimelist.net/images/anime/13/56139.jpg"
    });
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className={`text-white hover:bg-white/10 h-8 w-8 p-0 ${isSaved ? "text-primary" : ""}`}
          onClick={handleSave}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isSaved ? "Unsave" : "Save"}</TooltipContent>
    </Tooltip>
  );
}
