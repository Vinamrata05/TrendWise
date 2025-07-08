"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";

export function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuthContext();
    const [avatarError, setAvatarError] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // This useEffect ensures that the component only renders user-specific elements on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    const handleAvatarError = () => {
        console.log("Avatar image failed to load");
        setAvatarError(true);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-xl">
                        TrendWise
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="/" className="text-sm font-medium hover:underline">
                            Home
                        </Link>
                        <Link href="/trends" className="text-sm font-medium hover:underline">
                            Trends
                        </Link>
                        {isClient && isAdmin && (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium hover:underline">
                                    Dashboard
                                </Link>
                                <Link href="/generate" className="text-sm font-medium hover:underline">
                                    Generate
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {isClient && isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm font-medium hover:underline">
                                Profile
                            </Link>
                            <div className="flex items-center gap-2">
                                {user?.image && !avatarError ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="h-8 w-8 rounded-full"
                                        onError={handleAvatarError}
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        {user?.name?.charAt(0) || "U"}
                                    </div>
                                )}
                                <span className="text-sm font-medium">{user?.name}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Button variant="default" size="sm" asChild>
                            <Link href="/auth/signin">Sign In</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
} 