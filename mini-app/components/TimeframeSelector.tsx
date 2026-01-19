'use client';

import { useState, useRef, useEffect } from 'react';
import { TIMEFRAMES } from '@/types';
import { hapticFeedback } from '@/lib/telegram';

interface TimeframeSelectorProps {
    value: number;
    onChange: (timeframe: number) => void;
}

export default function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (timeframe: number) => {
        hapticFeedback.selection();
        onChange(timeframe);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        hapticFeedback.light();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Selected value button */}
            <button
                onClick={toggleDropdown}
                className={`
          w-full h-[52px] flex items-center justify-center gap-1.5
          bg-[#0052cc] rounded-xl
          transition-all duration-200
          ${isOpen ? 'ring-2 ring-white/30' : 'hover:bg-blue-600'}
        `}
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg
                    className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#0052cc]/90 backdrop-blur-md rounded-xl overflow-hidden z-50 min-w-[70px] shadow-xl">
                    {TIMEFRAMES.map((timeframe) => {
                        // Extract number and unit from label (e.g., "5 хв")
                        const label = timeframe.label.replace(' ', '');  // convert "5 хв" to "5хв" for compactness
                        return (
                            <button
                                key={timeframe.value}
                                onClick={() => handleSelect(timeframe.value)}
                                className={`
                  w-full text-center py-2.5 text-sm font-bold text-white
                  border-b border-white/10 last:border-0 hover:bg-white/10
                  ${timeframe.value === value ? 'bg-white/20' : ''}
                `}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
