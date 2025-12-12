"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Check for registration success
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("registered") === "true") {
            setSuccess("Registration successful! Please log in.");
        }
    }, []);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            // Login API call - OAuth2PasswordRequestForm expects username and password as form data
            const formDataToSend = new URLSearchParams();
            formDataToSend.append("username", email);
            formDataToSend.append("password", password);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/login/access-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formDataToSend.toString(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Invalid email or password" }));
                throw new Error(errorData.detail || "Login failed");
            }

            const tokenData = await response.json();
            const accessToken = tokenData.access_token;

            // Temporarily set token in store to use with API interceptor
            useAuthStore.setState({ accessToken });

            // Fetch user data using the API instance (which will use the token via interceptor)
            const userResponse = await api.get("/users/me");
            const userData = userResponse.data;
            
            // Store user and token (this will also update the API instance via interceptor)
            login(
                {
                    id: userData.id.toString(),
                    email: userData.email,
                    name: userData.full_name || userData.email,
                    role: userData.is_superuser ? "admin" : "user",
                },
                accessToken
            );

            setIsLoading(false);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "An error occurred during login");
            setIsLoading(false);
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </div>
                <div className="grid gap-6">
                    {success && (
                        <div className="bg-green-500/15 text-green-600 dark:text-green-400 text-sm p-3 rounded-md">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <Button disabled={isLoading} type="submit">
                                {isLoading && (
                                    <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                                )}
                                Sign In with Email
                            </Button>
                        </div>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                </div>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href="/register"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Don&apos;t have an account? Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
