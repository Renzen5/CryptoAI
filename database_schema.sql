-- Telegram Whitelist Schema for AI.BOOST
-- Run this in Supabase SQL Editor

-- Drop old auth if exists (we're replacing with Telegram)
-- Note: Keep profiles table but add telegram_id

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

-- Allow authenticated users to read whitelist (for checking access)
CREATE POLICY "anon_can_read_whitelist" ON telegram_whitelist
  FOR SELECT USING (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_whitelist_telegram_id ON telegram_whitelist(telegram_id);
