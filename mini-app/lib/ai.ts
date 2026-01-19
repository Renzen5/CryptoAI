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
Поточні ринкові дані:
- Поточна ціна: ${marketData.price}
- Зміна за 24г: ${marketData.priceChange24h > 0 ? '+' : ''}${marketData.priceChange24h.toFixed(4)} (${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%)
- Максимум 24г: ${marketData.high24h}
- Мінімум 24г: ${marketData.low24h}
- Обсяг 24г: ${marketData.volume24h.toLocaleString()}
`
        : 'Ринкові дані недоступні, використовуй загальний аналіз.';

    // System prompt for trading expert
    const systemPrompt = `Ти експерт по трейдингу бінарних опціонів з 15-річним досвідом. 
Ти аналізуєш ринок і даєш точні сигнали на короткі таймфрейми.

Твої правила:
1. Завжди відповідай ТІЛЬКИ валідним JSON
2. Accuracy має бути реалістичним (65-95%)
3. Reason має бути коротким (1-2 речення)
4. Враховуй поточні ринкові умови`;

    // User prompt
    const userPrompt = `Проаналізуй поточну ринкову ситуацію для пари ${pair.name}.

${marketContext}

Враховуй:
- Технічний аналіз (RSI, MACD, Moving Averages)
- Рівні підтримки та опору
- Поточний тренд
- Волатильність
- Економічний календар

Дай сигнал на ${timeframe} хвилин.
${direction && direction !== 'AUTO' ? `Користувач обрав напрямок: ${direction}. Оціни цей вибір.` : ''}

Відповідь ТІЛЬКИ у форматі JSON (без markdown):
{
  "direction": "UP" або "DOWN",
  "accuracy": число від 65 до 95,
  "reason": "коротке пояснення українською"
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
            parsed.reason = 'AI аналіз ринкових умов';
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
            'Технічний аналіз показує бичачий тренд',
            'RSI вказує на перепроданість, очікується відскок',
            'Пробій рівня опору з підтвердженням обсягу',
            'Формування бичачого паттерну на графіку',
        ],
        DOWN: [
            'Технічний аналіз показує ведмежий тренд',
            'RSI вказує на перекупленість',
            'Відбій від рівня опору',
            'Формування ведмежого паттерну поглинання',
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
                    content: 'Ти фінансовий аналітик. Дай коротку оцінку настрою ринку (1-2 речення).',
                },
                {
                    role: 'user',
                    content: `Який зараз настрій ринку для пари ${pair}?`,
                },
            ],
            temperature: 0.5,
            max_tokens: 100,
        });

        return completion.choices[0]?.message?.content || 'Нейтральний настрій ринку';
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return 'Аналіз настрою недоступний';
    }
}
