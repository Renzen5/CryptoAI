-- ============================================
-- AI Trade Supabase RLS Policies
-- Migration: 002_rls_policies
-- ============================================

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- Users can only view their own data
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (
        -- Allow if telegram_id matches the request header
        telegram_id = current_setting('request.headers', true)::json->>'x-telegram-id'
        -- Or for service role (backend)
        OR auth.role() = 'service_role'
        -- Or for authenticated users viewing public data
        OR TRUE  -- Temporarily allow all reads for development
    );

-- Only service role can insert/update users
CREATE POLICY "Service role can manage all users"
    ON users FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous inserts (for bot registrations)
CREATE POLICY "Anyone can insert users"
    ON users FOR INSERT
    WITH CHECK (TRUE);

-- ============================================
-- SIGNALS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own signals" ON signals;
DROP POLICY IF EXISTS "Users can insert their own signals" ON signals;
DROP POLICY IF EXISTS "Users can update their own signals" ON signals;
DROP POLICY IF EXISTS "Service role full access on signals" ON signals;

-- Users can only view their own signals
CREATE POLICY "Users can view their own signals"
    ON signals FOR SELECT
    USING (
        user_telegram_id = current_setting('request.headers', true)::json->>'x-telegram-id'
        OR auth.role() = 'service_role'
        OR TRUE  -- Temporarily allow all reads for development
    );

-- Users can insert their own signals
CREATE POLICY "Users can insert their own signals"
    ON signals FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role'
        OR TRUE  -- Temporarily allow all inserts for development
    );

-- Users can update their own signals
CREATE POLICY "Users can update their own signals"
    ON signals FOR UPDATE
    USING (
        user_telegram_id = current_setting('request.headers', true)::json->>'x-telegram-id'
        OR auth.role() = 'service_role'
        OR TRUE  -- Temporarily allow all updates for development
    );

-- Service role has full access
CREATE POLICY "Service role full access on signals"
    ON signals FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- CHAT MESSAGES TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role full access on chat_messages" ON chat_messages;

-- Users can only view their own messages
CREATE POLICY "Users can view their own messages"
    ON chat_messages FOR SELECT
    USING (
        user_telegram_id = current_setting('request.headers', true)::json->>'x-telegram-id'
        OR auth.role() = 'service_role'
        OR TRUE  -- Temporarily allow all reads for development
    );

-- Users can insert messages
CREATE POLICY "Users can insert their own messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role'
        OR TRUE  -- Temporarily allow all inserts for development
    );

-- Service role has full access
CREATE POLICY "Service role full access on chat_messages"
    ON chat_messages FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- NOTES
-- ============================================
-- 
-- IMPORTANT: For production, remove the "OR TRUE" conditions
-- and implement proper authentication:
--
-- Option 1: Use custom claims in Supabase Auth
-- Option 2: Pass telegram_id in request headers
-- Option 3: Use service role key for all backend operations
--
-- Example of stricter policy:
-- CREATE POLICY "Users can view their own signals"
--     ON signals FOR SELECT
--     USING (
--         user_telegram_id = (auth.jwt() ->> 'telegram_id')
--         OR auth.role() = 'service_role'
--     );
