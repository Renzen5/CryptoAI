import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for trading assistant
const SYSTEM_PROMPT = `Ти AI.TRADE Assistant - розумний помічник по трейдингу бінарних опціонів.

Твої можливості:
📊 Пояснюєш торгові стратегії (скальпінг, тренд-трейдинг, контртренд)
📈 Аналізуєш ринкові умови та настрій ринку
⚠️ Даєш поради по управлінню ризиками та капіталом
🔍 Пояснюєш технічні індикатори (RSI, MACD, Bollinger Bands, Moving Averages)
📉 Описуєш графічні паттерни (голова-плечі, подвійне дно, прапор тощо)

Правила відповідей:
1. Відповідай коротко і по справі (2-4 речення)
2. Використовуй емодзі для наочності
3. Давай практичні поради
4. Не давай конкретних фінансових рекомендацій
5. Нагадуй про ризики при необхідності
6. Відповідай українською мовою

⚠️ Важливо: Завжди нагадуй, що торгівля бінарними опціонами несе високий ризик втрати капіталу.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid messages format', { status: 400 });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            // Return mock response if no API key
            const mockResponse = getMockResponse(messages[messages.length - 1]?.content || '');
            return new Response(mockResponse, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        // Create streaming response
        const stream = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.slice(-10), // Keep last 10 messages for context
            ],
            temperature: 0.7,
            max_tokens: 500,
            stream: true,
        });

        // Create a readable stream
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}

// Mock responses when API key is not available
function getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('rsi') || lowerMessage.includes('рсі')) {
        return '📊 **RSI (Relative Strength Index)** - індикатор імпульсу, що показує перекупленість (>70) або перепроданість (<30) активу.\n\n✅ Сигнал на покупку: RSI < 30 + відскок вгору\n❌ Сигнал на продаж: RSI > 70 + розворот вниз\n\n⚠️ Краще використовувати разом з іншими індикаторами!';
    }

    if (lowerMessage.includes('macd') || lowerMessage.includes('макд')) {
        return '📈 **MACD** - трендовий індикатор, що показує силу та напрямок тренду.\n\n✅ Бичачий сигнал: MACD перетинає сигнальну лінію знизу вгору\n❌ Ведмежий сигнал: MACD перетинає сигнальну лінію зверху вниз\n\n💡 Шукай дивергенції для сильніших сигналів!';
    }

    if (lowerMessage.includes('стратег') || lowerMessage.includes('strategy')) {
        return '🎯 **Популярні стратегії для бінарних опціонів:**\n\n1️⃣ **Тренд-трейдинг** - торгуй у напрямку тренду\n2️⃣ **Підтримка/Опір** - входь на відбій від рівнів\n3️⃣ **Новинний трейдинг** - торгуй на важливих подіях\n\n⚠️ Завжди тестуй стратегію на демо-рахунку!';
    }

    if (lowerMessage.includes('ризик') || lowerMessage.includes('risk')) {
        return '⚠️ **Управління ризиками:**\n\n💰 Ризикуй не більше 1-2% депозиту на угоду\n📊 Веди журнал торгівлі\n🎯 Встановлюй денний ліміт збитків\n😌 Не торгуй на емоціях\n\n❗ Пам\'ятай: збереження капіталу важливіше за прибуток!';
    }

    // Default response
    return '👋 Привіт! Я твій AI-асистент по трейдингу.\n\n📚 Можу допомогти з:\n• Технічними індикаторами (RSI, MACD, etc.)\n• Торговими стратегіями\n• Управлінням ризиками\n\n💡 Напиши своє питання, і я постараюся допомогти!\n\n⚠️ Пам\'ятай про ризики торгівлі бінарними опціонами.';
}
