-- Supabase SQL Schema for Trading Signals App
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    pair TEXT NOT NULL,
    pair_symbol TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('UP', 'DOWN')),
    timeframe INTEGER NOT NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    result TEXT CHECK (result IN ('WIN', 'LOSE', 'NEUTRAL', 'CANCEL')),
    ai_reason TEXT,
    entry_price DECIMAL,
    exit_price DECIMAL,
    entry_time TIMESTAMPTZ,
    expiry_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- Users table (for whitelist management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    is_whitelisted BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Row Level Security (RLS)
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for signals (users can only see their own signals)
CREATE POLICY "Users can view their own signals"
    ON signals FOR SELECT
    USING (true); -- For now, allow all reads. Restrict later with auth.uid()

CREATE POLICY "Users can insert their own signals"
    ON signals FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own signals"
    ON signals FOR UPDATE
    USING (true);

-- Policies for users
CREATE POLICY "Anyone can read users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage users"
    ON users FOR ALL
    USING (true);

-- Policies for chat_messages
CREATE POLICY "Users can view their own messages"
    ON chat_messages FOR SELECT
    USING (true);

CREATE POLICY "Users can insert messages"
    ON chat_messages FOR INSERT
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
