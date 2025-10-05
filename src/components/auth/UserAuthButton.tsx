
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, LogIn, Heart, Clock, Settings, LogOut, Volume2 } from "lucide-react";

export function UserAuthButton() {
  const { currentUser, isAdmin, signOut } = useAuth();
  const { playButtonClick } = useAudio();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  const handleSignInClick = () => {
    setAuthView("signin");
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthView("signup");
    setShowAuthModal(true);
  };

  if (!currentUser) {
    return (
      <>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSignInClick}>
            Sign In
          </Button>
          <Button size="sm" onClick={handleSignUpClick}>
            Sign Up
          </Button>
        </div>
        
        <Button className="md:hidden" variant="ghost" size="icon" onClick={handleSignInClick}>
          <LogIn className="h-5 w-5" />
        </Button>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          defaultView={authView}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            {currentUser.displayName.charAt(0).toUpperCase()}
            {isAdmin && (
              <span className="absolute -top-1 -right-1 bg-primary rounded-full w-2.5 h-2.5 border-2 border-background"></span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{currentUser.displayName}</div>
            <div className="text-xs text-muted-foreground">{currentUser.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Link to="/profile" onClick={playButtonClick}>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
          </Link>
          
          <Link to="/profile?tab=history" onClick={playButtonClick}>
            <DropdownMenuItem>
              <Clock className="mr-2 h-4 w-4" />
              <span>Watch History</span>
            </DropdownMenuItem>
          </Link>
          
          <Link to="/profile?tab=favorites" onClick={playButtonClick}>
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              <span>My Favorites</span>
            </DropdownMenuItem>
          </Link>
          
          <Link to="/audio-settings" onClick={playButtonClick}>
            <DropdownMenuItem>
              <Volume2 className="mr-2 h-4 w-4" />
              <span>Audio Settings</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          {isAdmin && (
            <>
              <Link to="/admin" onClick={playButtonClick}>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => { playButtonClick(); signOut(); }}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
