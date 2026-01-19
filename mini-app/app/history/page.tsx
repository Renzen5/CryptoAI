'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SignalHistoryCard from '@/components/SignalHistoryCard';
import { DBSignal } from '@/lib/signals';

// Mock data for demonstration (when Supabase is not connected)
const MOCK_SIGNALS: DBSignal[] = [
    {
        id: '1',
        user_id: 'demo',
        pair: 'EUR/USD',
        pair_symbol: 'EURUSD',
        direction: 'UP',
        timeframe: 5,
        accuracy: 87,
        result: 'WIN',
        ai_reason: 'RSI показывает перепроданность',
        entry_price: 1.0856,
        exit_price: 1.0862,
        entry_time: new Date(Date.now() - 3600000).toISOString(),
        expiry_time: new Date(Date.now() - 3300000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '2',
        user_id: 'demo',
        pair: 'GBP/USD',
        pair_symbol: 'GBPUSD',
        direction: 'DOWN',
        timeframe: 3,
        accuracy: 82,
        result: 'LOSE',
        ai_reason: 'Пробой уровня поддержки',
        entry_price: 1.2645,
        exit_price: 1.2652,
        entry_time: new Date(Date.now() - 7200000).toISOString(),
        expiry_time: new Date(Date.now() - 7020000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: '3',
        user_id: 'demo',
        pair: 'USD/JPY',
        pair_symbol: 'USDJPY',
        direction: 'UP',
        timeframe: 5,
        accuracy: 91,
        result: 'WIN',
        ai_reason: 'MACD показывает бычью дивергенцию',
        entry_price: 149.25,
        exit_price: 149.38,
        entry_time: new Date(Date.now() - 86400000).toISOString(),
        expiry_time: new Date(Date.now() - 86100000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        user_id: 'demo',
        pair: 'AUD/USD',
        pair_symbol: 'AUDUSD',
        direction: 'DOWN',
        timeframe: 7,
        accuracy: 78,
        result: 'NEUTRAL',
        ai_reason: 'Боковой тренд',
        entry_price: 0.6542,
        exit_price: 0.6542,
        entry_time: new Date(Date.now() - 90000000).toISOString(),
        expiry_time: new Date(Date.now() - 89580000).toISOString(),
        created_at: new Date(Date.now() - 90000000).toISOString(),
    },
    {
        id: '5',
        user_id: 'demo',
        pair: 'EUR/USD',
        pair_symbol: 'EURUSD',
        direction: 'UP',
        timeframe: 10,
        accuracy: 85,
        result: 'CANCEL',
        ai_reason: 'Сигнал отменён пользователем',
        entry_price: null,
        exit_price: null,
        entry_time: new Date(Date.now() - 172800000).toISOString(),
        expiry_time: new Date(Date.now() - 172200000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
    },
];

// Group signals by date
function groupSignalsByDate(signals: DBSignal[]): Map<string, DBSignal[]> {
    const groups = new Map<string, DBSignal[]>();

    signals.forEach(signal => {
        const date = new Date(signal.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey: string;

        if (date.toDateString() === today.toDateString()) {
            dateKey = 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = 'Вчера';
        } else {
            dateKey = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
            });
        }

        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(signal);
    });

    return groups;
}

export default function HistoryPage() {
    const [signals, setSignals] = useState<DBSignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, winRate: 0 });

    useEffect(() => {
        // Load signals from localStorage or use mock data
        const loadSignals = async () => {
            try {
                // Try to load from localStorage first
                const stored = localStorage.getItem('signal_history');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSignals(parsed);
                    calculateStats(parsed);
                } else {
                    // Use mock data for demo
                    setSignals(MOCK_SIGNALS);
                    calculateStats(MOCK_SIGNALS);
                }
            } catch (error) {
                console.error('Error loading signals:', error);
                setSignals(MOCK_SIGNALS);
                calculateStats(MOCK_SIGNALS);
            } finally {
                setIsLoading(false);
            }
        };

        loadSignals();
    }, []);

    const calculateStats = (signalList: DBSignal[]) => {
        const completed = signalList.filter(s => s.result && s.result !== 'CANCEL');
        const wins = completed.filter(s => s.result === 'WIN').length;
        const losses = completed.filter(s => s.result === 'LOSE').length;
        const total = completed.length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        setStats({ total, wins, losses, winRate });
    };

    const groupedSignals = groupSignalsByDate(signals);

    return (
        <Layout showHeader title="ИСТОРИЯ СДЕЛОК">
            <div className="px-4 py-4">
                {/* Signals List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="text-foreground-muted mt-4">Загрузка...</p>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold mb-2">История пуста</h3>
                        <p className="text-foreground-muted text-sm">
                            Ваши сигналы будут отображаться здесь
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Array.from(groupedSignals.entries()).map(([date, dateSignals]) => (
                            <div key={date}>
                                {/* Date Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-sm font-semibold text-foreground-muted">{date}</h3>
                                    <div className="flex-1 h-px bg-white/10" />
                                    <span className="text-xs text-foreground-muted">{dateSignals.length}</span>
                                </div>

                                {/* Signals for this date */}
                                <div className="space-y-2">
                                    {dateSignals.map(signal => (
                                        <SignalHistoryCard key={signal.id} signal={signal} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info note */}
                {signals.length > 0 && (
                    <p className="text-center text-foreground-muted text-xs mt-6 opacity-60">
                        Показано последних {signals.length} сигналов
                    </p>
                )}
            </div>
        </Layout>
    );
}
