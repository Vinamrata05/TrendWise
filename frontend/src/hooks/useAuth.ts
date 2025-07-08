import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Check if we have a token in localStorage
                const token = localStorage.getItem('auth_token');

                if (!token) {
                    setAuthState({ user: null, loading: false, error: null });
                    return;
                }

                // Make a request to the backend to verify the token
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAuthState({
                    user: response.data.user,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error('Auth error:', error);
                // Clear token if invalid
                localStorage.removeItem('auth_token');
                setAuthState({
                    user: null,
                    loading: false,
                    error: 'Authentication failed',
                });
            }
        };

        fetchUser();
    }, []);

    const login = async (googleToken: string) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/google', {
                token: googleToken,
            });

            const { token, user } = response.data;

            // Store token in localStorage
            localStorage.setItem('auth_token', token);

            setAuthState({
                user,
                loading: false,
                error: null,
            });

            return user;
        } catch (error) {
            console.error('Login error:', error);
            setAuthState({
                user: null,
                loading: false,
                error: 'Login failed',
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setAuthState({
            user: null,
            loading: false,
            error: null,
        });
    };

    return {
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        login,
        logout,
        isAuthenticated: !!authState.user,
        isAdmin: authState.user?.role === 'admin',
    };
}