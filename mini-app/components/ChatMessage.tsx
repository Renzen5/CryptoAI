'use client';

import { memo } from 'react';

export interface ChatMessageData {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

interface ChatMessageProps {
    message: ChatMessageData;
}

function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={`flex gap-3 animate-fadeIn ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div
                className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isUser
                        ? 'bg-gradient-to-br from-accent to-purple-500'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    }
        `}
            >
                {isUser ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : (
                    <span className="text-lg">🤖</span>
                )}
            </div>

            {/* Message bubble */}
            <div
                className={`
          max-w-[80%] px-4 py-3 rounded-2xl
          ${isUser
                        ? 'bg-accent text-white rounded-br-md'
                        : 'bg-background-card text-foreground rounded-bl-md'
                    }
        `}
            >
                {/* Message content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </div>

                {/* Timestamp */}
                <div
                    className={`
            text-[10px] mt-1 
            ${isUser ? 'text-white/60' : 'text-foreground-muted'}
          `}
                >
                    {message.createdAt.toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(ChatMessage);
