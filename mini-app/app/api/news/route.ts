import { NextRequest, NextResponse } from 'next/server';
import { MOCK_NEWS, CURRENCY_FLAGS, sortNewsByTime } from '@/lib/news';
import { NewsItem } from '@/types';

// Cache for news data
let newsCache: { data: NewsItem[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/news - Fetch economic calendar news
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const currency = searchParams.get('currency');

        // Check cache
        const now = Date.now();
        if (newsCache && (now - newsCache.timestamp) < CACHE_TTL) {
            let news = newsCache.data;
            if (currency) {
                news = news.filter(n => n.currency === currency);
            }
            return NextResponse.json(sortNewsByTime(news));
        }

        // Try to fetch from external API (Finnhub or similar)
        let newsData: NewsItem[];

        if (process.env.FINNHUB_API_KEY) {
            // Fetch from Finnhub Economic Calendar
            try {
                newsData = await fetchFinnhubCalendar();
            } catch (error) {
                console.error('Finnhub API error:', error);
                newsData = generateMockNews();
            }
        } else {
            // Use mock data
            newsData = generateMockNews();
        }

        // Update cache
        newsCache = { data: newsData, timestamp: now };

        // Filter by currency if specified
        if (currency) {
            newsData = newsData.filter(n => n.currency === currency);
        }

        return NextResponse.json(sortNewsByTime(newsData));
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news' },
            { status: 500 }
        );
    }
}

// Fetch from Finnhub API
async function fetchFinnhubCalendar(): Promise<NewsItem[]> {
    const apiKey = process.env.FINNHUB_API_KEY;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const from = today.toISOString().split('T')[0];
    const to = nextWeek.toISOString().split('T')[0];

    const response = await fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`
    );

    if (!response.ok) {
        throw new Error('Finnhub API error');
    }

    const data = await response.json();

    // Transform Finnhub data to our format
    return (data.economicCalendar || []).map((item: {
        id: string;
        time: string;
        country: string;
        event: string;
        impact: string;
        actual: string;
        estimate: string;
        prev: string;
    }, index: number) => ({
        id: item.id || String(index),
        time: item.time,
        currency: mapCountryToCurrency(item.country),
        flag: CURRENCY_FLAGS[mapCountryToCurrency(item.country)] || '🏳️',
        title: item.event,
        impact: mapImpact(item.impact),
        actual: item.actual || undefined,
        forecast: item.estimate || undefined,
        previous: item.prev || undefined,
    }));
}

// Map country code to currency
function mapCountryToCurrency(country: string): string {
    const mapping: Record<string, string> = {
        'US': 'USD',
        'EU': 'EUR',
        'GB': 'GBP',
        'JP': 'JPY',
        'AU': 'AUD',
        'CA': 'CAD',
        'CH': 'CHF',
        'NZ': 'NZD',
        'CN': 'CNY',
    };
    return mapping[country] || 'USD';
}

// Map impact level
function mapImpact(impact: string): 1 | 2 | 3 {
    switch (impact?.toLowerCase()) {
        case 'high':
            return 3;
        case 'medium':
            return 2;
        default:
            return 1;
    }
}

// Generate mock news with dynamic timestamps
function generateMockNews(): NewsItem[] {
    const now = Date.now();

    return [
        {
            id: '1',
            time: new Date(now + 3600000).toISOString(),
            currency: 'JPY',
            flag: '🇯🇵',
            title: 'Індекс BSI умов бізнесу',
            impact: 2,
            forecast: '7.2',
            previous: '6.8',
        },
        {
            id: '2',
            time: new Date(now + 7200000).toISOString(),
            currency: 'JPY',
            flag: '🇯🇵',
            title: 'Покупки іноземних облігацій',
            impact: 1,
            forecast: '¥1,250B',
            previous: '¥987B',
        },
        {
            id: '3',
            time: new Date(now - 1800000).toISOString(),
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
            time: new Date(now + 10800000).toISOString(),
            currency: 'USD',
            flag: '🇺🇸',
            title: 'Індекс споживчих цін (CPI)',
            impact: 3,
            forecast: '3.2%',
            previous: '3.4%',
        },
        {
            id: '5',
            time: new Date(now - 3600000).toISOString(),
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
            time: new Date(now + 14400000).toISOString(),
            currency: 'USD',
            flag: '🇺🇸',
            title: 'Протокол засідання FOMC',
            impact: 3,
        },
        {
            id: '7',
            time: new Date(now - 7200000).toISOString(),
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
            time: new Date(now + 18000000).toISOString(),
            currency: 'CAD',
            flag: '🇨🇦',
            title: 'Рішення BOC по ставці',
            impact: 3,
            forecast: '5.00%',
            previous: '5.00%',
        },
        {
            id: '9',
            time: new Date(now + 21600000).toISOString(),
            currency: 'EUR',
            flag: '🇪🇺',
            title: 'Промислове виробництво',
            impact: 1,
            forecast: '-0.5%',
            previous: '-0.8%',
        },
        {
            id: '10',
            time: new Date(now - 5400000).toISOString(),
            currency: 'CHF',
            flag: '🇨🇭',
            title: 'Виступ голови SNB',
            impact: 2,
            actual: 'Завершено',
        },
    ];
}
