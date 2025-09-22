import { useState, useEffect } from "react";
import { X, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/utils/constants";

const STORAGE_KEY = "development_notice_dismissed";
const DAYS_TO_RESHOW = 4; // Show every 4 days

export function DevelopmentNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkShouldShow = () => {
      const lastDismissed = localStorage.getItem(STORAGE_KEY);
      
      if (!lastDismissed) {
        // First time user
        setIsVisible(true);
        return;
      }

      const lastDismissedDate = new Date(lastDismissed);
      const daysSinceLastDismissed = Math.floor(
        (Date.now() - lastDismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastDismissed >= DAYS_TO_RESHOW) {
        setIsVisible(true);
      }
    };

    checkShouldShow();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg max-w-md w-full mx-auto shadow-lg">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Website Under Development</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Welcome to OtakuTv! This website is currently in active development. 
                Some features may not work as expected or may be temporarily unavailable.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Found a bug or want to request a feature?
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <a 
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleDismiss} className="w-full sm:w-auto">
              Got it, thanks!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}