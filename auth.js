// Auth System for AI.BOOST
// 1. Check Telegram whitelist for access
// 2. Use Supabase Auth (email/password) for account
// 3. Use Telegram CloudStorage for session persistence (fixes iOS)

(function () {
    let currentUser = null;
    let telegramUser = null;
    let hasWhitelistAccess = false;

    // ========== TELEGRAM CLOUD STORAGE (fixes iOS localStorage issue) ==========
    // iOS WebView clears localStorage on Telegram restart, so we use CloudStorage

    function cloudStorageAvailable() {
        return window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.CloudStorage;
    }

    // Promise wrapper for CloudStorage.getItem
    function cloudGet(key) {
        return new Promise((resolve) => {
            if (!cloudStorageAvailable()) {
                // Fallback to localStorage
                const value = localStorage.getItem(key);
                resolve(value);
                return;
            }
            window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    console.warn('CloudStorage get error:', error);
                    // Fallback to localStorage
                    resolve(localStorage.getItem(key));
                } else {
                    resolve(value || null);
                }
            });
        });
    }

    // Promise wrapper for CloudStorage.setItem
    function cloudSet(key, value) {
        return new Promise((resolve) => {
            // Always save to localStorage as backup
            localStorage.setItem(key, value);

            if (!cloudStorageAvailable()) {
                resolve(true);
                return;
            }
            window.Telegram.WebApp.CloudStorage.setItem(key, value, (error) => {
                if (error) {
                    console.warn('CloudStorage set error:', error);
                }
                resolve(!error);
            });
        });
    }

    // Promise wrapper for CloudStorage.removeItem
    function cloudRemove(key) {
        return new Promise((resolve) => {
            localStorage.removeItem(key);

            if (!cloudStorageAvailable()) {
                resolve(true);
                return;
            }
            window.Telegram.WebApp.CloudStorage.removeItem(key, (error) => {
                if (error) {
                    console.warn('CloudStorage remove error:', error);
                }
                resolve(!error);
            });
        });
    }

    // ========== DEV MODE (Bypass) ==========
    let isDevMode = localStorage.getItem('dev_mode') === 'true';

    window.enableDevMode = function () {
        localStorage.setItem('dev_mode', 'true');
        isDevMode = true;
        console.log('✅ DEV MODE ENABLED! Reloading...');
        location.reload();
    };

    window.disableDevMode = function () {
        localStorage.removeItem('dev_mode');
        isDevMode = false;
        console.log('🚫 DEV MODE DISABLED! Reloading...');
        location.reload();
    };

    // Check if running inside Telegram WebApp
    function isInTelegram() {
        return window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user;
    }

    // Get Telegram user data
    function getTelegramUser() {
        if (!isInTelegram()) return null;
        return window.Telegram.WebApp.initDataUnsafe.user;
    }

    // Check if Telegram user is in whitelist
    async function checkWhitelist(telegramId) {
        const supabase = window.SupabaseClient ? window.SupabaseClient.get() : null;
        if (!supabase) return false;

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

    // Show access denied screen (not in whitelist or not from Telegram)
    function showAccessDenied(reason) {
        const telegramId = telegramUser ? telegramUser.id : 'N/A';
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
                <p style="color: #666; font-size: 12px; margin-top: 20px;">Ваш Telegram ID: <code style="background: #333; padding: 2px 8px; border-radius: 4px;">${telegramId}</code></p>
            </div>
        `;
    }

    // Initialize whitelist check (run on page load)
    async function initWhitelistCheck() {
        // DEV MODE BYPASS
        if (isDevMode) {
            console.warn('⚠️ RUNNING IN DEV MODE - TELEGRAM CHECK BYPASSED');
            telegramUser = {
                id: 777777,
                first_name: 'Dev',
                last_name: 'Admin',
                username: 'dev_admin',
                language_code: 'en'
            };
            hasWhitelistAccess = true;
            return true;
        }

        // Check if in Telegram
        if (!isInTelegram()) {
            showAccessDenied('Это приложение доступно только через Telegram.');
            return false;
        }

        telegramUser = getTelegramUser();
        if (!telegramUser || !telegramUser.id) {
            showAccessDenied('Не удалось получить данные пользователя Telegram.');
            return false;
        }

        // Check whitelist
        hasWhitelistAccess = await checkWhitelist(telegramUser.id);
        if (!hasWhitelistAccess) {
            showAccessDenied('Ваш аккаунт не активирован. Обратитесь к администратору.');
            return false;
        }

        // Expand WebApp
        if (window.Telegram.WebApp.expand) {
            window.Telegram.WebApp.expand();
        }

        console.log('✅ Whitelist access granted for:', telegramUser.id);
        return true;
    }

    // ========== SUPABASE AUTH (email/password) ==========

    function getClient() {
        return window.SupabaseClient ? window.SupabaseClient.get() : null;
    }

    // Check if user is logged in (AND verified)
    async function isLoggedIn() {
        if (!hasWhitelistAccess) return false;

        const supabase = getClient();
        if (!supabase) {
            const user = await getLocalUser();
            return user !== null && user.active === true;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const profile = await getProfile(user.id);
        return profile && profile.is_verified === true;
    }

    // Check if user is pending verification
    async function isPending() {
        if (!hasWhitelistAccess) return false;

        const supabase = getClient();
        if (!supabase) {
            const user = await getLocalUser();
            return user !== null && user.active === false;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const profile = await getProfile(user.id);
        return profile && profile.is_verified === false;
    }

    // Get user profile from database
    async function getProfile(userId) {
        const supabase = getClient();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    }

    // Register new user
    async function signUp(email, password) {
        if (!hasWhitelistAccess) return { success: false, error: 'No whitelist access' };

        const supabase = getClient();
        if (!supabase) {
            await cloudSet('aiboost_user', JSON.stringify({
                email: email,
                active: false,
                loggedAt: Date.now()
            }));
            return { success: true };
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) return { success: false, error: error.message };

        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                email: email,
                telegram_id: telegramUser?.id || null,
                is_verified: false
            });
        }

        return { success: true, user: data.user };
    }

    // Login user
    async function signIn(email, password) {
        if (!hasWhitelistAccess) return { success: false, error: 'No whitelist access' };

        const supabase = getClient();
        if (!supabase) {
            await cloudSet('aiboost_user', JSON.stringify({
                email: email,
                active: true,
                loggedAt: Date.now()
            }));
            updateUI();
            return { success: true };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) return { success: false, error: error.message };

        updateUI();
        return { success: true, user: data.user };
    }

    // Verify user (validate broker ID via Pocket Option API, then save)
    async function verify(brokerId) {
        if (!hasWhitelistAccess) return { success: false, error: 'No whitelist access' };

        // First, verify the ID via Pocket Option API
        try {
            const verifyUrl = window.POCKET_VERIFY_URL || 'https://uuwecropqwonevrdrstw.supabase.co/functions/v1/pocket-verify';

            const response = await fetch(verifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: brokerId })
            });

            const result = await response.json();

            if (!result.valid) {
                return { success: false, error: result.error || 'ID не прошёл проверку' };
            }
        } catch (apiError) {
            console.error('Pocket Option API error:', apiError);
            return { success: false, error: 'Ошибка проверки ID. Попробуйте позже.' };
        }

        // If API validation passed, save to database
        const supabase = getClient();
        if (!supabase) {
            const user = await getLocalUser();
            if (user) {
                user.active = true;
                user.brokerId = brokerId;
                await cloudSet('aiboost_user', JSON.stringify(user));
            }
            updateUI();
            return { success: true };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not logged in' };

        const { error } = await supabase
            .from('profiles')
            .update({ broker_id: brokerId, is_verified: true })
            .eq('id', user.id);

        if (error) return { success: false, error: error.message };

        updateUI();
        return { success: true };
    }

    // Logout user
    async function signOut() {
        const supabase = getClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        await cloudRemove('aiboost_user');
        updateUI();
        window.location.href = 'index.html';
    }

    // Get current user
    async function getCurrentUser() {
        const supabase = getClient();
        if (!supabase) return await getLocalUser();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const profile = await getProfile(user.id);
        return {
            id: user.id,
            email: user.email,
            active: profile?.is_verified || false,
            brokerId: profile?.broker_id || null,
            telegramId: profile?.telegram_id || telegramUser?.id || null
        };
    }

    async function getLocalUser() {
        const user = await cloudGet('aiboost_user');
        return user ? JSON.parse(user) : null;
    }

    // Update UI based on auth state
    function updateUI() {
        (async () => {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                document.body.classList.add('logged-in');
                document.body.classList.remove('logged-out');
            } else {
                document.body.classList.add('logged-out');
                document.body.classList.remove('logged-in');
            }
        })();
    }

    // Protect page - redirect if not logged in
    async function protectPage() {
        // First check whitelist
        if (!hasWhitelistAccess) {
            const hasAccess = await initWhitelistCheck();
            if (!hasAccess) return false;
        }

        const pending = await isPending();
        if (pending) {
            window.location.href = 'verification.html';
            return false;
        }
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            window.location.href = 'register.html';
            return false;
        }
        return true;
    }

    // Check verification page access
    async function checkVerificationAccess() {
        if (!hasWhitelistAccess) return false;

        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            window.location.href = 'index.html';
            return false;
        }
        const pending = await isPending();
        if (!pending) {
            window.location.href = 'register.html';
            return false;
        }
        return true;
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(async () => {
            const hasAccess = await initWhitelistCheck();
            if (hasAccess) {
                updateUI();
            }
        }, 100);
    });

    // Expose functions globally
    window.Auth = {
        // Whitelist
        initWhitelistCheck: initWhitelistCheck,
        isInTelegram: isInTelegram,
        getTelegramUser: () => telegramUser,
        hasAccess: () => hasWhitelistAccess,

        // Supabase Auth
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
        verify: verify,
        getCurrentUser: getCurrentUser,
        getProfile: getProfile,

        // Status checks
        isLoggedIn: isLoggedIn,
        isPending: isPending,

        // UI & protection
        updateUI: updateUI,
        protectPage: protectPage,
        checkVerificationAccess: checkVerificationAccess,

        // Dev tools
        enableDevMode: window.enableDevMode,
        disableDevMode: window.disableDevMode
    };
})();
