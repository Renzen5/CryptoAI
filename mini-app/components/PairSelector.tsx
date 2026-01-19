'use client';

import { useState, useRef, useEffect } from 'react';
import { CurrencyPair, CURRENCY_PAIRS } from '@/types';
import { hapticFeedback } from '@/lib/telegram';

interface PairSelectorProps {
    value: CurrencyPair;
    onChange: (pair: CurrencyPair) => void;
}

export default function PairSelector({ value, onChange }: PairSelectorProps) {
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

    const handleSelect = (pair: CurrencyPair) => {
        hapticFeedback.selection();
        onChange(pair);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        hapticFeedback.light();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected value button */}
            <button
                onClick={toggleDropdown}
                className={`
          w-full h-[52px] px-3 flex items-center justify-between
          bg-[#0f172a] border border-blue-500/20 rounded-xl
          transition-all duration-200
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : 'hover:bg-[#1e293b]'}
        `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl flex-shrink-0">{value.flag1}{value.flag2}</span>
                    <span className="font-bold text-white text-sm truncate">{value.name}</span>
                </div>
                <svg
                    className={`w-4 h-4 text-white flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-blue-500/20 rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto shadow-xl">
                    {CURRENCY_PAIRS.map((pair) => (
                        <button
                            key={pair.id}
                            onClick={() => handleSelect(pair)}
                            className={`
                w-full text-left px-4 py-3 flex items-center gap-3
                transition-colors border-b border-white/5 last:border-0
                ${pair.id === value.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#1e293b]'}
              `}
                        >
                            <span className="text-xl">{pair.flag1}{pair.flag2}</span>
                            <span className="font-bold text-sm">{pair.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
