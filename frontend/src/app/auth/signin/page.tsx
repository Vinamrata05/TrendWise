"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testEmail, setTestEmail] = useState("");
    const [testName, setTestName] = useState("");

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await signIn("google", {
                callbackUrl: "/",
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                console.error("Sign in error:", result.error);
            } else if (result?.url) {
                router.push(result.url);
            }

            setLoading(false);
        } catch (err) {
            console.error("Sign in error:", err);
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleTestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testEmail || !testName) {
            setError("Please enter both email and name");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log("Attempting test login with:", { email: testEmail, name: testName });

            // Call our backend directly
            const response = await axios.post("http://localhost:5000/api/auth/google", {
                email: testEmail,
                name: testName,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(testName)}&background=random`,
                googleId: "test-user-" + Date.now(),
            });

            console.log("Login response:", response.data);

            if (response.data.token) {
                // Store token in localStorage
                localStorage.setItem("auth_token", response.data.token);

                // Redirect to home page
                router.push("/");
            } else {
                setError("Login failed: No token received");
            }

            setLoading(false);
        } catch (err) {
            console.error("Test login error:", err);
            setError("Login failed: " + (err instanceof Error ? err.message : "Unknown error"));
            setLoading(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Sign In</h1>
                    <p className="text-muted-foreground">
                        Sign in to access your account and manage your content
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Signing in..." : "Sign in with Google"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or use test login
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleTestLogin} className="space-y-4">
                        <div>
                            <label htmlFor="testName" className="block text-sm font-medium mb-1">
                                Name
                            </label>
                            <input
                                id="testName"
                                type="text"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="testEmail" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                id="testEmail"
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="your@email.com"
                            />
                        </div>
                        <Button type="submit" variant="outline" disabled={loading} className="w-full">
                            {loading ? "Signing in..." : "Test Login"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 