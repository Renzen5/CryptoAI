'use client';

import { useEffect, useState } from 'react';

interface RobotLoaderProps {
    isVisible: boolean;
}

export default function RobotLoader({ isVisible }: RobotLoaderProps) {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <div
            className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-black/80 backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
        >
            <div className="relative w-48 h-48 mb-8 animate-bounce-slow">
                {/* Robot Image Replacement - simplified SVG or image */}
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                    alt="Robot"
                    className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                />
            </div>

            <div className="bg-[#1e293b] px-8 py-3 rounded-full border border-white/10 shadow-lg">
                <p className="text-white font-bold text-lg animate-pulse">
                    Поиск сигнала...
                </p>
            </div>
        </div>
    );
}
