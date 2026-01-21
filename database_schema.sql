-- Telegram Whitelist Schema for AI.BOOST
-- Run this in Supabase SQL Editor

-- Telegram whitelist table
CREATE TABLE IF NOT EXISTS telegram_whitelist (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  added_by BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update profiles to link with Telegram
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

-- Enable RLS
ALTER TABLE telegram_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read whitelist (for access check)
DROP POLICY IF EXISTS "anon_can_read_whitelist" ON telegram_whitelist;
CREATE POLICY "anon_can_read_whitelist" ON telegram_whitelist
  FOR SELECT USING (true);

-- Policy: Allow INSERT for service role (bot uses service key)
DROP POLICY IF EXISTS "service_can_insert_whitelist" ON telegram_whitelist;
CREATE POLICY "service_can_insert_whitelist" ON telegram_whitelist
  FOR INSERT WITH CHECK (true);

-- Policy: Allow UPDATE for service role
DROP POLICY IF EXISTS "service_can_update_whitelist" ON telegram_whitelist;
CREATE POLICY "service_can_update_whitelist" ON telegram_whitelist
  FOR UPDATE USING (true);

-- Policy: Allow DELETE for service role  
DROP POLICY IF EXISTS "service_can_delete_whitelist" ON telegram_whitelist;
CREATE POLICY "service_can_delete_whitelist" ON telegram_whitelist
  FOR DELETE USING (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_whitelist_telegram_id ON telegram_whitelist(telegram_id);
