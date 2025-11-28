import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

const formSchema = z.object({
    newPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const token = searchParams.get("token");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            setResetStatus("error");
            setErrorMessage("Invalid password reset link. Please request a new one.");
        }
    }, [token]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!token) return;

        setIsSubmitting(true);
        try {
            const response = await authService.resetPassword(token, values.newPassword);
            if (response.success) {
                setResetStatus("success");
                toast.success("Password Reset Successful", {
                    description: response.message,
                });
            } else {
                setResetStatus("error");
                setErrorMessage(response.message || "Failed to reset password");
                toast.error("Error", {
                    description: response.message || "Failed to reset password",
                });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to reset password. The link may have expired.";
            setResetStatus("error");
            setErrorMessage(message);
            toast.error("Error", {
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToLogin = () => {
        navigate("/");
    };

    return (
        <>
            <SEO
                title="Reset Password"
                description="Reset your password to regain access to your account"
            />
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            {resetStatus === "success" ? "Password Reset!" : resetStatus === "error" ? "Reset Failed" : "Reset Password"}
                        </CardTitle>
                        <CardDescription>
                            {resetStatus === "success"
                                ? "Your password has been successfully reset"
                                : resetStatus === "error"
                                    ? "Unable to reset your password"
                                    : "Enter your new password below"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resetStatus === "success" ? (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    You can now sign in with your new password.
                                </p>
                                <Button onClick={handleGoToLogin} className="w-full">
                                    Go to Sign In
                                </Button>
                            </div>
                        ) : resetStatus === "error" ? (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {errorMessage}
                                </p>
                                <Button onClick={handleGoToLogin} className="w-full">
                                    Go to Sign In
                                </Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
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

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
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

                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>Password must contain:</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            <li>At least 8 characters</li>
                                            <li>One uppercase letter</li>
                                            <li>One lowercase letter</li>
                                            <li>One number</li>
                                            <li>One special character</li>
                                        </ul>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
