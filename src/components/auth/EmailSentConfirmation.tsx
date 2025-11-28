import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailSentConfirmationProps {
    title: string;
    description: string;
    onBack: () => void;
    backButtonText?: string;
}

export function EmailSentConfirmation({
    title,
    description,
    onBack,
    backButtonText = "Back to Sign In"
}: EmailSentConfirmationProps) {
    return (
        <div className="space-y-4 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
            <Button
                variant="outline"
                className="w-full mt-4"
                onClick={onBack}
            >
                {backButtonText}
            </Button>
        </div>
    );
}
