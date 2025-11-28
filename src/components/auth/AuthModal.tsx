import { useState, useEffect } from "react";
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
import { ForgotPasswordForm } from "./ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultView = "signin" }: AuthModalProps) {
  const [view, setView] = useState<"signin" | "signup" | "forgot-password">(defaultView);

  // Update view when defaultView changes
  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

  const handleViewChange = (newView: "signin" | "signup" | "forgot-password") => {
    setView(newView);
  };

  const getTitle = () => {
    switch (view) {
      case "signin":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Forgot Password";
    }
  };

  const getDescription = () => {
    switch (view) {
      case "signin":
        return "Sign in to access your account";
      case "signup":
        return "Create a new account to track your favorite anime";
      case "forgot-password":
        return "Reset your password";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
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
          <SignInForm 
            onSuccess={onClose} 
            switchToSignUp={() => handleViewChange("signup")} 
            switchToForgotPassword={() => handleViewChange("forgot-password")}
          />
        ) : view === "signup" ? (
          <SignUpForm onSuccess={onClose} switchToSignIn={() => handleViewChange("signin")} />
        ) : (
          <ForgotPasswordForm onBack={() => handleViewChange("signin")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
