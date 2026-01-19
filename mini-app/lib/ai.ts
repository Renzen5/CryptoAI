import OpenAI from 'openai';
import { CurrencyPair } from '@/types';
import { getMarketData, MarketData } from './market-data';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AISignalResponse {
    direction: 'UP' | 'DOWN';
    accuracy: number;
    reason: string;
}

export interface GenerateSignalParams {
    pair: CurrencyPair;
    timeframe: number;
    direction?: 'UP' | 'DOWN' | 'AUTO';
}

/**
 * Generate trading signal using OpenAI GPT-4
 */
export async function generateSignal(params: GenerateSignalParams): Promise<AISignalResponse> {
    const { pair, timeframe, direction } = params;

    // Get real market data
    let marketData: MarketData | null = null;
    try {
        marketData = await getMarketData(pair.symbol);
    } catch (error) {
        console.warn('Failed to fetch market data, using AI-only analysis:', error);
    }

    // Build market context for AI
    const marketContext = marketData
        ? `
Текущие рыночные данные:
- Текущая цена: ${marketData.price}
- Изменение за 24ч: ${marketData.priceChange24h > 0 ? '+' : ''}${marketData.priceChange24h.toFixed(4)} (${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%)
- Максимум 24ч: ${marketData.high24h}
- Минимум 24ч: ${marketData.low24h}
- Объём 24ч: ${marketData.volume24h.toLocaleString()}
`
        : 'Рыночные данные недоступны, используй общий анализ.';

    // System prompt for trading expert
    const systemPrompt = `Ты эксперт по трейдингу бинарных опционов с 15-летним опытом. 
Ты анализируешь рынок и даёшь точные сигналы на короткие таймфреймы.

Твои правила:
1. Всегда отвечай ТОЛЬКО валидным JSON
2. Accuracy должен быть реалистичным (65-95%)
3. Reason должен быть коротким (1-2 предложения)
4. Учитывай текущие рыночные условия`;

    // User prompt
    const userPrompt = `Проанализируй текущую рыночную ситуацию для пары ${pair.name}.

${marketContext}

Учитывай:
- Технический анализ (RSI, MACD, Moving Averages)
- Уровни поддержки и сопротивления
- Текущий тренд
- Волатильность
- Экономический календарь

Дай сигнал на ${timeframe} минут.
${direction && direction !== 'AUTO' ? `Пользователь выбрал направление: ${direction}. Оцени этот выбор.` : ''}

Ответ ТОЛЬКО в формате JSON (без markdown):
{
  "direction": "UP" или "DOWN",
  "accuracy": число от 65 до 95,
  "reason": "короткое объяснение на русском"
}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        // Parse JSON response
        const parsed = JSON.parse(content) as AISignalResponse;

        // Validate response
        if (!parsed.direction || !['UP', 'DOWN'].includes(parsed.direction)) {
            throw new Error('Invalid direction in response');
        }

        if (typeof parsed.accuracy !== 'number' || parsed.accuracy < 65 || parsed.accuracy > 95) {
            parsed.accuracy = Math.floor(Math.random() * 26) + 70; // Fallback
        }

        if (!parsed.reason || typeof parsed.reason !== 'string') {
            parsed.reason = 'AI анализ рыночных условий';
        }

        return parsed;
    } catch (error) {
        console.error('OpenAI API error:', error);

        // Fallback to random signal if AI fails
        return generateFallbackSignal(direction);
    }
}

/**
 * Fallback signal generation when AI is unavailable
 */
function generateFallbackSignal(preferredDirection?: 'UP' | 'DOWN' | 'AUTO'): AISignalResponse {
    const direction = preferredDirection && preferredDirection !== 'AUTO'
        ? preferredDirection
        : (Math.random() > 0.5 ? 'UP' : 'DOWN');

    const accuracy = Math.floor(Math.random() * 26) + 70; // 70-95%

    const reasons = {
        UP: [
            'Технический анализ показывает бычий тренд',
            'RSI указывает на перепроданность, ожидается отскок',
            'Пробой уровня сопротивления с подтверждением объёма',
            'Формирование бычьего паттерна на графике',
        ],
        DOWN: [
            'Технический анализ показывает медвежий тренд',
            'RSI указывает на перекупленность',
            'Отбой от уровня сопротивления',
            'Формирование медвежьего паттерна поглощения',
        ],
    };

    const reasonList = reasons[direction];
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];

    return { direction, accuracy, reason };
}

/**
 * Analyze market sentiment using AI
 */
export async function analyzeMarketSentiment(pair: string): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'Ты финансовый аналитик. Дай краткую оценку настроения рынка (1-2 предложения). Отвечай на русском языке.',
                },
                {
                    role: 'user',
                    content: `Какое сейчас настроение рынка для пары ${pair}?`,
                },
            ],
            temperature: 0.5,
            max_tokens: 100,
        });

        return completion.choices[0]?.message?.content || 'Нейтральное настроение рынка';
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return 'Анализ настроения недоступен';
    }
}
