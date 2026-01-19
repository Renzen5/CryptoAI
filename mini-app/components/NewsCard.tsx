'use client';

import { memo, useState } from 'react';
import { NewsItem } from '@/types';
import { formatNewsTime, getImpactStars } from '@/lib/news';
import { hapticFeedback } from '@/lib/telegram';

interface NewsCardProps {
    news: NewsItem;
    onSetReminder?: (newsId: string) => void;
}

function NewsCard({ news, onSetReminder }: NewsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { time } = formatNewsTime(news.time);
    const impactStars = getImpactStars(news.impact);

    const handleToggle = () => {
        hapticFeedback.light();
        setIsExpanded(!isExpanded);
    };

    const handleReminder = (e: React.MouseEvent) => {
        e.stopPropagation();
        hapticFeedback.medium();
        onSetReminder?.(news.id);
    };

    return (
        <div
            onClick={handleToggle}
            className="w-full bg-[#0b1221] rounded-2xl overflow-hidden border border-white/5 shadow-md mb-2 cursor-pointer"
        >
            <div className="flex">
                {/* Left Side: Time, Currency, Flag */}
                <div className="w-[80px] flex flex-col items-center justify-center p-3 border-r border-white/5 gap-2">
                    {/* Time Pill */}
                    <div className="bg-[#1e293b] px-2 py-1 rounded text-blue-500 font-bold text-xs">
                        {time}
                    </div>
                    {/* Currency Pill */}
                    <div className="bg-[#1e293b] px-3 py-1 rounded text-white font-bold text-xs">
                        {news.currency}
                    </div>
                    {/* Flag */}
                    <div className="text-2xl mt-1">
                        {news.flag}
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 p-4 flex flex-col justify-center relative">
                    {/* Title */}
                    <h3 className="text-white font-bold text-sm leading-tight pr-6">
                        {news.title}
                    </h3>

                    {/* Dropdown Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg
                            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="bg-[#111a2d] p-4 border-t border-white/5 animate-fadeIn">

                    {/* Data Table */}
                    <div className="bg-[#1a233b]/50 rounded-xl p-3 mb-4 space-y-2">
                        {/* FACT */}
                        <div className="flex justify-between items-center">
                            <span className="text-[#22c55e] font-bold text-sm uppercase">ФАКТ:</span>
                            <span className="text-white font-bold text-sm">{news.actual || '-'}</span>
                        </div>
                        {/* FORECAST */}
                        <div className="flex justify-between items-center">
                            <span className="text-[#3b82f6] font-bold text-sm uppercase">ПРОГНОЗ:</span>
                            <span className="text-white font-bold text-sm">{news.forecast || '-'}</span>
                        </div>
                        {/* PREVIOUS */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-bold text-sm uppercase">ПОПЕР:</span>
                            <span className="text-white font-bold text-sm">{news.previous || '-'}</span>
                        </div>
                    </div>

                    {/* Impact Rating */}
                    <div className="flex gap-1 mb-4 text-yellow-400 text-sm">
                        {impactStars}
                    </div>

                    {/* Notification Button */}
                    <button
                        onClick={handleReminder}
                        className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-center uppercase"
                    >
                        <span>сповіщення</span>
                        <span>🔔</span>
                    </button>

                </div>
            )}
        </div>
    );
}

export default memo(NewsCard);
