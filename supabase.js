// Supabase Client Initialization
// This file creates and exports the Supabase client for use across the application

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) return supabaseClient;

    if (typeof SUPABASE_CONFIG === 'undefined' ||
        SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.error('❌ Supabase not configured! Please edit config.js');
        return null;
    }

    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });

    console.log('✅ Supabase client initialized');
    return supabaseClient;
}

// Get Supabase client
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Export for use in other scripts
window.SupabaseClient = {
    init: initSupabase,
    get: getSupabase
};
