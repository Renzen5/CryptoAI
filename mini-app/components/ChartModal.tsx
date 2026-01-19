'use client';

import { useState } from 'react';
import TradingViewChart from './TradingViewChart';
import { hapticFeedback } from '@/lib/telegram';

interface ChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbol: string;
    initialInterval?: string;
}

const INTERVALS = [
    { label: '1м', value: '1' },
    { label: '5м', value: '5' },
    { label: '15м', value: '15' },
    { label: '30м', value: '30' },
    { label: '1г', value: '60' },
    { label: '4г', value: '240' },
];

export default function ChartModal({
    isOpen,
    onClose,
    symbol,
    initialInterval = '5',
}: ChartModalProps) {
    const [interval, setInterval] = useState(initialInterval);

    if (!isOpen) return null;

    const handleClose = () => {
        hapticFeedback.light();
        onClose();
    };

    const handleIntervalChange = (newInterval: string) => {
        hapticFeedback.selection();
        setInterval(newInterval);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-background-card flex items-center justify-center hover:bg-background-secondary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="font-semibold">{symbol}</h2>
                        <p className="text-xs text-foreground-muted">TradingView Chart</p>
                    </div>
                </div>

                {/* Fullscreen button placeholder */}
                <button
                    className="w-10 h-10 rounded-full bg-background-card flex items-center justify-center hover:bg-background-secondary transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>

            {/* Interval tabs */}
            <div className="flex gap-2 px-4 py-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
                {INTERVALS.map((item) => (
                    <button
                        key={item.value}
                        onClick={() => handleIntervalChange(item.value)}
                        className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${interval === item.value
                                ? 'bg-accent text-white'
                                : 'bg-background-card text-foreground-muted hover:text-foreground'
                            }
            `}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Chart container */}
            <div className="flex-1 p-2">
                <TradingViewChart
                    symbol={symbol}
                    interval={interval}
                    autosize={true}
                />
            </div>

            {/* Bottom info */}
            <div className="px-4 py-3 border-t border-white/10 text-center">
                <p className="text-xs text-foreground-muted">
                    Дані надаються TradingView • Актуальна ціна
                </p>
            </div>
        </div>
    );
}
