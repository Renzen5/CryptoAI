'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isLoading, isAuthenticated, isWhitelisted, error, user, retry } = useAuth();

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-[#0a0e1a] flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-6">
                    <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-white text-lg font-medium">Авторизація...</p>
                <p className="text-gray-500 text-sm mt-2">Перевірка даних Telegram</p>
            </div>
        );
    }

    // Error state
    if (error && !isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-[#0a0e1a] flex flex-col items-center justify-center px-6">
                <div className="text-6xl mb-6">❌</div>
                <h1 className="text-white text-xl font-bold mb-2 text-center">Помилка авторизації</h1>
                <p className="text-gray-400 text-center mb-6">{error}</p>
                <button
                    onClick={retry}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors"
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    // Not whitelisted
    if (isAuthenticated && !isWhitelisted) {
        return (
            <div className="fixed inset-0 bg-[#0a0e1a] flex flex-col items-center justify-center px-6">
                <div className="text-6xl mb-6">🔒</div>
                <h1 className="text-white text-xl font-bold mb-2 text-center">Доступ заборонено</h1>
                <p className="text-gray-400 text-center mb-4">
                    Ви не маєте доступу до цього додатку.
                </p>
                {user && (
                    <div className="bg-[#141b2d] rounded-xl p-4 mb-6 border border-white/10">
                        <p className="text-gray-500 text-sm">Ваш Telegram ID:</p>
                        <p className="text-white font-mono text-lg">{user.id}</p>
                    </div>
                )}
                <p className="text-gray-500 text-sm text-center">
                    Зверніться до адміністратора для отримання доступу.
                </p>
            </div>
        );
    }

    // Authorized and whitelisted - render children
    return <>{children}</>;
}
