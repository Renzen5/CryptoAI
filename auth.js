// Telegram WebApp Auth System for AI.BOOST
// Only allows access from Telegram Mini App + whitelist check

(function () {
    let telegramUser = null;
    let isWhitelisted = false;
    let isInitialized = false;

    // Check if running inside Telegram WebApp
    function isInTelegram() {
        return window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
    }

    // Get Telegram user data
    function getTelegramUser() {
        if (!isInTelegram()) return null;
        return window.Telegram.WebApp.initDataUnsafe.user;
    }

    // Check if user is in whitelist
    async function checkWhitelist(telegramId) {
        const supabase = window.SupabaseClient ? window.SupabaseClient.get() : null;
        if (!supabase) {
            console.error('Supabase not initialized');
            return false;
        }

        try {
            const { data, error } = await supabase
                .from('telegram_whitelist')
                .select('id, is_active')
                .eq('telegram_id', telegramId)
                .single();

            if (error || !data) return false;
            return data.is_active === true;
        } catch (e) {
            console.error('Whitelist check error:', e);
            return false;
        }
    }

    // Save/update user profile in database
    async function saveUserProfile(user) {
        const supabase = window.SupabaseClient ? window.SupabaseClient.get() : null;
        if (!supabase) return;

        try {
            await supabase.from('telegram_whitelist').upsert({
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name || null,
                last_name: user.last_name || null
            }, { onConflict: 'telegram_id' });
        } catch (e) {
            console.error('Profile save error:', e);
        }
    }

    // Show access denied screen
    function showAccessDenied(reason) {
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(180deg, #0A0A0F 0%, #1a1a2e 100%);
                color: white;
                font-family: 'Inter', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">⛔</div>
                <h1 style="font-size: 24px; margin-bottom: 10px;">Доступ запрещён</h1>
                <p style="color: #888; font-size: 14px; max-width: 300px;">${reason}</p>
                ${telegramUser ? `<p style="color: #666; font-size: 12px; margin-top: 20px;">Ваш ID: <code style="background: #333; padding: 2px 8px; border-radius: 4px;">${telegramUser.id}</code></p>` : ''}
            </div>
        `;
    }

    // Initialize auth check
    async function initAuth() {
        if (isInitialized) return { success: isWhitelisted, user: telegramUser };
        isInitialized = true;

        // Check if in Telegram
        if (!isInTelegram()) {
            showAccessDenied('Это приложение доступно только через Telegram.');
            return { success: false, user: null };
        }

        // Get user data
        telegramUser = getTelegramUser();
        if (!telegramUser || !telegramUser.id) {
            showAccessDenied('Не удалось получить данные пользователя.');
            return { success: false, user: null };
        }

        console.log('Telegram user:', telegramUser);

        // Check whitelist
        isWhitelisted = await checkWhitelist(telegramUser.id);
        if (!isWhitelisted) {
            showAccessDenied('Ваш аккаунт не активирован. Обратитесь к администратору.');
            return { success: false, user: telegramUser };
        }

        // Save/update profile
        await saveUserProfile(telegramUser);

        // Expand WebApp
        if (window.Telegram.WebApp.expand) {
            window.Telegram.WebApp.expand();
        }

        // Update UI
        updateUI(true);

        return { success: true, user: telegramUser };
    }

    // Update UI based on auth state
    function updateUI(loggedIn) {
        if (loggedIn) {
            document.body.classList.add('logged-in');
            document.body.classList.remove('logged-out');
        } else {
            document.body.classList.add('logged-out');
            document.body.classList.remove('logged-in');
        }
    }

    // Get current user
    function getCurrentUser() {
        return telegramUser;
    }

    // Check if logged in
    function isLoggedIn() {
        return isWhitelisted && telegramUser !== null;
    }

    // Protect page - run auth check
    async function protectPage() {
        const result = await initAuth();
        return result.success;
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        // Small delay to ensure Telegram WebApp is ready
        setTimeout(() => {
            initAuth();
        }, 100);
    });

    // Expose functions globally
    window.Auth = {
        init: initAuth,
        isLoggedIn: isLoggedIn,
        getCurrentUser: getCurrentUser,
        getTelegramUser: getTelegramUser,
        isInTelegram: isInTelegram,
        protectPage: protectPage,
        updateUI: updateUI,

        // Legacy compatibility (do nothing)
        signUp: async () => ({ success: false, error: 'Use Telegram' }),
        signIn: async () => ({ success: false, error: 'Use Telegram' }),
        signOut: async () => { window.Telegram?.WebApp?.close(); },
        verify: async () => ({ success: false, error: 'Use Telegram' })
    };
})();
