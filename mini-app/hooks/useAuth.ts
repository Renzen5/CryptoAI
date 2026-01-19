'use client';

import { useState, useEffect, useCallback } from 'react';
import { TelegramUser, getTelegramWebApp, getTelegramUser } from '@/lib/telegram';

export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    isWhitelisted: boolean;
    user: TelegramUser | null;
    error: string | null;
    sessionToken: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        isLoading: true,
        isAuthenticated: false,
        isWhitelisted: false,
        user: null,
        error: null,
        sessionToken: null,
    });

    const authenticate = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const webApp = getTelegramWebApp();

            if (!webApp) {
                // Not in Telegram environment - allow for development
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Not in Telegram environment, using dev mode');
                    setState({
                        isLoading: false,
                        isAuthenticated: true,
                        isWhitelisted: true,
                        user: {
                            id: 123456789,
                            first_name: 'Dev',
                            last_name: 'User',
                            username: 'devuser',
                            language_code: 'uk',
                        },
                        error: null,
                        sessionToken: 'dev-token',
                    });
                    return;
                }

                throw new Error('Telegram Web App not available');
            }

            const initData = webApp.initData;

            if (!initData) {
                throw new Error('No initData available');
            }

            // Call auth API
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            setState({
                isLoading: false,
                isAuthenticated: true,
                isWhitelisted: data.isWhitelisted,
                user: data.user,
                error: null,
                sessionToken: data.sessionToken,
            });

            // Store session token
            if (data.sessionToken) {
                sessionStorage.setItem('auth_token', data.sessionToken);
            }

        } catch (error) {
            console.error('Authentication error:', error);
            setState({
                isLoading: false,
                isAuthenticated: false,
                isWhitelisted: false,
                user: null,
                error: error instanceof Error ? error.message : 'Authentication failed',
                sessionToken: null,
            });
        }
    }, []);

    // Auto-authenticate on mount
    useEffect(() => {
        authenticate();
    }, [authenticate]);

    // Function to manually retry authentication
    const retry = useCallback(() => {
        authenticate();
    }, [authenticate]);

    return {
        ...state,
        retry,
    };
}
