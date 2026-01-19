'use client';

import { useEffect } from 'react';
import { initTelegramWebApp } from '@/lib/telegram';
import Navigation from './Navigation';

interface LayoutProps {
    children: React.ReactNode;
    showNavigation?: boolean;
    showHeader?: boolean;
    title?: string;
}

export default function Layout({
    children,
    showNavigation = true,
    showHeader = false,
    title
}: LayoutProps) {
    useEffect(() => {
        // Initialize Telegram WebApp on mount
        initTelegramWebApp();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Optional Header */}
            {showHeader && title && (
                <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-white/5">
                    <div className="px-4 py-4">
                        <h1 className="text-xl font-bold text-center">{title}</h1>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main
                className={`
          flex-1 
          ${showNavigation ? 'pb-24' : ''} 
          safe-area-top
        `}
            >
                {children}
            </main>

            {/* Bottom Navigation */}
            {showNavigation && <Navigation />}
        </div>
    );
}
