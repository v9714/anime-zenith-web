import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { setToken } from "@/services/backendApi";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authService.verifyEmail(token);

                if (response.success) {
                    const { accessToken, refreshToken } = response.data;

                    // Set tokens to auto-login the user
                    setToken('accessToken', accessToken);
                    setToken('refreshToken', refreshToken);

                    setStatus("success");
                    setMessage(response.message || "Email verified successfully! You are now logged in.");

                    toast.success("Email Verified", {
                        description: "Your account has been verified and you're now logged in.",
                    });

                    // Redirect to home after a short delay
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                } else {
                    setStatus("error");
                    setMessage(response.message || "Verification failed");
                }
            } catch (error: unknown) {
                setStatus("error");
                const errorMessage = error instanceof Error ? error.message : "Invalid or expired verification token";
                setMessage(errorMessage);
                toast.error("Verification Failed", {
                    description: errorMessage,
                });
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center space-y-6">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                        <h1 className="text-2xl font-bold">Verifying your email...</h1>
                        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                        <h1 className="text-2xl font-bold">Email Verified!</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm text-muted-foreground">Redirecting you to the homepage...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="w-16 h-16 mx-auto text-destructive" />
                        <h1 className="text-2xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <Button onClick={() => navigate("/")} className="mt-4">
                            Go to Homepage
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
