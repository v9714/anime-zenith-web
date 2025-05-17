
import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultView = "signin" }: AuthModalProps) {
  const [view, setView] = useState<"signin" | "signup">(defaultView);

  const handleViewChange = (newView: "signin" | "signup") => {
    setView(newView);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {view === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {view === "signin" 
              ? "Sign in to access your account" 
              : "Create a new account to track your favorite anime"}
          </DialogDescription>
        </DialogHeader>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {view === "signin" ? (
          <SignInForm onSuccess={onClose} switchToSignUp={() => handleViewChange("signup")} />
        ) : (
          <SignUpForm onSuccess={onClose} switchToSignIn={() => handleViewChange("signin")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
