'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { openTelegramLink, hapticFeedback } from '@/lib/telegram';

export default function MorePage() {
    const handleContactSupport = () => {
        hapticFeedback.medium();
        const supportUsername = 'ai_trade_support'; // Replace with actual
        try {
            openTelegramLink(`https://t.me/${supportUsername}`);
        } catch {
            window.open(`https://t.me/${supportUsername}`, '_blank');
        }
    };

    return (
        <Layout showHeader={false}>
            {/* Custom Header to match screenshot */}
            <div className="fixed top-0 left-0 right-0 z-40 pt-safe bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-center h-14 relative">
                    <h1 className="text-xl font-bold tracking-wide text-white">ПОДДЕРЖКА</h1>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 pt-20">

                {/* Glowing 3D-like Icon */}
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />

                    {/* Headset Icon */}
                    <div className="relative z-10 w-32 h-32 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <img
                            src="https://headsuphealth.com/wp-content/uploads/2025/02/Frame-1000003803.png"
                            alt="Support Icon"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Text */}
                <p className="text-gray-300 text-center text-lg mb-10 font-medium">
                    Есть вопросы или проблемы?
                </p>

                {/* Button */}
                <button
                    onClick={handleContactSupport}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-wide"
                >
                    НАПИСАТЬ В ПОДДЕРЖКУ
                </button>

            </div>
        </Layout>
    );
}
