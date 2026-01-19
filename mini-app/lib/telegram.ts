'use client';

// Telegram Web App types
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        query_id?: string;
        user?: TelegramUser;
        auth_date?: number;
        hash?: string;
    };
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
    };
    BackButton: {
        isVisible: boolean;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
    close: () => void;
    expand: () => void;
    ready: () => void;
    openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
    openTelegramLink: (url: string) => void;
    showPopup: (params: {
        title?: string;
        message: string;
        buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
        }>;
    }, callback?: (buttonId: string) => void) => void;
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

// Get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp;
    }
    return null;
};

// Get current user from Telegram
export const getTelegramUser = (): TelegramUser | null => {
    const webApp = getTelegramWebApp();
    return webApp?.initDataUnsafe?.user || null;
};

// Initialize Telegram WebApp
export const initTelegramWebApp = () => {
    const webApp = getTelegramWebApp();
    if (webApp) {
        webApp.ready();
        webApp.expand();
    }
};

// Haptic feedback helpers
export const hapticFeedback = {
    light: () => getTelegramWebApp()?.HapticFeedback.impactOccurred('light'),
    medium: () => getTelegramWebApp()?.HapticFeedback.impactOccurred('medium'),
    heavy: () => getTelegramWebApp()?.HapticFeedback.impactOccurred('heavy'),
    success: () => getTelegramWebApp()?.HapticFeedback.notificationOccurred('success'),
    error: () => getTelegramWebApp()?.HapticFeedback.notificationOccurred('error'),
    warning: () => getTelegramWebApp()?.HapticFeedback.notificationOccurred('warning'),
    selection: () => getTelegramWebApp()?.HapticFeedback.selectionChanged(),
};

// Open Telegram link (for support, etc.)
export const openTelegramLink = (username: string) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
        webApp.openTelegramLink(`https://t.me/${username}`);
    } else {
        window.open(`https://t.me/${username}`, '_blank');
    }
};
