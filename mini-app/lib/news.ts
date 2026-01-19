import { NewsItem } from '@/types';

// Currency flags mapping
export const CURRENCY_FLAGS: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    CHF: '🇨🇭',
    NZD: '🇳🇿',
    CNY: '🇨🇳',
};

// Mock news data for demonstration
export const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        currency: 'JPY',
        flag: '🇯🇵',
        title: 'Індекс BSI умов бізнесу',
        impact: 2,
        actual: undefined,
        forecast: '7.2',
        previous: '6.8',
    },
    {
        id: '2',
        time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        currency: 'JPY',
        flag: '🇯🇵',
        title: 'Покупки іноземних облігацій',
        impact: 1,
        actual: undefined,
        forecast: '¥1,250B',
        previous: '¥987B',
    },
    {
        id: '3',
        time: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        currency: 'EUR',
        flag: '🇪🇺',
        title: 'Ставка депозитів ЄЦБ',
        impact: 3,
        actual: '4.00%',
        forecast: '4.00%',
        previous: '3.75%',
    },
    {
        id: '4',
        time: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
        currency: 'USD',
        flag: '🇺🇸',
        title: 'Індекс споживчих цін (CPI)',
        impact: 3,
        actual: undefined,
        forecast: '3.2%',
        previous: '3.4%',
    },
    {
        id: '5',
        time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        currency: 'GBP',
        flag: '🇬🇧',
        title: 'Рівень безробіття',
        impact: 2,
        actual: '4.2%',
        forecast: '4.3%',
        previous: '4.3%',
    },
    {
        id: '6',
        time: new Date(Date.now() + 14400000).toISOString(), // 4 hours from now
        currency: 'USD',
        flag: '🇺🇸',
        title: 'Протокол засідання FOMC',
        impact: 3,
        actual: undefined,
        forecast: undefined,
        previous: undefined,
    },
    {
        id: '7',
        time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        currency: 'AUD',
        flag: '🇦🇺',
        title: 'Зміна зайнятості',
        impact: 2,
        actual: '+32.5K',
        forecast: '+25.0K',
        previous: '+14.6K',
    },
    {
        id: '8',
        time: new Date(Date.now() + 18000000).toISOString(), // 5 hours from now
        currency: 'CAD',
        flag: '🇨🇦',
        title: 'Рішення BOC по ставці',
        impact: 3,
        actual: undefined,
        forecast: '5.00%',
        previous: '5.00%',
    },
    {
        id: '9',
        time: new Date(Date.now() + 21600000).toISOString(), // 6 hours from now
        currency: 'EUR',
        flag: '🇪🇺',
        title: 'Промислове виробництво',
        impact: 1,
        actual: undefined,
        forecast: '-0.5%',
        previous: '-0.8%',
    },
    {
        id: '10',
        time: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        currency: 'CHF',
        flag: '🇨🇭',
        title: 'Виступ голови SNB',
        impact: 2,
        actual: 'Завершено',
        forecast: undefined,
        previous: undefined,
    },
];

/**
 * Fetch news from API or return mock data
 */
export async function fetchNews(currency?: string): Promise<NewsItem[]> {
    try {
        const url = currency
            ? `/api/news?currency=${currency}`
            : '/api/news';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching news:', error);
        // Return filtered mock data as fallback
        let news = [...MOCK_NEWS];
        if (currency) {
            news = news.filter(n => n.currency === currency);
        }
        return news;
    }
}

/**
 * Format news time for display
 */
export function formatNewsTime(isoTime: string): { time: string; relative: string; isPast: boolean } {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const isPast = diffMs < 0;

    const time = date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
    });

    let relative: string;

    if (Math.abs(diffMins) < 1) {
        relative = 'Зараз';
    } else if (Math.abs(diffMins) < 60) {
        relative = isPast
            ? `${Math.abs(diffMins)} хв тому`
            : `Через ${diffMins} хв`;
    } else {
        const hours = Math.abs(Math.round(diffMins / 60));
        relative = isPast
            ? `${hours} год тому`
            : `Через ${hours} год`;
    }

    return { time, relative, isPast };
}

/**
 * Get impact stars
 */
export function getImpactStars(impact: 1 | 2 | 3): string {
    return '⭐'.repeat(impact) + '☆'.repeat(3 - impact);
}

/**
 * Sort news by time
 */
export function sortNewsByTime(news: NewsItem[]): NewsItem[] {
    return [...news].sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
    });
}

/**
 * Get available currencies from news
 */
export function getAvailableCurrencies(news: NewsItem[]): string[] {
    const currencies = new Set(news.map(n => n.currency));
    return Array.from(currencies).sort();
}
