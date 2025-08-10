
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  action?: string;
}

export function LoginPromptModal({ 
  isOpen, 
  onClose, 
  onSignIn, 
  onSignUp, 
  action = "add to favorites" 
}: LoginPromptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sign in required</DialogTitle>
          <DialogDescription>
            Please sign in to {action}. Create an account if you don't have one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onSignIn} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          
          <Button onClick={onSignUp} variant="outline" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
          
          <Button onClick={onClose} variant="ghost" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
