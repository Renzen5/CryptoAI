/**
 * Market data fetching from Binance API (public endpoints)
 */

export interface MarketData {
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    timestamp: number;
}

// Map our pair symbols to Binance format
const PAIR_MAPPING: Record<string, string> = {
    'EURUSD': 'EURUSDT', // Binance doesn't have forex pairs, we'll use approximations
    'AUDUSD': 'AUDUSDT',
    'GBPUSD': 'GBPUSDT',
    'USDJPY': 'USDTJPY', // Note: May need adjustment
    'AUDJPY': 'AUDJPY',
    'GBPCAD': 'GBPCAD',
    'CADJPY': 'CADJPY',
    'EURCHF': 'EURCHF',
    'EURAUD': 'EURAUD',
    'NZDUSD': 'NZDUSDT',
};

// Alternative: Use crypto pairs that are available on Binance
const CRYPTO_FALLBACK: Record<string, string> = {
    'EURUSD': 'BTCUSDT',
    'AUDUSD': 'ETHUSDT',
    'GBPUSD': 'BNBUSDT',
    'USDJPY': 'XRPUSDT',
    'AUDJPY': 'ADAUSDT',
    'GBPCAD': 'SOLUSDT',
    'CADJPY': 'DOTUSDT',
    'EURCHF': 'MATICUSDT',
    'EURAUD': 'AVAXUSDT',
    'NZDUSD': 'LINKUSDT',
};

/**
 * Fetch market data from Binance API
 */
export async function getMarketData(symbol: string): Promise<MarketData> {
    // Use crypto fallback for demonstration
    const binanceSymbol = CRYPTO_FALLBACK[symbol] || 'BTCUSDT';

    try {
        // Fetch 24hr ticker data
        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 30 }, // Cache for 30 seconds
            }
        );

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            symbol: symbol,
            price: parseFloat(data.lastPrice),
            priceChange24h: parseFloat(data.priceChange),
            priceChangePercent24h: parseFloat(data.priceChangePercent),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            volume24h: parseFloat(data.volume),
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
}

/**
 * Get current price only (lighter API call)
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
    const binanceSymbol = CRYPTO_FALLBACK[symbol] || 'BTCUSDT';

    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
            {
                next: { revalidate: 5 }, // Cache for 5 seconds
            }
        );

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error('Error fetching price:', error);
        throw error;
    }
}

/**
 * Get klines/candlestick data for technical analysis
 */
export interface Kline {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
}

export async function getKlines(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '1h' = '5m',
    limit: number = 50
): Promise<Kline[]> {
    const binanceSymbol = CRYPTO_FALLBACK[symbol] || 'BTCUSDT';

    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`,
            {
                next: { revalidate: 60 }, // Cache for 1 minute
            }
        );

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();

        return data.map((k: number[]) => ({
            openTime: k[0],
            open: parseFloat(k[1] as unknown as string),
            high: parseFloat(k[2] as unknown as string),
            low: parseFloat(k[3] as unknown as string),
            close: parseFloat(k[4] as unknown as string),
            volume: parseFloat(k[5] as unknown as string),
            closeTime: k[6],
        }));
    } catch (error) {
        console.error('Error fetching klines:', error);
        throw error;
    }
}

/**
 * Calculate simple technical indicators
 */
export function calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) {
        return 50; // Default neutral
    }

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

export function calculateSMA(closes: number[], period: number): number {
    if (closes.length < period) {
        return closes[closes.length - 1] || 0;
    }

    const slice = closes.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Determine trend based on moving averages
 */
export function determineTrend(closes: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const currentPrice = closes[closes.length - 1];

    if (currentPrice > sma20 && sma20 > sma50) {
        return 'BULLISH';
    } else if (currentPrice < sma20 && sma20 < sma50) {
        return 'BEARISH';
    }
    return 'NEUTRAL';
}
