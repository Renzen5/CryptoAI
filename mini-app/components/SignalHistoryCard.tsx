'use client';

import { memo } from 'react';
import { SignalResult, CURRENCY_PAIRS } from '@/types';
import { DBSignal } from '@/lib/signals';

interface SignalHistoryCardProps {
    signal: DBSignal;
}

// Get result config
const getResultConfig = (result: SignalResult | null) => {
    switch (result) {
        case 'WIN':
            return {
                text: 'WIN',
                bgColor: 'bg-success/20',
                textColor: 'text-success',
                icon: '✓',
            };
        case 'LOSE':
            return {
                text: 'LOSE',
                bgColor: 'bg-danger/20',
                textColor: 'text-danger',
                icon: '✗',
            };
        case 'NEUTRAL':
            return {
                text: 'NEUTRAL',
                bgColor: 'bg-warning/20',
                textColor: 'text-warning',
                icon: '○',
            };
        case 'CANCEL':
            return {
                text: 'CANCEL',
                bgColor: 'bg-neutral/20',
                textColor: 'text-neutral',
                icon: '−',
            };
        default:
            return {
                text: 'PENDING',
                bgColor: 'bg-accent/20',
                textColor: 'text-accent',
                icon: '◌',
            };
    }
};

// Get pair flags
const getPairFlags = (pairName: string): { flag1: string; flag2: string } => {
    const pair = CURRENCY_PAIRS.find(p => p.name === pairName);
    return pair
        ? { flag1: pair.flag1, flag2: pair.flag2 }
        : { flag1: '🏳️', flag2: '🏳️' };
};

function SignalHistoryCard({ signal }: SignalHistoryCardProps) {
    const flags = getPairFlags(signal.pair);

    // Date Formatting: DD.MM.YYYY - HH:MM
    const createdAt = new Date(signal.created_at);
    const day = createdAt.getDate().toString().padStart(2, '0');
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const year = createdAt.getFullYear();
    const hours = createdAt.getHours().toString().padStart(2, '0');
    const minutes = createdAt.getMinutes().toString().padStart(2, '0');

    const dateString = `${day}.${month}.${year} - ${hours}:${minutes}`;

    // Result Styling
    let resultNode;
    switch (signal.result) {
        case 'WIN':
            resultNode = <span className="font-bold text-[#22c55e]">WIN</span>;
            break;
        case 'LOSE':
            resultNode = <span className="font-bold text-red-500">LOSE</span>;
            break;
        case 'NEUTRAL':
            resultNode = <span className="font-bold text-[#f59e0b]">NEUTRAL</span>;
            break;
        case 'CANCEL':
            resultNode = <span className="font-bold text-gray-300">CANCEL</span>;
            break;
        default:
            resultNode = <span className="font-bold text-gray-400">PENDING</span>;
    }

    return (
        <div className="w-full bg-[#0b1221] rounded-2xl p-4 border border-white/5 shadow-md">
            {/* Top Row: Date */}
            <div className="mb-2">
                <span className="text-gray-400 text-xs font-medium tracking-wide">
                    {dateString}
                </span>
            </div>

            {/* Separator */}
            <div className="h-px w-full bg-white/10 mb-3" />

            {/* Bottom Row: Content */}
            <div className="flex items-center justify-between">

                {/* Left: Pair & Flags */}
                <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-sm uppercase">
                        {signal.pair}
                    </span>
                    <div className="flex -space-x-1">
                        <span className="text-lg leading-none">{flags.flag1}</span>
                        <span className="text-lg leading-none">{flags.flag2}</span>
                    </div>
                </div>

                {/* Center: Timeframe */}
                <div className="flex-1 text-center">
                    {/* Screenshot shows "1-3 хвилин", matching that style */}
                    <span className="text-gray-500 text-xs font-medium">
                        {signal.timeframe} хв
                    </span>
                </div>

                {/* Right: Result */}
                <div>
                    {resultNode}
                </div>

            </div>
        </div>
    );
}

export default memo(SignalHistoryCard);
