import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for trading assistant
const SYSTEM_PROMPT = `Ты AI.TRADE Assistant - умный помощник по трейдингу бинарных опционов.

Твои возможности:
📊 Объясняешь торговые стратегии (скальпинг, тренд-трейдинг, контртренд)
📈 Анализируешь рыночные условия и настроения рынка
⚠️ Даёшь советы по управлению рисками и капиталом
🔍 Объясняешь технические индикаторы (RSI, MACD, Bollinger Bands, Moving Averages)
📉 Описываешь графические паттерны (голова-плечи, двойное дно, флаг и т.д.)

Правила ответов:
1. Отвечай коротко и по делу (2-4 предложения)
2. Используй эмодзи для наглядности
3. Давай практические советы
4. Не давай конкретных финансовых рекомендаций
5. Напоминай о рисках при необходимости
6. Отвечай на русском языке

⚠️ Важно: Всегда напоминай, что торговля бинарными опционами несёт высокий риск потери капитала.`;

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

    if (lowerMessage.includes('rsi') || lowerMessage.includes('рси')) {
        return '📊 **RSI (Relative Strength Index)** - индикатор импульса, показывающий перекупленность (>70) или перепроданность (<30) актива.\n\n✅ Сигнал на покупку: RSI < 30 + отскок вверх\n❌ Сигнал на продажу: RSI > 70 + разворот вниз\n\n⚠️ Лучше использовать вместе с другими индикаторами!';
    }

    if (lowerMessage.includes('macd') || lowerMessage.includes('макд')) {
        return '📈 **MACD** - трендовый индикатор, показывающий силу и направление тренда.\n\n✅ Бычий сигнал: MACD пересекает сигнальную линию снизу вверх\n❌ Медвежий сигнал: MACD пересекает сигнальную линию сверху вниз\n\n💡 Ищи дивергенции для более сильных сигналов!';
    }

    if (lowerMessage.includes('стратег') || lowerMessage.includes('strategy')) {
        return '🎯 **Популярные стратегии для бинарных опционов:**\n\n1️⃣ **Тренд-трейдинг** - торгуй в направлении тренда\n2️⃣ **Поддержка/Сопротивление** - входи на отбой от уровней\n3️⃣ **Новостной трейдинг** - торгуй на важных событиях\n\n⚠️ Всегда тестируй стратегию на демо-счёте!';
    }

    if (lowerMessage.includes('риск') || lowerMessage.includes('risk')) {
        return '⚠️ **Управление рисками:**\n\n💰 Рискуй не более 1-2% депозита на сделку\n📊 Веди журнал торговли\n🎯 Устанавливай дневной лимит убытков\n😌 Не торгуй на эмоциях\n\n❗ Помни: сохранение капитала важнее прибыли!';
    }

    // Default response
    return '👋 Привет! Я твой AI-ассистент по трейдингу.\n\n📚 Могу помочь с:\n• Техническими индикаторами (RSI, MACD и др.)\n• Торговыми стратегиями\n• Управлением рисками\n\n💡 Напиши свой вопрос, и я постараюсь помочь!\n\n⚠️ Помни о рисках торговли бинарными опционами.';
}
