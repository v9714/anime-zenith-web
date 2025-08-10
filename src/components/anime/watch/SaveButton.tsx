
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPromptModal } from "@/components/auth/LoginPromptModal";
import { AuthModal } from "@/components/auth/AuthModal";

interface SaveButtonProps {
  animeId: number;
  title: string;
}

export function SaveButton({ animeId, title }: SaveButtonProps) {
  const { currentUser, toggleLikedContent, isContentLiked } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  
  const isSaved = currentUser ? isContentLiked(animeId, "anime") : false;
  
  const handleSave = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    
    toggleLikedContent({
      id: animeId,
      type: "anime",
      title: title,
      imageUrl: "https://cdn.myanimelist.net/images/anime/13/56139.jpg"
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
            className={`text-white hover:bg-white/10 h-8 w-8 p-0 ${isSaved ? "text-primary" : ""}`}
            onClick={handleSave}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isSaved ? "Unsave" : "Save"}</TooltipContent>
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
