// Auth System for AI.BOOST
// Uses Supabase Auth for user authentication

(function () {
    let currentUser = null;
    let currentProfile = null;

    // Get Supabase client
    function getClient() {
        return window.SupabaseClient ? window.SupabaseClient.get() : null;
    }

    // Check if user is logged in (AND verified)
    async function isLoggedIn() {
        const supabase = getClient();
        if (!supabase) {
            // Fallback to localStorage if Supabase not configured
            const user = getLocalUser();
            return user !== null && user.active === true;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const profile = await getProfile(user.id);
        return profile && profile.is_verified === true;
    }

    // Check if user is pending verification
    async function isPending() {
        const supabase = getClient();
        if (!supabase) {
            const user = getLocalUser();
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

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    }

    // Register new user
    async function signUp(email, password) {
        const supabase = getClient();
        if (!supabase) {
            // Fallback to localStorage
            localStorage.setItem('aiboost_user', JSON.stringify({
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

        if (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }

        // Create profile record
        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                email: email,
                is_verified: false
            });
        }

        return { success: true, user: data.user };
    }

    // Login user
    async function signIn(email, password) {
        const supabase = getClient();
        if (!supabase) {
            // Fallback to localStorage
            localStorage.setItem('aiboost_user', JSON.stringify({
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

        if (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }

        updateUI();
        return { success: true, user: data.user };
    }

    // Verify user (save broker ID)
    async function verify(brokerId) {
        const supabase = getClient();
        if (!supabase) {
            // Fallback to localStorage
            const user = getLocalUser();
            if (user) {
                user.active = true;
                user.brokerId = brokerId;
                localStorage.setItem('aiboost_user', JSON.stringify(user));
            }
            updateUI();
            return { success: true };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not logged in' };

        const { error } = await supabase
            .from('profiles')
            .update({
                broker_id: brokerId,
                is_verified: true
            })
            .eq('id', user.id);

        if (error) {
            console.error('Verification error:', error);
            return { success: false, error: error.message };
        }

        updateUI();
        return { success: true };
    }

    // Logout user
    async function signOut() {
        const supabase = getClient();
        if (!supabase) {
            localStorage.removeItem('aiboost_user');
            updateUI();
            window.location.href = 'index.html';
            return;
        }

        await supabase.auth.signOut();
        localStorage.removeItem('aiboost_user');
        updateUI();
        window.location.href = 'index.html';
    }

    // Get current user
    async function getCurrentUser() {
        const supabase = getClient();
        if (!supabase) {
            return getLocalUser();
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const profile = await getProfile(user.id);
        return {
            id: user.id,
            email: user.email,
            active: profile?.is_verified || false,
            brokerId: profile?.broker_id || null
        };
    }

    // Get local user (fallback)
    function getLocalUser() {
        const user = localStorage.getItem('aiboost_user');
        return user ? JSON.parse(user) : null;
    }

    // Update UI based on auth state
    function updateUI() {
        // Check async status
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

    // Legacy functions for backward compatibility
    function login(email) {
        localStorage.setItem('aiboost_user', JSON.stringify({
            email: email,
            active: false,
            loggedAt: Date.now()
        }));
        updateUI();
    }

    function activate() {
        const user = getLocalUser();
        if (user) {
            user.active = true;
            localStorage.setItem('aiboost_user', JSON.stringify(user));
            updateUI();
        }
    }

    function logout() {
        signOut();
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        updateUI();
    });

    // Expose functions globally
    window.Auth = {
        // New Supabase functions
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
        verify: verify,
        getCurrentUser: getCurrentUser,
        getProfile: getProfile,

        // Async status checks
        isLoggedIn: isLoggedIn,
        isPending: isPending,

        // UI functions
        updateUI: updateUI,
        protectPage: protectPage,
        checkVerificationAccess: checkVerificationAccess,

        // Legacy functions (backward compatibility)
        login: login,
        activate: activate,
        logout: logout
    };
})();
