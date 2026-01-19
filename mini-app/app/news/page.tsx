'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import NewsCard from '@/components/NewsCard';
import { NewsItem } from '@/types';
import { fetchNews, sortNewsByTime, getAvailableCurrencies } from '@/lib/news';
import { hapticFeedback } from '@/lib/telegram';

// Available currency filters
const CURRENCY_TABS = ['Всі', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('Всі');
    const [error, setError] = useState<string | null>(null);

    // Fetch news on mount and when filter changes
    useEffect(() => {
        loadNews();
    }, [selectedCurrency]);

    const loadNews = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const currency = selectedCurrency === 'Всі' ? undefined : selectedCurrency;
            const data = await fetchNews(currency);
            setNews(sortNewsByTime(data));
        } catch (err) {
            console.error('Error loading news:', err);
            setError('Не вдалося завантажити новини');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (currency: string) => {
        hapticFeedback.selection();
        setSelectedCurrency(currency);
    };

    const handleSetReminder = (newsId: string) => {
        const newsItem = news.find(n => n.id === newsId);
        if (newsItem) {
            // TODO: Implement actual reminder via Telegram notification
            alert(`Нагадування встановлено для: ${newsItem.title}`);
            hapticFeedback.success();
        }
    };

    // Group news: upcoming first, then past
    const upcomingNews = news.filter(n => new Date(n.time) > new Date());
    const pastNews = news.filter(n => new Date(n.time) <= new Date());

    return (
        <Layout showHeader title="НОВИНИ">
            <div className="flex flex-col h-full">
                {/* Currency Tabs */}
                <div className="px-4 py-3 border-b border-white/5">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {CURRENCY_TABS.map((currency) => (
                            <button
                                key={currency}
                                onClick={() => handleTabChange(currency)}
                                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${selectedCurrency === currency
                                        ? 'bg-accent text-white'
                                        : 'bg-background-card text-foreground-muted hover:text-foreground'
                                    }
                `}
                            >
                                {currency}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News List */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                            <p className="text-foreground-muted mt-4">Завантаження...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-4xl mb-4">❌</div>
                            <p className="text-danger">{error}</p>
                            <button
                                onClick={loadNews}
                                className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm"
                            >
                                Спробувати знову
                            </button>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-6xl mb-4">📰</div>
                            <h3 className="text-lg font-semibold mb-2">Немає новин</h3>
                            <p className="text-foreground-muted text-sm">
                                Для цієї валюти немає подій
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Upcoming Section */}
                            {upcomingNews.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-sm font-semibold text-accent">Очікуються</h3>
                                        <div className="flex-1 h-px bg-accent/30" />
                                        <span className="text-xs text-accent">{upcomingNews.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {upcomingNews.map(item => (
                                            <NewsCard
                                                key={item.id}
                                                news={item}
                                                onSetReminder={handleSetReminder}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Section */}
                            {pastNews.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-3 mt-6">
                                        <h3 className="text-sm font-semibold text-foreground-muted">Минулі</h3>
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-xs text-foreground-muted">{pastNews.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {pastNews.map(item => (
                                            <NewsCard
                                                key={item.id}
                                                news={item}
                                                onSetReminder={handleSetReminder}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Info */}
                {news.length > 0 && (
                    <div className="px-4 py-3 border-t border-white/5">
                        <p className="text-center text-foreground-muted text-xs">
                            {news.length} подій • Оновлено о {new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
