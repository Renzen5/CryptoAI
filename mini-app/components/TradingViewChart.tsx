'use client';

import { useEffect, useRef, memo } from 'react';

// TradingView symbol mapping
export const TRADINGVIEW_SYMBOLS: Record<string, string> = {
    'EURUSD': 'OANDA:EURUSD',
    'EUR/USD': 'OANDA:EURUSD',
    'AUDUSD': 'OANDA:AUDUSD',
    'AUD/USD': 'OANDA:AUDUSD',
    'GBPUSD': 'OANDA:GBPUSD',
    'GBP/USD': 'OANDA:GBPUSD',
    'USDJPY': 'OANDA:USDJPY',
    'USD/JPY': 'OANDA:USDJPY',
    'AUDJPY': 'OANDA:AUDJPY',
    'AUD/JPY': 'OANDA:AUDJPY',
    'GBPCAD': 'OANDA:GBPCAD',
    'GBP/CAD': 'OANDA:GBPCAD',
    'CADJPY': 'OANDA:CADJPY',
    'CAD/JPY': 'OANDA:CADJPY',
    'EURCHF': 'OANDA:EURCHF',
    'EUR/CHF': 'OANDA:EURCHF',
    'EURAUD': 'OANDA:EURAUD',
    'EUR/AUD': 'OANDA:EURAUD',
    'NZDUSD': 'OANDA:NZDUSD',
    'NZD/USD': 'OANDA:NZDUSD',
};

// Interval mapping
export const TRADINGVIEW_INTERVALS: Record<string, string> = {
    '1': '1',
    '3': '3',
    '5': '5',
    '7': '5', // TradingView doesn't have 7min, use 5
    '10': '15', // Use 15min for 10
    '15': '15',
    '30': '30',
    '60': '60',
    '1h': '60',
    '4h': '240',
    'D': 'D',
};

interface TradingViewChartProps {
    symbol: string;
    interval?: string;
    height?: number | string;
    autosize?: boolean;
}

function TradingViewChart({
    symbol,
    interval = '5',
    height = 400,
    autosize = false,
}: TradingViewChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    // Get TradingView symbol
    const tvSymbol = TRADINGVIEW_SYMBOLS[symbol] || TRADINGVIEW_SYMBOLS['EURUSD'];
    const tvInterval = TRADINGVIEW_INTERVALS[interval] || '5';

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container';
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';

        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.height = 'calc(100%)';
        widgetDiv.style.width = '100%';
        widgetContainer.appendChild(widgetDiv);

        containerRef.current.appendChild(widgetContainer);

        // Create and load TradingView script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: autosize,
            symbol: tvSymbol,
            interval: tvInterval,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1', // Candlestick
            locale: 'uk',
            backgroundColor: 'rgba(10, 14, 26, 1)',
            gridColor: 'rgba(255, 255, 255, 0.06)',
            hide_top_toolbar: false,
            hide_legend: false,
            hide_side_toolbar: true,
            allow_symbol_change: false,
            save_image: false,
            calendar: false,
            support_host: 'https://www.tradingview.com',
            container_id: 'tradingview-widget',
            withdateranges: false,
            enable_publishing: false,
            hide_volume: true,
        });

        widgetContainer.appendChild(script);
        scriptRef.current = script;

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [tvSymbol, tvInterval, autosize]);

    return (
        <div
            ref={containerRef}
            style={{
                height: autosize ? '100%' : height,
                width: '100%',
                backgroundColor: '#0a0e1a',
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        />
    );
}

export default memo(TradingViewChart);
