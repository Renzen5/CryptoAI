-- ============================================
-- AI Trade Supabase Helper Functions
-- Migration: 003_functions
-- ============================================

-- ============================================
-- GET USER STATS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_telegram_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_signals', COUNT(*),
        'wins', COUNT(*) FILTER (WHERE result = 'WIN'),
        'losses', COUNT(*) FILTER (WHERE result = 'LOSE'),
        'neutrals', COUNT(*) FILTER (WHERE result = 'NEUTRAL'),
        'cancelled', COUNT(*) FILTER (WHERE result = 'CANCEL'),
        'win_rate', CASE 
            WHEN COUNT(*) FILTER (WHERE result IN ('WIN', 'LOSE')) > 0 
            THEN ROUND(
                COUNT(*) FILTER (WHERE result = 'WIN')::NUMERIC / 
                COUNT(*) FILTER (WHERE result IN ('WIN', 'LOSE'))::NUMERIC * 100
            )
            ELSE 0 
        END,
        'avg_accuracy', ROUND(AVG(accuracy)),
        'favorite_pair', (
            SELECT pair FROM signals 
            WHERE user_telegram_id = p_telegram_id 
            GROUP BY pair 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        )
    ) INTO result
    FROM signals
    WHERE user_telegram_id = p_telegram_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET GLOBAL STATS FUNCTION (FOR ADMINS)
-- ============================================
CREATE OR REPLACE FUNCTION get_global_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'whitelisted_users', (SELECT COUNT(*) FROM users WHERE is_whitelisted = TRUE),
        'total_signals', (SELECT COUNT(*) FROM signals),
        'total_wins', (SELECT COUNT(*) FROM signals WHERE result = 'WIN'),
        'total_losses', (SELECT COUNT(*) FROM signals WHERE result = 'LOSE'),
        'global_win_rate', (
            SELECT CASE 
                WHEN COUNT(*) FILTER (WHERE result IN ('WIN', 'LOSE')) > 0 
                THEN ROUND(
                    COUNT(*) FILTER (WHERE result = 'WIN')::NUMERIC / 
                    COUNT(*) FILTER (WHERE result IN ('WIN', 'LOSE'))::NUMERIC * 100
                )
                ELSE 0 
            END
            FROM signals
        ),
        'signals_today', (
            SELECT COUNT(*) FROM signals 
            WHERE created_at >= CURRENT_DATE
        ),
        'chat_messages_today', (
            SELECT COUNT(*) FROM chat_messages 
            WHERE created_at >= CURRENT_DATE
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CHECK WHITELIST FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION check_whitelist(p_telegram_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE telegram_id = p_telegram_id 
        AND is_whitelisted = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADD TO WHITELIST FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION add_to_whitelist(p_identifier TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user RECORD;
    v_identifier TEXT;
BEGIN
    -- Remove @ if present
    v_identifier := LTRIM(p_identifier, '@');
    
    -- Try to find by username first, then by telegram_id
    SELECT * INTO v_user FROM users 
    WHERE username = v_identifier OR telegram_id = v_identifier
    LIMIT 1;
    
    IF v_user IS NULL THEN
        -- Create new user with just telegram_id
        INSERT INTO users (telegram_id, is_whitelisted)
        VALUES (v_identifier, TRUE);
        RETURN v_identifier;
    ELSE
        -- Update existing user
        UPDATE users SET is_whitelisted = TRUE 
        WHERE id = v_user.id;
        RETURN COALESCE(v_user.username, v_user.telegram_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REMOVE FROM WHITELIST FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION remove_from_whitelist(p_identifier TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user RECORD;
    v_identifier TEXT;
BEGIN
    v_identifier := LTRIM(p_identifier, '@');
    
    SELECT * INTO v_user FROM users 
    WHERE username = v_identifier OR telegram_id = v_identifier
    LIMIT 1;
    
    IF v_user IS NULL THEN
        RETURN NULL;
    ELSE
        UPDATE users SET is_whitelisted = FALSE 
        WHERE id = v_user.id;
        RETURN COALESCE(v_user.username, v_user.telegram_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLEANUP OLD CHAT MESSAGES FUNCTION
-- Keeps only last 100 messages per user
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH ranked_messages AS (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY user_telegram_id 
            ORDER BY created_at DESC
        ) as rn
        FROM chat_messages
    )
    DELETE FROM chat_messages
    WHERE id IN (
        SELECT id FROM ranked_messages WHERE rn > 100
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_stats(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_global_stats() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_whitelist(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_to_whitelist(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION remove_from_whitelist(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_chat_messages() TO service_role;
