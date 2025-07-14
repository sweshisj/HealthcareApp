'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AuthContextType {
    user: { email: string; firstName: string; } | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ email: string; firstName: string; } | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        // Attempt to load token from localStorage on initial render
        const storedToken = localStorage.getItem('jwt_token');
        if (storedToken) {
            try {
                const decodedToken = decodeToken(storedToken);
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) { // Check expiration
                    setUser({
                        email: decodedToken.email,
                        firstName: decodedToken.given_name
                    });
                    setToken(storedToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                } else {
                    localStorage.removeItem('jwt_token'); // Token expired
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem('jwt_token');
            }
        }
        setIsLoading(false);
    }, []);

    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode token:", e);
            return null;
        }
    };

    const login = (newToken: string) => {
        localStorage.setItem('jwt_token', newToken);
        const decoded = decodeToken(newToken);
        console.log(decoded)
        if (decoded) {
            setUser({ email: decoded.email, firstName: decoded.given_name });
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            router.push('/'); // Redirect to homepage after login
        }
    };
    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}