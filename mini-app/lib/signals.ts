import { supabase, createServerSupabaseClient } from './supabase';
import { Signal, SignalResult, CurrencyPair } from '@/types';

// Database signal type
export interface DBSignal {
    id: string;
    user_id: string;
    pair: string;
    pair_symbol: string | null;
    direction: 'UP' | 'DOWN';
    timeframe: number;
    accuracy: number;
    result: SignalResult | null;
    ai_reason: string | null;
    entry_price: number | null;
    exit_price: number | null;
    entry_time: string | null;
    expiry_time: string | null;
    created_at: string;
}

// Convert DB signal to app signal
function dbToAppSignal(dbSignal: DBSignal, pairs: CurrencyPair[]): Signal {
    const pair = pairs.find(p => p.name === dbSignal.pair) || {
        id: 'unknown',
        name: dbSignal.pair,
        symbol: dbSignal.pair_symbol || dbSignal.pair,
        flag1: '🏳️',
        flag2: '🏳️',
    };

    return {
        id: dbSignal.id,
        userId: dbSignal.user_id,
        pair,
        direction: dbSignal.direction,
        timeframe: dbSignal.timeframe,
        accuracy: dbSignal.accuracy,
        result: dbSignal.result || undefined,
        aiReason: dbSignal.ai_reason || undefined,
        entryTime: dbSignal.entry_time || dbSignal.created_at,
        expiryTime: dbSignal.expiry_time || dbSignal.created_at,
        createdAt: dbSignal.created_at,
    };
}

/**
 * Save a new signal to the database
 */
export async function saveSignal(signal: {
    userId: string;
    pair: CurrencyPair;
    direction: 'UP' | 'DOWN';
    timeframe: number;
    accuracy: number;
    aiReason?: string;
    entryTime?: string;
    expiryTime?: string;
}): Promise<DBSignal | null> {
    try {
        const { data, error } = await supabase
            .from('signals')
            .insert({
                user_id: signal.userId,
                pair: signal.pair.name,
                pair_symbol: signal.pair.symbol,
                direction: signal.direction,
                timeframe: signal.timeframe,
                accuracy: signal.accuracy,
                ai_reason: signal.aiReason,
                entry_time: signal.entryTime,
                expiry_time: signal.expiryTime,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving signal:', error);
            return null;
        }

        return data as DBSignal;
    } catch (error) {
        console.error('Error saving signal:', error);
        return null;
    }
}

/**
 * Get signal history for a user
 */
export async function getSignalHistory(
    userId: string,
    limit: number = 50
): Promise<DBSignal[]> {
    try {
        const { data, error } = await supabase
            .from('signals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching signal history:', error);
            return [];
        }

        return (data as DBSignal[]) || [];
    } catch (error) {
        console.error('Error fetching signal history:', error);
        return [];
    }
}

/**
 * Get all signals (for demo purposes when no user ID)
 */
export async function getAllSignals(limit: number = 50): Promise<DBSignal[]> {
    try {
        const { data, error } = await supabase
            .from('signals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching all signals:', error);
            return [];
        }

        return (data as DBSignal[]) || [];
    } catch (error) {
        console.error('Error fetching all signals:', error);
        return [];
    }
}

/**
 * Update signal result
 */
export async function updateSignalResult(
    signalId: string,
    result: SignalResult,
    exitPrice?: number
): Promise<boolean> {
    try {
        const updateData: Record<string, unknown> = { result };
        if (exitPrice !== undefined) {
            updateData.exit_price = exitPrice;
        }

        const { error } = await supabase
            .from('signals')
            .update(updateData)
            .eq('id', signalId);

        if (error) {
            console.error('Error updating signal result:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating signal result:', error);
        return false;
    }
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<{
    total: number;
    wins: number;
    losses: number;
    winRate: number;
}> {
    try {
        const { data, error } = await supabase
            .from('signals')
            .select('result')
            .eq('user_id', userId)
            .not('result', 'is', null);

        if (error || !data) {
            return { total: 0, wins: 0, losses: 0, winRate: 0 };
        }

        const total = data.length;
        const wins = data.filter(s => s.result === 'WIN').length;
        const losses = data.filter(s => s.result === 'LOSE').length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        return { total, wins, losses, winRate };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { total: 0, wins: 0, losses: 0, winRate: 0 };
    }
}

/**
 * Delete signal (for admins or signal cancellation)
 */
export async function deleteSignal(signalId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('signals')
            .delete()
            .eq('id', signalId);

        if (error) {
            console.error('Error deleting signal:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting signal:', error);
        return false;
    }
}
