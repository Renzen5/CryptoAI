'use client';

import { SignalDirection } from '@/types';
import { hapticFeedback } from '@/lib/telegram';

interface DirectionButtonsProps {
    value: SignalDirection;
    onChange: (direction: SignalDirection) => void;
}

export default function DirectionButtons({ value, onChange }: DirectionButtonsProps) {
    const handleSelect = (direction: SignalDirection) => {
        hapticFeedback.medium();
        onChange(direction);
    };

    return (
        <div className="flex gap-2">
            {/* UP Button */}
            <button
                onClick={() => handleSelect('UP')}
                className={`
          flex-1 py-4 rounded-xl font-bold text-lg
          transition-all duration-200 
          flex items-center justify-center gap-2
          ${value === 'UP'
                        ? 'bg-success text-white shadow-lg shadow-success/30 scale-105'
                        : 'bg-background-card text-success hover:bg-success/20 border border-success/30'
                    }
        `}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
                <span>UP</span>
            </button>

            {/* AUTO Button */}
            <button
                onClick={() => handleSelect('AUTO')}
                className={`
          flex-1 py-4 rounded-xl font-bold text-lg
          transition-all duration-200
          flex items-center justify-center
          ${value === 'AUTO'
                        ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-105'
                        : 'bg-background-card text-accent hover:bg-accent/20 border border-accent/30'
                    }
        `}
            >
                <span>AUTO</span>
            </button>

            {/* DOWN Button */}
            <button
                onClick={() => handleSelect('DOWN')}
                className={`
          flex-1 py-4 rounded-xl font-bold text-lg
          transition-all duration-200
          flex items-center justify-center gap-2
          ${value === 'DOWN'
                        ? 'bg-danger text-white shadow-lg shadow-danger/30 scale-105'
                        : 'bg-background-card text-danger hover:bg-danger/20 border border-danger/30'
                    }
        `}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
                <span>DOWN</span>
            </button>
        </div>
    );
}
