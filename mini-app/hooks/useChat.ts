'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessageData } from '@/components/ChatMessage';
import { hapticFeedback } from '@/lib/telegram';

interface UseChatOptions {
    initialMessages?: ChatMessageData[];
}

export function useChat(options: UseChatOptions = {}) {
    const { initialMessages = [] } = options;

    const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Generate unique ID
    const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send message to AI
    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        setError(null);
        hapticFeedback.light();

        // Add user message
        const userMessage: ChatMessageData = {
            id: generateId(),
            role: 'user',
            content: content.trim(),
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Create placeholder for assistant message
        const assistantMessageId = generateId();
        const assistantMessage: ChatMessageData = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        try {
            // Create abort controller for cancellation
            abortControllerRef.current = new AbortController();

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullContent += chunk;

                    // Update assistant message with streaming content
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === assistantMessageId
                                ? { ...m, content: fullContent }
                                : m
                        )
                    );
                }
            }

            hapticFeedback.success();
        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Chat error:', err);
                setError('Не вдалося отримати відповідь. Спробуйте ще раз.');
                hapticFeedback.error();

                // Remove the empty assistant message on error
                setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [messages, isLoading]);

    // Cancel current request
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Clear chat history
    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
        hapticFeedback.medium();
    }, []);

    // Add welcome message
    const addWelcomeMessage = useCallback(() => {
        const welcomeMessage: ChatMessageData = {
            id: generateId(),
            role: 'assistant',
            content: 'Привіт! 👋 Я твій розумний трейдинг-асистент. Запитай мене щось!\n\n📊 Можу допомогти з:\n• Аналізом ринкових умов\n• Поясненням індикаторів\n• Стратегіями торгівлі\n• Управлінням ризиками',
            createdAt: new Date(),
        };
        setMessages([welcomeMessage]);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        cancelRequest,
        clearMessages,
        addWelcomeMessage,
    };
}
