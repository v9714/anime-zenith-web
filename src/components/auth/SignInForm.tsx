
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
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface SignInFormProps {
  onSuccess: () => void;
  switchToSignUp: () => void;
}

export function SignInForm({ onSuccess, switchToSignUp }: SignInFormProps) {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo credentials for easy testing
  const fillDemoCredentials = (type: "user" | "admin") => {
    if (type === "admin") {
      form.setValue("email", "admin@gmail.com");
      form.setValue("password", "admin@123");
    } else {
      form.setValue("email", "user@gmail.com");
      form.setValue("password", "User@123");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-primary hover:underline text-sm"
              onClick={() => fillDemoCredentials("user")}
            >
              Try Demo User
            </button>
            <button
              type="button"
              className="text-primary hover:underline text-sm"
              onClick={() => fillDemoCredentials("admin")}
            >
              Try Demo Admin
            </button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={switchToSignUp}
              className="text-primary hover:underline font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
