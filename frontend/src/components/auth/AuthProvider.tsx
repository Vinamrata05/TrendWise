"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import axios from 'axios';

interface AuthContextType {
    user: {
        id?: string;
        name?: string;
        email?: string;
        image?: string;
        role?: string;
    } | null;
    loading: boolean;
    error: string | null;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    logout: () => { },
    isAuthenticated: false,
    isAdmin: false,
});

function AuthContextProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [directUser, setDirectUser] = useState<{
        id?: string;
        name?: string;
        email?: string;
        image?: string;
        role?: string;
    } | null>(null);
    const [directError, setDirectError] = useState<string | null>(null);
    const [directLoading, setDirectLoading] = useState(false);

    // Try to get user info directly from the API if the token exists in localStorage
    useEffect(() => {
        const fetchUserDirectly = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                setDirectLoading(true);
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("Direct API user data:", response.data);

                if (response.data.user) {
                    setDirectUser({
                        id: response.data.user._id,
                        name: response.data.user.name,
                        email: response.data.user.email,
                        image: response.data.user.image,
                        role: response.data.user.role,
                    });
                }
                setDirectLoading(false);
            } catch (err) {
                console.error("Error fetching user directly:", err);
                localStorage.removeItem('auth_token');
                setDirectError("Failed to authenticate");
                setDirectLoading(false);
            }
        };

        // Only try direct API if NextAuth session is not available
        if (status === 'unauthenticated') {
            fetchUserDirectly();
        }
    }, [status]);

    // Store token in localStorage when session changes
    useEffect(() => {
        console.log("Session changed:", session);

        if (session?.backendToken) {
            console.log("Storing token in localStorage:", session.backendToken);
            localStorage.setItem('auth_token', session.backendToken);
        } else if (status === 'unauthenticated' && !directUser) {
            console.log("Removing token from localStorage");
            localStorage.removeItem('auth_token');
        }
    }, [session, status, directUser]);

    const loading = status === "loading" || directLoading;
    const isAuthenticated = status === "authenticated" || !!directUser;
    const isAdmin = (session?.user?.role === "admin") || (directUser?.role === "admin");

    const user = session?.user ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role,
    } : directUser;

    const logout = () => {
        console.log("Logging out, removing token");
        localStorage.removeItem('auth_token');
        setDirectUser(null);
        signOut({ callbackUrl: "/" });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error: directError,
                logout,
                isAuthenticated,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthContextProvider>{children}</AuthContextProvider>
        </SessionProvider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
} 