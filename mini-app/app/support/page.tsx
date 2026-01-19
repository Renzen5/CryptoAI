'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { openTelegramLink, hapticFeedback } from '@/lib/telegram';

// FAQ items
const FAQ_ITEMS = [
    {
        id: '1',
        question: 'Як працюють сигнали?',
        answer: 'AI аналізує ринкові дані, технічні індикатори та новини в реальному часі. На основі цього аналізу система генерує торгові сигнали з прогнозованим напрямком (Вгору/Вниз) та точністю.',
    },
    {
        id: '2',
        question: 'Яка точність сигналів?',
        answer: 'Середня точність сигналів становить 75-85%. Точність залежить від ринкових умов та обраного таймфрейму. AI постійно навчається для покращення результатів.',
    },
    {
        id: '3',
        question: 'Як почати торгувати?',
        answer: '1. Оберіть валютну пару\n2. Виберіть таймфрейм (3-10 хвилин)\n3. Натисніть "Отримати новий сигнал"\n4. Відкрийте угоду у вашому брокері згідно з сигналом',
    },
    {
        id: '4',
        question: 'Чи безпечно це?',
        answer: 'Торгівля бінарними опціонами завжди несе ризик. Ми рекомендуємо торгувати лише тими коштами, які ви готові втратити. Ніколи не ризикуйте більше 1-2% депозиту на одну угоду.',
    },
    {
        id: '5',
        question: 'Як отримати доступ?',
        answer: 'Для отримання доступу до сигналів зверніться до адміністратора через кнопку підтримки нижче. Після перевірки вас буде додано до whitelist.',
    },
];

// FAQ Accordion Item
function FAQItem({
    question,
    answer,
    isOpen,
    onToggle
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="card overflow-hidden">
            <button
                onClick={() => {
                    hapticFeedback.light();
                    onToggle();
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-background-secondary transition-colors"
            >
                <span className="font-medium pr-4">{question}</span>
                <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 animate-fadeIn">
                    <p className="text-sm text-foreground-muted whitespace-pre-line leading-relaxed">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SupportPage() {
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);

    const handleContactSupport = () => {
        hapticFeedback.medium();

        // Replace with your actual support username
        const supportUsername = 'ai_trade_support';

        // Try Telegram WebApp method first
        try {
            openTelegramLink(`https://t.me/${supportUsername}`);
        } catch {
            // Fallback to regular link
            window.open(`https://t.me/${supportUsername}`, '_blank');
        }
    };

    const toggleFAQ = (id: string) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    return (
        <Layout showHeader title="ПІДТРИМКА">
            <div className="px-4 py-6">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    {/* Headphones Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h0a3 3 0 003-3v-3a3 3 0 00-3-3h0a3 3 0 00-3 3v3zM21 18a3 3 0 01-3 3h0a3 3 0 01-3-3v-3a3 3 0 013-3h0a3 3 0 013 3v3z" />
                        </svg>
                    </div>

                    <h2 className="text-xl font-semibold mb-2">
                        Маєш питання чи труднощі?
                    </h2>
                    <p className="text-foreground-muted mb-6">
                        Наша команда підтримки готова допомогти 24/7
                    </p>

                    {/* Contact Button */}
                    <button
                        onClick={handleContactSupport}
                        className="btn btn-primary w-full py-4 text-lg font-bold hover:scale-[1.02] transition-transform"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                            </svg>
                            НАПИСАТИ В ПІДТРИМКУ
                        </span>
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-foreground-muted text-sm">FAQ</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* FAQ Section */}
                <div className="space-y-2">
                    {FAQ_ITEMS.map((item) => (
                        <FAQItem
                            key={item.id}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openFAQ === item.id}
                            onToggle={() => toggleFAQ(item.id)}
                        />
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 rounded-xl bg-background-card/50 border border-white/5 text-center">
                    <p className="text-foreground-muted text-sm">
                        📧 Email: support@ai-trade.app
                    </p>
                    <p className="text-foreground-muted text-xs mt-2 opacity-60">
                        Відповідь зазвичай протягом 24 годин
                    </p>
                </div>
            </div>
        </Layout>
    );
}
