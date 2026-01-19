'use client';

interface AccuracyGaugeProps {
    value: number;
}

export default function AccuracyGauge({ value }: AccuracyGaugeProps) {
    // SVG settings for semi-circle
    const radius = 80;
    const stroke = 12; // Thicker stroke
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    // Calculate stroke dash offset for semi-circle (50%)
    // We want to show a portion of the circle.
    // Full circle = circumference
    // We want semi-circle, so we usually map 0-100 to 0 to circumference/2.

    // Actually, let's use a simpler approach for the semi-circle
    // using strokeDasharray to create the arc

    // Total arc length we want is half circle = circumference / 2
    const arcLength = circumference / 2;
    // Value determines how much of that arc is filled
    const valueLength = (value / 100) * arcLength;
    // The rest is empty

    // Rotated to start from left

    return (
        <div className="relative w-64 h-32 flex justify-center overflow-hidden">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[180deg]" // Rotate to have the arc on top
            >
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" /> {/* Purple */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                    </linearGradient>
                </defs>

                {/* Background Track */}
                <circle
                    stroke="#1e293b" // Dark track color
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <circle
                    stroke="url(#gaugeGradient)"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeDasharray={`${valueLength} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Value Text */}
            <div className="absolute bottom-0 flex flex-col items-center justify-end h-full pb-2">
                <span className="text-4xl font-bold text-[#8b5cf6]">
                    {value}%
                </span>
            </div>
        </div>
    );
}
