import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EmailSentConfirmation } from "./EmailSentConfirmation";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
});

interface ForgotPasswordFormProps {
    onBack: () => void;
    onLoadingChange?: (isLoading: boolean) => void;
}

export function ForgotPasswordForm({ onBack, onLoadingChange }: ForgotPasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        onLoadingChange?.(true);
        try {
            const response = await authService.forgotPassword(values.email);
            if (response.success) {
                setIsEmailSent(true);
                toast.success("Email Sent", {
                    description: response.message,
                });
            } else {
                toast.error("Error", {
                    description: response.message || "Failed to send reset email",
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to send password reset email. Please try again.";
            toast.error("Error", {
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
            onLoadingChange?.(false);
        }
    };

    if (isEmailSent) {
        return (
            <EmailSentConfirmation
                title="Check your email"
                description="We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
                onBack={onBack}
                backButtonText="Back to Sign In"
            />
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="your.email@example.com" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
