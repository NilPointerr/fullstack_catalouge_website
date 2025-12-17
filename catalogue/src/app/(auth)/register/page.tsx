"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, UserPlus, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Calculate password strength
    useEffect(() => {
        if (password.length === 0) {
            setPasswordStrength(null);
            return;
        }
        if (password.length < 6) {
            setPasswordStrength("weak");
        } else if (password.length < 10) {
            setPasswordStrength("medium");
        } else {
            setPasswordStrength("strong");
        }
    }, [password]);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post("/users/open", {
                email,
                password,
                full_name: name,
                user_type: "user", // Always set to user for UI registrations
            });

            if (response.status === 200 || response.status === 201) {
                router.push("/login?registered=true");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || "Registration failed";
            setError(errorMessage);
            setIsLoading(false);
        }
    }

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case "weak":
                return "bg-red-500";
            case "medium":
                return "bg-yellow-500";
            case "strong":
                return "bg-green-500";
            default:
                return "bg-muted";
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case "weak":
                return "Weak password";
            case "medium":
                return "Medium strength";
            case "strong":
                return "Strong password";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">
                <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
                    <CardHeader className="space-y-4 text-center pb-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <UserPlus className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-base">
                            Fill in your details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="h-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    required
                                    className="h-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password (min. 6 characters)"
                                        disabled={isLoading}
                                        required
                                        minLength={6}
                                        className="h-11 text-base pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm p-1"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Password strength:</span>
                                            <span className={`font-medium ${
                                                passwordStrength === "weak" ? "text-red-500" :
                                                passwordStrength === "medium" ? "text-yellow-500" :
                                                passwordStrength === "strong" ? "text-green-500" :
                                                "text-muted-foreground"
                                            }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                style={{
                                                    width: passwordStrength === "weak" ? "33%" :
                                                           passwordStrength === "medium" ? "66%" :
                                                           passwordStrength === "strong" ? "100%" : "0%"
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {password.length > 0 && password.length < 6 && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Password must be at least 6 characters long
                                    </p>
                                )}
                                {password.length >= 6 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Password meets requirements
                                    </p>
                                )}
                            </div>
                            <Button 
                                disabled={isLoading || password.length < 6} 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-5 w-5" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-muted-foreground font-medium">
                                    Secure Registration
                                </span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
