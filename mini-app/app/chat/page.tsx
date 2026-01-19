'use client';

import { useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useChat } from '@/hooks/useChat';
import { hapticFeedback } from '@/lib/telegram';

export default function ChatPage() {
    const { messages, isLoading, sendMessage } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Add initial greeting if needed, though useChat might handle it
    }, [messages]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputRef.current?.value.trim()) {
            hapticFeedback.light();
            sendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <Layout showHeader={false} showNavigation={true}>

            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-40 pt-safe bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center justify-center h-14">
                    <h1 className="text-2xl font-bold tracking-wide text-white">AI ЧАТ</h1>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col min-h-screen pt-20 pb-32 px-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                            {/* Bot Icon (Only for assistant) */}
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mb-1">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" fill="currentColor" fillOpacity="0.2" />
                                        <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z" fill="currentColor" />
                                    </svg>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div
                                className={`
                  px-5 py-3 rounded-2xl text-[15px] leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-[#2563eb] text-white rounded-tr-sm'
                                        : 'bg-[#1e293b] text-gray-200 rounded-tl-sm'
                                    }
                `}
                            >
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="flex items-end gap-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mb-1">
                                <svg className="w-5 h-5 text-gray-400 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" fill="currentColor" fillOpacity="0.2" />
                                    <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="bg-[#1e293b] px-4 py-3 rounded-2xl rounded-tl-sm text-gray-400 flex gap-1">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">●</span>
                                <span className="animate-bounce delay-200">●</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area */}
            <div className="fixed bottom-[80px] left-0 right-0 px-4 pb-2 z-40 bg-gradient-to-t from-[#0a0e1a] to-transparent pt-4">
                <div className="relative flex items-center w-full max-w-md mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Запитай у штучного інтелекту..."
                        onKeyDown={handleKeyDown}
                        className="w-full bg-[#141b2d] text-white placeholder-gray-500 rounded-full py-4 pl-6 pr-14 border border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all"
                    />
                    <button
                        onClick={() => handleSubmit()}
                        className="absolute right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg active:scale-95"
                    >
                        <svg className="w-5 h-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </Layout>
    );
}
