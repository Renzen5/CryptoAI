'use client';

import { useEffect, useState } from 'react';
// import Confetti from 'react-confetti';
// import { useWindowSize } from 'react-use';
import { hapticFeedback } from '@/lib/telegram';

// Simple hook for window size if react-use is not available
function useWindowSizeCustom() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);
    return size;
}

interface WinLossModalProps {
    isVisible: boolean;
    result: 'WIN' | 'LOSE' | null;
    onClose: () => void;
    pairName?: string;
}

export default function WinLossModal({ isVisible, result, onClose, pairName }: WinLossModalProps) {
    const { width, height } = useWindowSizeCustom();

    useEffect(() => {
        if (isVisible) {
            if (result === 'WIN') {
                hapticFeedback.success();
            } else {
                hapticFeedback.error();
            }
        }
    }, [isVisible, result]);

    if (!isVisible || !result) return null;

    const isWin = result === 'WIN';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 animate-fadeIn">
            {/* {isWin && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />} */}

            <div className="w-full max-w-sm relative">

                {/* Top Branding similar to screenshot */}
                <div className="absolute -top-32 left-0 right-0 text-center">
                    <h1 className="text-4xl font-bold text-white tracking-widest leading-tight">
                        NESTOR<br />TRADE
                        <span className="ml-2 bg-blue-600 text-xs px-1 rounded align-top">AI</span>
                    </h1>
                </div>

                {/* Result Card */}
                <div
                    className={`
            w-full rounded-[32px] p-6 text-center border overflow-hidden relative
            ${isWin
                            ? 'bg-[#0f1926] border-[#22c55e] shadow-[0_0_50px_rgba(34,197,94,0.2)]'
                            : 'bg-[#0f1926] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
                        }
          `}
                >
                    {/* Glow effect inside */}
                    <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${isWin ? 'from-[#22c55e]/20' : 'from-red-500/20'} to-transparent`} />

                    {/* Header: YOU WIN / YOU LOSE */}
                    <h2 className={`text-2xl font-bold mb-6 flex items-center justify-center gap-2 relative z-10 ${isWin ? 'text-[#22c55e]' : 'text-red-500'}`}>
                        YOU {isWin && <span className="text-2xl">🏆</span>} {isWin ? 'WIN' : 'LOSE'}
                    </h2>

                    {/* Signal Details (Reusing the look from SignalResult but static) */}
                    <div className={`bg-[#1a2130] rounded-xl p-4 mb-3 text-left border-l-4 ${isWin ? 'border-[#22c55e]' : 'border-red-500'}`}>
                        <span className="text-gray-400 text-xs block mb-1">Валютная пара</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{pairName || 'EUR/USD'}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 bg-[#1a2130] rounded-xl p-3 text-left">
                            <span className="text-gray-400 text-xs block mb-1">Таймфрейм</span>
                            <span className="text-white font-bold">5мин</span> {/* Placeholder */}
                        </div>
                        <div className="flex-1 bg-[#1a2130] rounded-xl p-3 text-left">
                            <span className="text-gray-400 text-xs block mb-1">Точность</span>
                            <span className="text-white font-bold">85%</span>
                        </div>
                    </div>

                    <div className="bg-[#1a2130] rounded-xl p-4 text-left">
                        <span className="text-gray-400 text-xs block mb-1">Направление</span>
                        <div className="flex items-center gap-2 text-white font-bold">
                            {/* Just displaying generic data for the updated view unless we pass more props */}
                            <span className={isWin ? 'text-green-500' : 'text-red-500'}>
                                {isWin ? 'Вверх' : 'Вниз'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-8 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-all uppercase"
                >
                    НА ГЛАВНУЮ
                </button>

            </div>
        </div>
    );
}
