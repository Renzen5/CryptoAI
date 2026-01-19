// Currency pair type
export interface CurrencyPair {
    id: string;
    name: string;
    symbol: string;
    flag1: string; // Emoji flag
    flag2: string; // Emoji flag
}

// Available currency pairs
export const CURRENCY_PAIRS: CurrencyPair[] = [
    { id: 'eurusd', name: 'EUR/USD', symbol: 'EURUSD', flag1: '🇪🇺', flag2: '🇺🇸' },
    { id: 'audusd', name: 'AUD/USD', symbol: 'AUDUSD', flag1: '🇦🇺', flag2: '🇺🇸' },
    { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBPUSD', flag1: '🇬🇧', flag2: '🇺🇸' },
    { id: 'usdjpy', name: 'USD/JPY', symbol: 'USDJPY', flag1: '🇺🇸', flag2: '🇯🇵' },
    { id: 'audjpy', name: 'AUD/JPY', symbol: 'AUDJPY', flag1: '🇦🇺', flag2: '🇯🇵' },
    { id: 'gbpcad', name: 'GBP/CAD', symbol: 'GBPCAD', flag1: '🇬🇧', flag2: '🇨🇦' },
    { id: 'cadjpy', name: 'CAD/JPY', symbol: 'CADJPY', flag1: '🇨🇦', flag2: '🇯🇵' },
    { id: 'eurchf', name: 'EUR/CHF', symbol: 'EURCHF', flag1: '🇪🇺', flag2: '🇨🇭' },
    { id: 'euraud', name: 'EUR/AUD', symbol: 'EURAUD', flag1: '🇪🇺', flag2: '🇦🇺' },
    { id: 'nzdusd', name: 'NZD/USD', symbol: 'NZDUSD', flag1: '🇳🇿', flag2: '🇺🇸' },
];

// Timeframe options (in minutes)
export const TIMEFRAMES = [
    { value: 3, label: '3хв' },
    { value: 5, label: '5хв' },
    { value: 7, label: '7хв' },
    { value: 10, label: '10хв' },
];

// Signal direction
export type SignalDirection = 'UP' | 'DOWN' | 'AUTO';

// Signal result
export type SignalResult = 'WIN' | 'LOSE' | 'NEUTRAL' | 'CANCEL';

// Signal interface
export interface Signal {
    id: string;
    userId: string;
    pair: CurrencyPair;
    direction: 'UP' | 'DOWN';
    timeframe: number;
    accuracy: number;
    entryTime: string;
    expiryTime: string;
    result?: SignalResult;
    aiReason?: string;
    createdAt: string;
}

// User interface
export interface User {
    id: string;
    telegramId: string;
    username?: string;
    firstName?: string;
    isWhitelisted: boolean;
    isAdmin: boolean;
    createdAt: string;
}

// Chat message interface
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

// News item interface
export interface NewsItem {
    id: string;
    time: string;
    currency: string;
    flag: string;
    title: string;
    impact: 1 | 2 | 3; // Star rating
    actual?: string;
    forecast?: string;
    previous?: string;
}

// Language options
export const LANGUAGES = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export type LanguageCode = 'uk' | 'en' | 'ru';
