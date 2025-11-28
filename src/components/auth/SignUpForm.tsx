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
import { useAuth } from "@/contexts/AuthContext";
import { EmailSentConfirmation } from "./EmailSentConfirmation";

const formSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

interface SignUpFormProps {
  onSuccess: () => void;
  switchToSignIn: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function SignUpForm({ onSuccess, switchToSignIn, onLoadingChange }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    onLoadingChange?.(true);
    try {
      await signUp(values.email, values.displayName);
      form.reset();
      setIsEmailSent(true);
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsSubmitting(false);
      onLoadingChange?.(false);
    }
  };

  if (isEmailSent) {
    return (
      <EmailSentConfirmation
        title="Check your email"
        description="We've sent a verification link to your email address. Please check your inbox and click the link to verify your account and set your password."
        onBack={switchToSignIn}
        backButtonText="Back to Sign In"
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToSignIn}
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </form>
    </Form>
  );
}
