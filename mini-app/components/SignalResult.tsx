'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types';
import { hapticFeedback } from '@/lib/telegram';
import TradingViewChart from './TradingViewChart';

interface SignalResultProps {
    signal: Signal | null;
    isVisible: boolean;
    onNewSignal: () => void;
    onCancel: () => void;
    onTimeEnd: (result: 'WIN' | 'LOSE') => void;
}

export default function SignalResult({
    signal,
    isVisible,
    onNewSignal,
    onCancel,
    onTimeEnd,
}: SignalResultProps) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        if (isVisible && signal) {
            const durationSeconds = signal.timeframe * 60;
            setTotalTime(durationSeconds);
            setTimeLeft(durationSeconds);

            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        const isWin = Math.random() > 0.3;
                        onTimeEnd(isWin ? 'WIN' : 'LOSE');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isVisible, signal, onTimeEnd]);

    if (!isVisible || !signal) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + signal.timeframe);
    const endTimeStr = endTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    const isUp = signal.direction === 'UP' || signal.direction.includes('Buy');

    return (
        <div className="fixed inset-0 z-40 bg-[#0a0e1a] overflow-y-auto animate-fadeIn">

            {/* Scrollable Content */}
            <div className="pt-6 px-4 pb-24">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-white text-xl font-semibold pl-1">Сигнал</h2>
                </div>

                {/* Main Signal Card */}
                <div className="w-full bg-[#0f1624] rounded-3xl p-6 border border-white/5 shadow-2xl">

                    {/* Currency Pair Section */}
                    <div className="bg-[#1a2130] rounded-2xl p-4 mb-3">
                        <span className="text-gray-400 text-xs block mb-1">Валютна пара</span>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{signal.pair.flag1}{signal.pair.flag2}</span>
                            <span className="text-white text-xl font-bold">{signal.pair.name}</span>
                        </div>
                    </div>

                    {/* Timeframe & Accuracy Row */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 bg-[#1a2130] rounded-2xl p-4">
                            <span className="text-gray-400 text-xs block mb-1">Таймфрейм</span>
                            <span className="text-white text-lg font-bold">{signal.timeframe}хв</span>
                        </div>
                        <div className="flex-1 bg-[#1a2130] rounded-2xl p-4">
                            <span className="text-gray-400 text-xs block mb-1">Точність</span>
                            <span className="text-white text-lg font-bold">{signal.accuracy}%</span>
                        </div>
                    </div>

                    {/* Direction Section */}
                    <div className="bg-[#1a2130] rounded-2xl p-4 mb-3">
                        <span className="text-gray-400 text-xs block mb-1">Напрям</span>
                        <div className="flex items-center gap-2">
                            <svg
                                className={`w-6 h-6 ${isUp ? 'text-green-500' : 'text-red-500'}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isUp ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                            </svg>
                            <span className={`text-xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {isUp ? 'Вгору' : 'Вниз'}
                            </span>
                            <span className="text-white font-medium ml-1">
                                до {endTimeStr}
                            </span>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-[#1a2130] rounded-2xl p-4">
                        <span className="text-gray-400 text-xs block mb-3">Час до завершення</span>
                        <div className="relative h-4 bg-black/40 rounded-full mb-3 overflow-hidden box-border border border-white/5">
                            <div
                                className="absolute top-0 left-0 h-full bg-[#22c55e] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all duration-1000 ease-linear"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="text-center text-white text-sm font-mono tracking-wider">
                            {formatTime(timeLeft)}/{formatTime(totalTime)}
                        </div>
                    </div>

                </div>

                {/* Buttons - In their place, after the card */}
                <div className="mt-6 space-y-3">
                    <button
                        className="w-full py-4 rounded-xl bg-gradient-to-b from-gray-700 to-gray-800 text-gray-300 font-bold text-lg opacity-80"
                        disabled
                    >
                        ОТРИМАТИ НОВИЙ СИГНАЛ
                    </button>

                    <button
                        onClick={() => {
                            hapticFeedback.heavy();
                            onCancel();
                        }}
                        className="w-full py-4 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-all"
                    >
                        НА ГОЛОВНУ
                    </button>
                </div>

                {/* Chart - BELOW the buttons */}
                <div className="mt-6 h-[350px] w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <TradingViewChart
                        symbol={signal.pair.name}
                        interval={String(signal.timeframe)}
                        height="100%"
                        autosize
                    />
                </div>

            </div>

        </div>
    );
}
