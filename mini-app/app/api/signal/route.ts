import { NextRequest, NextResponse } from 'next/server';
import { generateSignal } from '@/lib/ai';
import { getMarketData } from '@/lib/market-data';
import { CurrencyPair } from '@/types';

// Signal generation API with AI integration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { pair, timeframe, direction } = body as {
            pair: CurrencyPair;
            timeframe: number;
            direction: 'UP' | 'DOWN' | 'AUTO';
        };

        // Validate input
        if (!pair || !timeframe) {
            return NextResponse.json(
                { error: 'Missing required fields: pair, timeframe' },
                { status: 400 }
            );
        }

        // Check if OpenAI API key is configured
        const useAI = !!process.env.OPENAI_API_KEY;

        let signalData;
        let marketData = null;

        // Try to get market data
        try {
            marketData = await getMarketData(pair.symbol);
        } catch (error) {
            console.warn('Market data unavailable:', error);
        }

        if (useAI) {
            // Generate signal using AI
            console.log('Generating AI signal for', pair.name);
            signalData = await generateSignal({ pair, timeframe, direction });
        } else {
            // Fallback to random generation
            console.log('AI not configured, using random signal');
            signalData = generateRandomSignal(direction);
        }

        // Calculate entry and expiry times
        const now = new Date();
        const entryTime = now.toISOString();
        const expiryTime = new Date(now.getTime() + timeframe * 60 * 1000).toISOString();

        // Generate unique ID
        const signalId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const signal = {
            id: signalId,
            pair,
            direction: signalData.direction,
            timeframe,
            accuracy: signalData.accuracy,
            entryTime,
            expiryTime,
            aiReason: signalData.reason,
            marketData: marketData ? {
                price: marketData.price,
                change24h: marketData.priceChangePercent24h,
            } : null,
            generatedBy: useAI ? 'AI' : 'Random',
        };

        // TODO: Log signal to Supabase when database is configured
        // await logSignalToDatabase(signal);

        console.log('Signal generated:', {
            id: signal.id,
            pair: pair.name,
            direction: signal.direction,
            accuracy: signal.accuracy,
            generatedBy: signal.generatedBy,
        });

        return NextResponse.json(signal);
    } catch (error) {
        console.error('Signal generation error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

// Fallback random signal generator
function generateRandomSignal(preferredDirection?: 'UP' | 'DOWN' | 'AUTO') {
    const direction = preferredDirection && preferredDirection !== 'AUTO'
        ? preferredDirection
        : (Math.random() > 0.5 ? 'UP' : 'DOWN');

    const accuracy = Math.floor(Math.random() * 26) + 70; // 70-95%

    const reasons = {
        UP: [
            'RSI показує перепроданість, очікується відскок',
            'Пробій рівня опору з підтвердженням обсягу',
            'Формування бичачого паттерну на графіку',
            'MACD показує бичачу дивергенцію',
            'Ціна тестує сильний рівень підтримки',
            'Тренд підтверджений ковзними середніми',
        ],
        DOWN: [
            'Формування ведмежого паттерну поглинання',
            'Стохастик показує перекупленість',
            'Відбій від рівня опору',
            'RSI показує перекупленість, очікується корекція',
            'MACD показує ведмежу дивергенцію',
            'Пробій рівня підтримки',
        ],
    };

    const reasonList = reasons[direction];
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];

    return { direction, accuracy, reason };
}

// Get signal history (placeholder)
export async function GET() {
    return NextResponse.json({
        message: 'Signal history endpoint',
        signals: [],
        note: 'Connect Supabase to enable signal history',
    });
}
